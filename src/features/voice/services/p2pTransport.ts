import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../../../app/providers/firebase';
import { createLogger } from '../../../shared/logging';

const log = createLogger('P2PTransport');
const STALE_PEER_MS = 60_000; // prune peers older than 60s

export type P2PTransport = {
  join: (channel: string, userId: string) => Promise<void>;
  leave: () => Promise<void>;
  muteLocal: (mute: boolean) => Promise<void>;
  getRemoteStream: () => MediaStream | null;
};

// Helper to get audio-only stream
const getAudioStream = async (): Promise<MediaStream> => {
  const stream = await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  return stream as MediaStream;
};

export const createP2PTransport = (
  onStateChange?: (state: {
    connectionState?: string;
    iceConnectionState?: string;
    peerId?: string;
  }) => void,
  onRemoteStream?: (stream: MediaStream | null) => void
): P2PTransport => {
  type PeerConn = {
    pc: RTCPeerConnection;
    iceSeen: Set<string>;
    remoteSeen: Set<string>;
    hasLocalOffer: boolean;
    hasLocalAnswer: boolean;
    hasRemoteOffer: boolean;
    hasRemoteAnswer: boolean;
    handlers: {
      ice?: (event: any) => void;
      conn?: () => void;
      iceConn?: () => void;
      track?: (event: any) => void;
    };
  };

  let connections = new Map<string, PeerConn>();
  let localStream: MediaStream | null = null;
  let remoteStream: MediaStream | null = null;
  let unsubPeers: (() => void) | null = null;
  let currentChannel: string | null = null;
  let selfId: string | null = null;

  const candidateKey = (c: any) =>
    `${c?.sdpMid || ''}:${c?.sdpMLineIndex || ''}:${c?.candidate}`;

  const cleanup = async () => {
    if (unsubPeers) {
      unsubPeers();
      unsubPeers = null;
    }
    connections.forEach(({ pc, handlers }) => {
      if (handlers.ice) (pc as any).onicecandidate = null;
      if (handlers.conn) (pc as any).onconnectionstatechange = null;
      if (handlers.iceConn) (pc as any).oniceconnectionstatechange = null;
      if (handlers.track) (pc as any).ontrack = null;
      pc.close();
    });
    connections.clear();
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      localStream = null;
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t) => t.stop());
      remoteStream = null;
      onRemoteStream?.(null);
    }
    currentChannel = null;
    selfId = null;
  };

  const leave = async () => {
    if (currentChannel && selfId) {
      const peerRef = doc(
        collection(firestore, 'p2pSessions', currentChannel, 'peers'),
        selfId
      );
      await deleteDoc(peerRef).catch(() => undefined);
    }
    await cleanup();
  };

  const muteLocal = async (mute: boolean) => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !mute));
  };

  const join = async (channel: string, userId: string) => {
    await cleanup();
    currentChannel = channel;
    selfId = userId;

    const peersCol = collection(firestore, 'p2pSessions', channel, 'peers');
    const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    localStream = await getAudioStream();

    // Create own peer doc
    const selfRef = doc(peersCol, userId);
    await setDoc(selfRef, {
      userId,
      updatedAt: serverTimestamp(),
      offers: {},
      answers: {},
      ice: {},
    });

    const ensurePcForPeer = (peerId: string) => {
      if (connections.has(peerId)) return connections.get(peerId)!;
      const pc = new RTCPeerConnection(config);
      localStream?.getTracks().forEach((t) => pc.addTrack(t, localStream!));
      const iceSeen = new Set<string>();
      const remoteSeen = new Set<string>();
      const stateFlags = {
        hasLocalOffer: false,
        hasLocalAnswer: false,
        hasRemoteOffer: false,
        hasRemoteAnswer: false,
      };
      const handlers: PeerConn['handlers'] = {};

      handlers.ice = async (event: any) => {
        if (!event.candidate || !currentChannel || !selfId) return;
        const candidate = event.candidate.toJSON();
        const key = candidateKey(candidate);
        if (iceSeen.has(key)) return;
        iceSeen.add(key);
        const peerIcePath = doc(peersCol, selfId);
        await updateDoc(peerIcePath, {
          [`ice.${peerId}`]: arrayUnion(candidate),
          updatedAt: serverTimestamp(),
        }).catch((error) => log.error('Failed to write ICE', { error }));
      };
      (pc as any).onicecandidate = handlers.ice;

      handlers.conn = () => {
        onStateChange?.({ connectionState: pc.connectionState, peerId });
      };
      (pc as any).onconnectionstatechange = handlers.conn;

      handlers.iceConn = () => {
        onStateChange?.({ iceConnectionState: pc.iceConnectionState, peerId });
      };
      (pc as any).oniceconnectionstatechange = handlers.iceConn;

      handlers.track = (event: any) => {
        if (!remoteStream)
          remoteStream = event.streams?.[0] || new MediaStream();
        if (event.streams?.[0]) {
          event.streams[0].getTracks().forEach((track: any) => {
            if (!remoteStream) return;
            const already = remoteStream
              .getTracks()
              .find((t) => t.id === track.id);
            if (!already) remoteStream.addTrack(track);
          });
        }
        onRemoteStream?.(remoteStream || null);
      };
      (pc as any).ontrack = handlers.track;

      const record: PeerConn = {
        pc,
        iceSeen,
        remoteSeen,
        handlers,
        ...stateFlags,
      };
      connections.set(peerId, record);
      return record;
    };

    const connectAsOfferer = async (peerId: string) => {
      const { pc } = ensurePcForPeer(peerId);
      const rec = connections.get(peerId)!;
      if (rec.hasLocalOffer) return;
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);
      await updateDoc(selfRef, {
        [`offers.${peerId}`]: {
          sdp: offer.sdp,
          type: offer.type,
        },
        updatedAt: serverTimestamp(),
      });
      rec.hasLocalOffer = true;
    };

    const handleRemoteUpdate = async (peerId: string, data: any) => {
      const peerRec = ensurePcForPeer(peerId);
      const { pc, remoteSeen, iceSeen } = peerRec;

      const offer = data?.offers?.[selfId || ''];
      const answer = data?.answers?.[selfId || ''];
      const iceList = data?.ice?.[selfId || ''];

      if (offer && !peerRec.hasRemoteOffer) {
        // Only set remote offer if we are not already in a stable/offer-made state
        if (
          pc.signalingState === 'stable' ||
          pc.signalingState === 'have-local-offer'
        ) {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ sdp: offer.sdp, type: offer.type })
          );
          peerRec.hasRemoteOffer = true;
        }

        // Only answer if we successfully set the remote offer and have not answered yet
        if (
          peerRec.hasRemoteOffer &&
          !peerRec.hasLocalAnswer &&
          pc.signalingState === 'have-remote-offer'
        ) {
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          await updateDoc(doc(peersCol, selfId!), {
            [`answers.${peerId}`]: { sdp: ans.sdp, type: ans.type },
            updatedAt: serverTimestamp(),
          });
          peerRec.hasLocalAnswer = true;
        }
      }

      if (
        answer &&
        pc.localDescription?.type === 'offer' &&
        !peerRec.hasRemoteAnswer
      ) {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ sdp: answer.sdp, type: answer.type })
          );
          peerRec.hasRemoteAnswer = true;
        }
      }

      if (iceList) {
        for (const c of iceList) {
          const key = candidateKey(c);
          if (remoteSeen.has(key)) continue;
          remoteSeen.add(key);
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (err) {
            log.error('Failed to add remote ICE', { err });
          }
        }
      }

      // If we have no offer yet for this peer and they don't target us, start one
      if (!peerRec.hasLocalOffer && shouldOfferFirst(peerId)) {
        await connectAsOfferer(peerId);
      }
    };

    const pruneStalePeers = async () => {
      const peers = await getDocs(peersCol);
      for (const snap of peers.docs) {
        const data = snap.data();
        const updated = data?.updatedAt?.toMillis?.() ?? 0;
        if (updated && Date.now() - updated > STALE_PEER_MS) {
          await deleteDoc(doc(peersCol, snap.id)).catch(() => undefined);
        }
      }
      return peers;
    };

    const peersSnapshot = await pruneStalePeers();

    const shouldOfferFirst = (peerId: string) => {
      if (!selfId) return false;
      return selfId < peerId; // simple deterministic tie-breaker
    };

    // Kick off by offering to existing peers we "win" against
    for (const snap of peersSnapshot.docs) {
      if (snap.id === userId) continue;
      if (shouldOfferFirst(snap.id)) {
        await connectAsOfferer(snap.id);
      }
    }

    // Listen to peers collection for offers/answers/ice
    unsubPeers = onSnapshot(peersCol, (peerSnaps) => {
      peerSnaps.forEach((peerDoc) => {
        if (peerDoc.id === selfId) return;
        const data = peerDoc.data();
        const updated = data?.updatedAt?.toMillis?.() ?? 0;
        if (updated && Date.now() - updated > STALE_PEER_MS) {
          return; // ignore stale peers
        }
        handleRemoteUpdate(peerDoc.id, data).catch((err) =>
          log.error('Peer update failed', { err })
        );
      });
    });
  };

  return {
    join,
    leave,
    muteLocal,
    getRemoteStream: () => remoteStream,
  };
};

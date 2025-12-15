import { useCallback } from 'react';
import { useAppStore } from '../../../app/state';
import userService from '../../../services/userService';

export const useModerationActions = () => {
  const { blockUser, muteUser } = useAppStore();

  const handleBlock = useCallback(
    async (currentUserId: string, targetId: string) => {
      await userService.blockUser(currentUserId, targetId);
      blockUser(targetId);
    },
    [blockUser]
  );

  const handleMute = useCallback(
    async (currentUserId: string, targetId: string) => {
      await userService.muteUser(currentUserId, targetId);
      muteUser(targetId);
    },
    [muteUser]
  );

  const handleReport = useCallback(
    async (
      targetId: string,
      reporterUserId: string,
      channel: string,
      reason: string
    ) => {
      await userService.reportUser({
        reportedUserId: targetId,
        reporterUserId,
        channel,
        reason,
      });
    },
    []
  );

  return {
    blockRemoteUser: handleBlock,
    muteRemoteUser: handleMute,
    reportRemoteUser: handleReport,
  };
};

export default useModerationActions;

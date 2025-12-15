import { firestore } from '../../../app/providers/firebase';
import { createNearbyService } from './createNearbyService';

export const nearbyService = createNearbyService({ firestore });

export type { NearbyService } from './createNearbyService';

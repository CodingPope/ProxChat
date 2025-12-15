import { LocationObject } from 'expo-location';

export const calculateDistance = (location1: LocationObject, location2: LocationObject): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const lat1 = location1.coords.latitude;
    const lon1 = location1.coords.longitude;
    const lat2 = location2.coords.latitude;
    const lon2 = location2.coords.longitude;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
};

export const isWithinProximity = (userLocation: LocationObject, targetLocation: LocationObject, radius: number): boolean => {
    const distance = calculateDistance(userLocation, targetLocation);
    return distance <= radius;
};
import {
  calculateDistance,
  encodeGeohash,
  getChannelNameFromGeohash,
  getZoneDisplayName,
  isLocationInZone,
} from '../geohash';

describe('geohash utilities', () => {
  it('encodes coordinates consistently and uses the channel prefix', () => {
    const geohash = encodeGeohash(37.7749, -122.4194);

    expect(geohash).toBeDefined();
    expect(getChannelNameFromGeohash(geohash)).toContain('general_');
  });

  it('calculates approximate distances in meters', () => {
    const distance = calculateDistance(34.0522, -118.2437, 36.1699, -115.1398);

    // Los Angeles to Las Vegas is ~368km
    expect(distance).toBeGreaterThan(360000);
    expect(distance).toBeLessThan(380000);
  });

  it('can determine if a location is inside a circular zone', () => {
    const centerLat = 37.7749;
    const centerLon = -122.4194;
    const nearbyLat = 37.7750;
    const nearbyLon = -122.4195;

    expect(isLocationInZone(centerLat, centerLon, centerLat, centerLon, 10)).toBe(
      true
    );
    expect(
      isLocationInZone(centerLat, centerLon, nearbyLat, nearbyLon, 50)
    ).toBe(true);
    expect(
      isLocationInZone(centerLat, centerLon, nearbyLat, nearbyLon, 1)
    ).toBe(false);
  });

  it('returns a fallback display name when no geohash exists', () => {
    expect(getZoneDisplayName(null)).toBe('Connecting...');
    expect(getZoneDisplayName('9q8yy')).toBe('General');
  });
});

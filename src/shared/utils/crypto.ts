import * as Crypto from 'expo-crypto';

/**
 * Hash a passcode using SHA-256 for client-side verification and rules checks.
 */
export const hashPasscode = async (passcode: string): Promise<string> => {
  const normalized = passcode.trim();
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalized
  );
};

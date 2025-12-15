require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Agora credentials from environment variables
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Token expiration time (24 hours in seconds)
const TOKEN_EXPIRY_SECONDS = 86400;

/**
 * Generate Agora RTC token
 * POST /api/agora/token
 * Body: { userId: string, channelName: string }
 * Returns: { token: string }
 */
app.post('/api/agora/token', (req, res) => {
  try {
    const { userId, channelName } = req.body;

    // Validate input
    if (!userId || !channelName) {
      return res.status(400).json({
        error: 'Missing required fields: userId and channelName',
      });
    }

    // Validate Agora credentials
    if (!APP_ID || !APP_CERTIFICATE) {
      console.error('Agora credentials not configured');
      return res.status(500).json({
        error: 'Server configuration error',
      });
    }

    // Current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Token expiration time
    const privilegeExpiredTs = currentTimestamp + TOKEN_EXPIRY_SECONDS;

    // Generate UID from userId (hash to number)
    const uid = generateUidFromUserId(userId);

    // Build the token with RTC role as publisher (can send and receive audio)
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    console.log(`Token generated for user ${userId} in channel ${channelName}`);

    res.json({
      token,
      uid,
      channelName,
      expiresAt: privilegeExpiredTs,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      error: 'Failed to generate token',
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Generate a numeric UID from a string userId
 * Agora requires numeric UIDs
 */
function generateUidFromUserId(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Ensure positive number and within valid range
  return Math.abs(hash) % 100000000;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ProxChat Token Server running on port ${PORT}`);
  console.log(`📍 Token endpoint: POST /api/agora/token`);
  console.log(`❤️  Health check: GET /health`);
});

module.exports = app;

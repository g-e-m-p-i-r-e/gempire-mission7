// Game configuration
export const GAME_CONFIG = {
  // Your registered game address
  GAME_ADDRESS: '0x09504A250Aa51930c45C5480CcFd76c56121b9c9',

  // Game settings
  SCORE_SUBMISSION: {
    // Submit score every X points
    SCORE_THRESHOLD: 100000,

    // Track transactions (actions that cost points/tokens)
    TRANSACTION_THRESHOLD: 100,
  },

  // Game metadata
  METADATA: {
    name: 'Gempire Hub',
    url: 'https://game.gempire.app',
    image: 'https://files.gempire.app/logo.png',
  },
} as const;

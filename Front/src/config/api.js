export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.stechpro.ai/api',
  TIMEOUT: 20000,
  ENDPOINTS: {
    //Auth
    CHECK_USER_EXISTS: '/auth/check-user-exists',
    CHECK_USERNAME: '/auth/check-username',
    CREATE_PROFILE: '/auth/create-profile',
    FIND_EMAIL: '/auth/find-email',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh-token',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_RESET_CODE: '/auth/send-reset-code',
    SIGNUP: '/auth/signup',
    VERIFY_PASSWORD: '/auth/verify-password',
    VERIFY_TEAM_CODE: '/auth/verify-team-code',
    VERIFY_TOKEN: '/auth/verify-token',
    GET_USER_HIGHLIGHTS: '/auth/highlights',

    UPLOAD_VIDEO: '/video/upload',
    JSON_EX: '/player/analyze-game-data',
    DELETE_VIDEOS: '/videoupload',

    
    GET_GAMES_BY_TEAM: '/game/team',
  },
};

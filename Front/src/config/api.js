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


    //video upload
    UPLOAD_VIDEO: '/video/upload',
    JSON_EX: '/player/analyze-game-data',
    DELETE_VIDEOS: '/videoupload',

    //game
    GET_GAMES_BY_TEAM: '/game/team',
    GET_CLIPS_BY_TEAM: '/game/clips',
    GET_PLAYER_HIGHLIGHTS: '/game/highlights/player',
    GET_COACH_HIGHLIGHTS: '/game/highlights/coach',
    DELETE_GAMES: '/game',
    //Team
    GET_TEAM_TOTAL_STATS: '/team/total-stats',
    GET_TEAM_STATS_BY_KEY: '/team/stats',
    //Player
    GET_PLAYER_RANKINGS: '/player/rankings',

    //Video Upload
    PREPARE_MATCH_UPLOAD: '/game/prepare-match-upload',
    COMPLETE_MATCH_UPLOAD: '/game/complete-match-upload',
  
    //Notification
    NOTI_LIST: '/notifications',
    NOTI_READ_ALL: '/notifications/read-all',
    NOTI_UNREAD_COUNT: '/notifications/unread-count',
  },
};

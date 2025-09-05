import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3002');
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

export const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage?.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage?.removeItem('authToken');
      localStorage?.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods for authentication
export const authAPI = {
  login: ({ emailOrUsername, password }: { emailOrUsername: string; password: string }) =>
    api.post('/api/auth/login', { emailOrUsername, password }),

  register: (data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => api.post('/api/auth/register', data),  me: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};

// API methods for picks
export const picksApi = {
  getWeeklyGames: (week: number, season: number) =>
    api.get(`/api/v1/picks/games/week/${week}?season=${season}`),
  
  getUserPicks: (week: number, season: number) =>
    api.get(`/api/v1/picks/week/${week}?season=${season}`),
  
  submitPick: (gameId: string, teamId: string) =>
    api.post('/api/v1/picks', { gameId, selectedTeamId: teamId }),
  
  submitBulkPicks: (picks: Array<{ gameId: string; teamId: string }>) =>
    api.post('/api/v1/picks/bulk', { picks }),
  
  getLeaderboard: (week?: number, season?: number) => {
    const params = new URLSearchParams();
    if (week) params.append('week', week.toString());
    if (season) params.append('season', season.toString());
    return api.get(`/api/v1/picks/leaderboard/week/${week || 1}?${params.toString()}`);
  },
};

// API methods for admin (RSS feeds, schedule sync)
export const adminApi = {
  syncSchedule: (week: number, season: number) =>
    api.post(`/api/admin/rss/schedule/sync`, { week, season }),
  
  syncScores: (week: number, season: number) =>
    api.post(`/api/admin/rss/scores/sync`, { week, season }),
  
  getSchedule: (week: number, season: number) =>
    api.get(`/api/admin/rss/schedule?week=${week}&season=${season}`),
};

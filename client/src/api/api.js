import api from './axios.js';

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const profileApi = {
  update:         (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
};

import api from './axios.js';

export const authApi = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  logout:        ()     => api.post('/auth/logout'),
  refresh:       ()     => api.post('/auth/refresh'),
  getMe:         ()     => api.get('/auth/me'),
  getUsers:      ()     => api.get('/auth/users'),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

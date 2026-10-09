import api from './axios.js';

export const authApi = {
  getCaptcha:      ()           => api.get('/auth/captcha'),
  sendRegisterOtp: (data)       => api.post('/auth/send-register-otp', data),
  register:        (data)       => api.post('/auth/register', data),
  sendLoginOtp:    (data)       => api.post('/auth/send-login-otp', data),
  loginOtp:        (data)       => api.post('/auth/login-otp', data),
  login:           (data)       => api.post('/auth/login', data),
  logout:          ()           => api.post('/auth/logout'),
  refresh:         ()           => api.post('/auth/refresh'),
  getMe:           ()           => api.get('/auth/me'),
  getUsers:        ()           => api.get('/auth/users'),
  forgotPassword:  (data)       => api.post('/auth/forgot-password', data),
  resetPassword:   (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

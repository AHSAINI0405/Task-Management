import api from './axios.js';

export const eventsApi = {
  getAll:      (params) => api.get('/events', { params }),
  getUpcoming: ()       => api.get('/events/upcoming'),
  getOne:      (id)     => api.get(`/events/${id}`),
  create:      (data)   => api.post('/events', data),
  update:      (id, data) => api.put(`/events/${id}`, data),
  delete:      (id)     => api.delete(`/events/${id}`),
};

export const remindersApi = {
  getAll:  (params)     => api.get('/reminders', { params }),
  create:  (data)       => api.post('/reminders', data),
  update:  (id, data)   => api.put(`/reminders/${id}`, data),
  delete:  (id)         => api.delete(`/reminders/${id}`),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const calendarApi = {
  get: (from, to) => api.get('/calendar', { params: { from, to } }),
};

export const profileApi = {
  update:            (data) => api.put('/profile', data),
  changePassword:    (data) => api.put('/profile/password', data),
  pushSubscribe:     (sub)  => api.post('/profile/push-subscribe', sub),
  pushUnsubscribe:   (endpoint) => api.delete('/profile/push-subscribe', { data: { endpoint } }),
};

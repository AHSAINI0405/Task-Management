import api from './axios.js';

export const jobsApi = {
  getAll:      (params) => api.get('/jobs', { params }),
  getPipeline: ()       => api.get('/jobs/pipeline'),
  getOne:      (id)     => api.get(`/jobs/${id}`),
  create:      (data)   => api.post('/jobs', data),
  update:      (id, data) => api.put(`/jobs/${id}`, data),
  updateStatus:(id, status) => api.patch(`/jobs/${id}/status`, { status }),
  delete:      (id)     => api.delete(`/jobs/${id}`),
};

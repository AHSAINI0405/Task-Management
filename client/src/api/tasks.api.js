import api from './axios.js';

export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),

  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/tasks', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  update: (id, data) => {
    const isFormData = data instanceof FormData;
    return api.put(`/tasks/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  updateStatus: (id, status, comment = '') =>
    api.patch(`/tasks/${id}/status`, { status, comment }),

  delete: (id) => api.delete(`/tasks/${id}`),

  uploadAttachments: (id, formData) =>
    api.post(`/tasks/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteAttachment: (id, attachmentId) =>
    api.delete(`/tasks/${id}/attachments/${attachmentId}`),

  getDownloadUrl: (id, attachmentId) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return `${base}/tasks/${id}/attachments/${attachmentId}/download`;
  },
};

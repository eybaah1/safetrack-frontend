import client from './client';

const reportsAPI = {
  create: (data) => client.post('/reports/', data),

  createWithPhoto: (formData) =>
    client.post('/reports/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  myReports: () => client.get('/reports/my/'),
  myReportDetail: (id) => client.get(`/reports/my/${id}/`),
  addMyComment: (id, data) => client.post(`/reports/my/${id}/comments/`, data),

  // Security/admin
  all: (params) => client.get('/reports/all/', { params }),
  stats: () => client.get('/reports/stats/'),
  mapData: () => client.get('/reports/map/'),
  detail: (id) => client.get(`/reports/${id}/`),
  updateStatus: (id, data) => client.patch(`/reports/${id}/status/`, data),
  assign: (id, data) => client.post(`/reports/${id}/assign/`, data),
  addComment: (id, data) => client.post(`/reports/${id}/comments/`, data),
};

export default reportsAPI;
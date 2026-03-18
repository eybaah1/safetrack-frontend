import client, { setTokens, clearTokens } from './client';

const authAPI = {
  signup: (data) => client.post('/auth/signup/', data),

  signupWithPhoto: (formData) =>
    client.post('/auth/signup/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  login: (data) => client.post('/auth/login/', data),

  logout: async () => {
    const refresh = localStorage.getItem('safetrack_refresh');
    try {
      await client.post('/auth/logout/', { refresh });
    } catch {
      // ignore
    }
    clearTokens();
  },

  refreshToken: (refresh) => client.post('/auth/token/refresh/', { refresh }),

  getMe: () => client.get('/auth/me/'),

  updateMe: (data) => client.patch('/auth/me/', data),

  uploadPhoto: (formData) =>
    client.patch('/auth/me/photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Emergency contacts
  getEmergencyContacts: () => client.get('/auth/me/emergency-contacts/'),
  createEmergencyContact: (data) => client.post('/auth/me/emergency-contacts/', data),
  updateEmergencyContact: (id, data) => client.patch(`/auth/me/emergency-contacts/${id}/`, data),
  deleteEmergencyContact: (id) => client.delete(`/auth/me/emergency-contacts/${id}/`),

  // Saved locations
  getSavedLocations: () => client.get('/auth/me/saved-locations/'),
  createSavedLocation: (data) => client.post('/auth/me/saved-locations/', data),
  deleteSavedLocation: (id) => client.delete(`/auth/me/saved-locations/${id}/`),

  // Admin
  getPendingUsers: () => client.get('/auth/admin/pending-users/'),
  approveUser: (userId) => client.post(`/auth/admin/users/${userId}/approve/`),
  rejectUser: (userId) => client.post(`/auth/admin/users/${userId}/reject/`),


   // Password Reset
  requestResetCode: (email) => client.post('/auth/forgot-password/', { email }),
  verifyResetCode: (email, code) => client.post('/auth/verify-reset-code/', { email, code }),
  resetPassword: (data) => client.post('/auth/reset-password/', data),
};

export default authAPI;
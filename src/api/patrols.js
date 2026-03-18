import client from './client';

const patrolsAPI = {
  list: (params) => client.get('/patrols/', { params }),
  mapData: () => client.get('/patrols/map/'),
  available: () => client.get('/patrols/available/'),
  stats: () => client.get('/patrols/stats/'),
  detail: (id) => client.get(`/patrols/${id}/`),
  updateLocation: (id, data) => client.patch(`/patrols/${id}/location/`, data),
  updateStatus: (id, data) => client.patch(`/patrols/${id}/status/`, data),

  // Members
  getMembers: (id) => client.get(`/patrols/${id}/members/`),
  addMember: (id, data) => client.post(`/patrols/${id}/members/`, data),
  removeMember: (patrolId, memberId) =>
    client.delete(`/patrols/${patrolId}/members/${memberId}/`),

  // Assignments
  assign: (data) => client.post('/patrols/assign/', data),
  assignments: (params) => client.get('/patrols/assignments/', { params }),
  activeAssignments: () => client.get('/patrols/assignments/active/'),
  assignmentDetail: (id) => client.get(`/patrols/assignments/${id}/`),
  updateAssignmentStatus: (id, data) =>
    client.patch(`/patrols/assignments/${id}/status/`, data),
  myAssignments: () => client.get('/patrols/my-assignments/'),
  nearbySecurity: (params) => client.get('/patrols/nearby-security/', { params }),  // ← NEW

};

export default patrolsAPI;
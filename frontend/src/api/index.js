import client from './client';


export const userAPI = {
  me: () => client.get('/users/me/'),
  list: () => client.get('/users/'),
  create: (data) => client.post('/users/', data),
  update: (id, data) => client.patch(`/users/${id}/`, data),
  remove: (id) => client.delete(`/users/${id}/`),
  stats: () => client.get('/users/stats/'),
};

export const vehicleAPI = {
  list: () => client.get('/vehicles/'),
  available: (params) => client.get('/vehicles/available/', { params }),
  setStatus: (id, status) => client.patch(`/vehicles/${id}/set_status/`, { status }),
  create: (data) => client.post('/vehicles/', data),
  update: (id, data) => client.patch(`/vehicles/${id}/`, data),
  remove: (id) => client.delete(`/vehicles/${id}/`),
};

export const bookingAPI = {
  list: () => client.get('/bookings/'),
  create: (data) => client.post('/bookings/', data),
  pending: () => client.get('/bookings/pending/'),
  approve: (id, feedback) => client.post(`/bookings/${id}/approve/`, { feedback }),
  reject: (id, feedback) => client.post(`/bookings/${id}/reject/`, { feedback }),
};

export const reportAPI = {
  financial: () => client.get('/reports/financial/'),
  activity: () => client.get('/reports/activity/'),
};

export const authAPI = {
  login: (username, password) => client.post('/auth/login/', { username, password }),
  register: (data) => client.post('/auth/register/', data),   // ← NEW
};
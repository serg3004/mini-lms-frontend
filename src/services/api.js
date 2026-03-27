import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Courses
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getMy: (params) => api.get('/courses/my', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
};

// Lessons
export const lessonsAPI = {
  getAll: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getOne: (courseId, id) => api.get(`/courses/${courseId}/lessons/${id}`),
  create: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  update: (courseId, id, data) => api.put(`/courses/${courseId}/lessons/${id}`, data),
  delete: (courseId, id) => api.delete(`/courses/${courseId}/lessons/${id}`),
};

// Assignments
export const assignmentsAPI = {
  getAll: (courseId) => api.get(`/courses/${courseId}/assignments`),
  getOne: (courseId, id) => api.get(`/courses/${courseId}/assignments/${id}`),
  create: (courseId, data) => api.post(`/courses/${courseId}/assignments`, data),
  update: (courseId, id, data) => api.put(`/courses/${courseId}/assignments/${id}`, data),
  delete: (courseId, id) => api.delete(`/courses/${courseId}/assignments/${id}`),
};

// Submissions
export const submissionsAPI = {
  submit: (assignmentId, data) => api.post(`/submissions/assignments/${assignmentId}`, data),
  getMine: (assignmentId) => api.get(`/submissions/assignments/${assignmentId}/mine`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  getCourse: (courseId) => api.get(`/submissions/courses/${courseId}`),
};

// Users (admin)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getNotifications: () => api.get('/users/notifications'),
  markRead: () => api.put('/users/notifications/read'),
};

export default api;

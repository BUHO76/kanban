import axios from 'axios';
import { useAuthStore } from "../stores/authStore";

const userServiceAPI = axios.create({
  baseURL: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8000',
});

const projectServiceAPI = axios.create({
  baseURL: process.env.REACT_APP_PROJECT_SERVICE_URL || 'http://localhost:8001',
});

// Add token to requests
userServiceAPI.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

projectServiceAPI.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (data: any) => {
    const response = await userServiceAPI.post('/api/register', data);
    return response.data;
  },
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await userServiceAPI.post('/api/token', formData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await userServiceAPI.get('/api/users/me');
    return response.data;
  },
};

export const projectService = {
  // Projects
  getProjects: async () => {
    const response = await projectServiceAPI.get('/api/projects');
    return response.data;
  },
  getProject: async (id: number) => {
    const response = await projectServiceAPI.get(`/api/projects/${id}`);
    return response.data;
  },
  createProject: async (data: any) => {
    const response = await projectServiceAPI.post('/api/projects', data);
    return response.data;
  },
  updateProject: async (id: number, data: any) => {
    const response = await projectServiceAPI.put(`/api/projects/${id}`, data);
    return response.data;
  },
  deleteProject: async (id: number) => {
    const response = await projectServiceAPI.delete(`/api/projects/${id}`);
    return response.data;
  },

  // Tasks
  getTasks: async (projectId: number) => {
    const response = await projectServiceAPI.get(`/api/projects/${projectId}/tasks`);
    return response.data;
  },
  createTask: async (projectId: number, data: any) => {
    const response = await projectServiceAPI.post(`/api/projects/${projectId}/tasks`, data);
    return response.data;
  },
  updateTask: async (taskId: number, data: any) => {
    const response = await projectServiceAPI.put(`/api/tasks/${taskId}`, data);
    return response.data;
  },
  deleteTask: async (taskId: number) => {
    const response = await projectServiceAPI.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
  assignTask: async (taskId: number, userId: number) => {
    const response = await projectServiceAPI.post(`/api/tasks/${taskId}/assign/${userId}`);
    return response.data;
  },
};
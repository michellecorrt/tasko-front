import axios from 'axios';
import { AuthTokens, LoginRequest, RegisterRequest, User, Workspace, Board, List, Card, Comment } from '../types';

//const BASE_URL = 'http://192.168.100.36:4000/api';
const BASE_URL = 'http://192.168.0.127:3000/api';
//const BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Token management
let accessToken: string | null = null;

export const setAuthToken = (token: string) => {
  accessToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  accessToken = null;
  delete api.defaults.headers.common['Authorization'];
};

// Interfaces
export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  isAdmin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Auth API
export const authAPI = {
  register: (data: RegisterRequest) => api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data),
  login: (data: LoginRequest) => api.post<{ user: User; tokens: AuthTokens }>('/auth/login', data),
};

// User API
export const userAPI = {
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  setAdmin: (id: string, isAdmin: boolean) => api.patch(`/users/${id}/admin`, { isAdmin }),
};

// Workspace API
export const workspaceAPI = {
  create: (name: string) => api.post<Workspace>('/workspaces', { name }),
  getAll: () => api.get<Workspace[]>('/workspaces'),
  update: (id: string, name: string) => api.patch<Workspace>(`/workspaces/${id}`, { name }),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
};

// Board API
export const boardAPI = {
  create: (data: { workspaceId: string; name: string; integrationToken?: string }) => 
    api.post<Board>('/boards', data),
  getByWorkspace: (workspaceId: string) => api.get<Board[]>(`/boards?workspace=${workspaceId}`),
  update: (id: string, data: Partial<Board>) => api.patch<Board>(`/boards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/${id}`),
};

// List API
export const listAPI = {
  getByBoard: (boardId: string) => api.get<List[]>(`/lists?board=${boardId}`),
  create: (data: { boardId: string; name: string; prevOrder?: number; nextOrder?: number }) => 
    api.post<List>('/lists', data),
  move: (id: string, data: { boardId?: string; prevOrder?: number; nextOrder?: number }) => 
    api.patch<List>(`/lists/${id}/move`, data),
  delete: (id: string) => api.delete(`/lists/${id}`),
};

// Card API
export const cardAPI = {
  getByList: (listId: string) => api.get<Card[]>(`/cards?list=${listId}`),
  getByBoard: (boardId: string) => api.get<Card[]>(`/cards?board=${boardId}`),
  create: (data: { boardId: string; listId: string; title: string; prevOrder?: number; nextOrder?: number }) => 
    api.post<Card>('/cards', data),
  update: (id: string, data: Partial<Card>) => api.patch<Card>(`/cards/${id}`, data),
  move: (id: string, data: { listId?: string; prevOrder?: number; nextOrder?: number }) => 
    api.patch<Card>(`/cards/${id}/move`, data),
  delete: (id: string) => api.delete(`/cards/${id}`),
};

// Comment API
export const commentAPI = {
  getByCard: (cardId: string) => api.get<Comment[]>(`/comments?card=${cardId}`),
  create: (data: { cardId: string; text: string }) => api.post<Comment>('/comments', data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};
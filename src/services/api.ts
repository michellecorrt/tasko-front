
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'https://tasko-backend-lq01.onrender.com/api';


const getHeaders = async () => {
  const tokenData = await AsyncStorage.getItem('authTokens');
  const tokens = tokenData ? JSON.parse(tokenData) : null;
  return {
    'Content-Type': 'application/json',
    ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
  };
};

const request = async (method: string, path: string, body?: any) => {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const error: any = new Error(data.message || 'Request failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return { data };
};

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  login: (body: { email: string; password: string }) =>
    request('POST', '/auth/login', body),

  register: (body: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    isAdmin?: boolean;
  }) => request('POST', '/auth/register', body),
};

// ── Workspaces ────────────────────────────────────────────────────
export const workspaceAPI = {
  getAll: () => request('GET', '/workspaces'),
  create: (name: string) => request('POST', '/workspaces', { name }),
  update: (id: string, name: string) => request('PUT', `/workspaces/${id}`, { name }),
  delete: (id: string) => request('DELETE', `/workspaces/${id}`),
};

// ── Boards ────────────────────────────────────────────────────────
export const boardAPI = {
  getByWorkspace: (workspaceId: string) =>
    request('GET', `/boards?workspaceId=${workspaceId}`),
  create: (body: { workspaceId: string; name: string }) =>
    request('POST', '/boards', body),
  update: (id: string, body: Partial<{ name: string }>) =>
    request('PUT', `/boards/${id}`, body),
  delete: (id: string) => request('DELETE', `/boards/${id}`),
};

// ── Lists ─────────────────────────────────────────────────────────
export const listAPI = {
  getByBoard: (boardId: string) => request('GET', `/lists?boardId=${boardId}`),
  create: (body: any) => request('POST', '/lists', body),
};

// ── Cards ─────────────────────────────────────────────────────────
export const cardAPI = {
  getByBoard: (boardId: string) => request('GET', `/cards?boardId=${boardId}`),
  create: (body: any) => request('POST', '/cards', body),
  update: (id: string, body: any) => request('PUT', `/cards/${id}`, body),
  delete: (id: string) => request('DELETE', `/cards/${id}`),
};

export interface User {
  _id: string
    email: string;
    name: string;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Workspace {
    _id: string;
    name: string;
    members: Array<{
      user: string;
      role: 'owner' | 'admin' | 'member';
    }>;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Board {
    _id: string;
    workspace: string;
    name: string;
    integrationToken?: string;
    members: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface List {
    _id: string;
    board: string;
    name: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Card {
    _id: string;
    board: string;
    list: string;
    title: string;
    desc?: string;
    labels?: string[];
    order: number;
    checklist?: Array<{ title: string; done: boolean }>;
    due?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Comment {
    _id: string;
    card: string;
    user: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AuthTokens {
    access: string;
    refresh: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    isAdmin?: boolean;
  }
export interface User {
  _id: string
  name: string
  lastName?: string
  email: string
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface Workspace {
  _id: string
  name: string
  isDefault?: boolean
  role?: string
  createdAt?: string
}

export interface Board {
  _id: string
  name: string
  workspaceId: string
  createdAt: string
}

export interface List {
  _id: string
  name: string
  type: string
  boardId: string
  order?: number
  color?: string
  icon?: string
}

export interface ChecklistItem {
  title: string
  done: boolean
}

export interface Card {
  _id: string
  title: string
  desc?: string
  listId: string
  boardId: string
  list?: string
  order?: number
  due?: string
  checklist?: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

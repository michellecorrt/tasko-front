import { create } from 'zustand';
import { User, Workspace, Board, List, Card, AuthTokens } from '../types';

interface Notification {
  _id: string;
  type: string;
  message: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
  user?: string;
  status?: string;
}

interface AppState {
  // Auth
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  // Data
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  cards: Card[];

  // Notifications
  notifications: Notification[];

  // Loading
  loading: boolean;

  // Auth actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;

  // Data actions
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setBoards: (boards: Board[]) => void;
  setCurrentBoard: (board: Board | null) => void;
  setLists: (lists: List[]) => void;
  setCards: (cards: Card[]) => void;

  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;

  // CRUD actions
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;

  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  removeBoard: (id: string) => void;

  addList: (list: List) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  removeList: (id: string) => void;

  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  moveCard: (cardId: string, toListId: string, newOrder: number) => void;

  // Utility
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  workspaces: [],
  currentWorkspace: null,
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  notifications: [], // ← sin notificaciones de ejemplo
  loading: false,

  // Auth
  setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),

  logout: () => {
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      workspaces: [],
      currentWorkspace: null,
      boards: [],
      currentBoard: null,
      lists: [],
      cards: [],
      notifications: [],
      loading: false,
    });
  },

  // Data
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setLists: (lists) => set({ lists }),
  setCards: (cards) => set({ cards }),

  // Notifications
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      ),
    })),

  // Workspaces CRUD
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
  updateWorkspace: (id, updates) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w._id === id ? { ...w, ...updates } : w)),
      currentWorkspace:
        state.currentWorkspace?._id === id
          ? { ...state.currentWorkspace, ...updates }
          : state.currentWorkspace,
    })),
  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w._id !== id),
      currentWorkspace: state.currentWorkspace?._id === id ? null : state.currentWorkspace,
    })),

  // Boards CRUD
  addBoard: (board) =>
    set((state) => ({ boards: [...state.boards, board] })),
  updateBoard: (id, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => (b._id === id ? { ...b, ...updates } : b)),
      currentBoard:
        state.currentBoard?._id === id
          ? { ...state.currentBoard, ...updates }
          : state.currentBoard,
    })),
  removeBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b._id !== id),
      currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
    })),

  // Lists CRUD
  addList: (list) =>
    set((state) => ({
      lists: state.lists.some((l) => l._id === list._id)
        ? state.lists
        : [...state.lists, list],
    })),
  updateList: (id, updates) =>
    set((state) => ({
      lists: state.lists.map((l) => (l._id === id ? { ...l, ...updates } : l)),
    })),
  removeList: (id) =>
    set((state) => ({ lists: state.lists.filter((l) => l._id !== id) })),

  // Cards CRUD
  addCard: (card) =>
    set((state) => ({
      cards: state.cards.some((c) => c._id === card._id)
        ? state.cards
        : [...state.cards, card],
    })),
  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((c) => (c._id === id ? { ...c, ...updates } : c)),
    })),
  removeCard: (id) =>
    set((state) => ({ cards: state.cards.filter((c) => c._id !== id) })),
  moveCard: (cardId, toListId, newOrder) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c._id === cardId ? { ...c, list: toListId, order: newOrder } : c
      ),
    })),

  // Utility
  setLoading: (loading) => set({ loading }),
}));

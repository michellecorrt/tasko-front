import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store';
import { authAPI, workspaceAPI, boardAPI, listAPI, cardAPI } from '../services/api';
import { AuthTokens, User } from '../types';

// ── Auth Hook ─────────────────────────────────────────────────────
export const useAuth = () => {
  const { user, tokens, isAuthenticated, setAuth, logout: storeLogout } = useAppStore();
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const tokenData = await AsyncStorage.getItem('authTokens');
      const userData = await AsyncStorage.getItem('userData');
      if (tokenData && userData) {
        const tokens: AuthTokens = JSON.parse(tokenData);
        const user: User = JSON.parse(userData);
        setAuth(user, tokens);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, tokens } = response.data;
      await AsyncStorage.setItem('authTokens', JSON.stringify(tokens));
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      setAuth(user, tokens);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (
    name: string,
    lastName: string,
    email: string,
    password: string,
    phone: string
  ) => {
    setLoading(true);
    try {
      const response = await authAPI.register({
        name, lastName, email, password, phone, isAdmin: false,
      });
      setLoading(false);
      return {
        success: true,
        message: '¡Registro exitoso! Tu cuenta ha sido creada correctamente.',
        user: response.data.user,
      };
    } catch (error: any) {
      setLoading(false);
      let errorMessage = 'Error al registrarse';
      if (error.response?.status === 409) {
        errorMessage = 'Este email ya está registrado. Por favor usa otro email.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Datos inválidos. Revisa todos los campos.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {}
    storeLogout();
    return { success: true };
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return { user, tokens, isAuthenticated, loading, login, register, logout };
};

// ── Workspaces Hook ───────────────────────────────────────────────
export const useWorkspaces = () => {
  const {
    workspaces, setWorkspaces, addWorkspace,
    updateWorkspace: updateWorkspaceStore, removeWorkspace,
    setLoading, loading,
  } = useAppStore();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const response = await workspaceAPI.create(name);
      addWorkspace(response.data);
      return { success: true, workspace: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear workspace',
      };
    }
  };

  const updateWorkspace = async (workspaceId: string, name: string) => {
    try {
      const response = await workspaceAPI.update(workspaceId, name);
      updateWorkspaceStore(workspaceId, response.data);
      return { success: true, workspace: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar workspace',
      };
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await workspaceAPI.delete(workspaceId);
      removeWorkspace(workspaceId);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar workspace',
      };
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return {
    workspaces, createWorkspace, updateWorkspace,
    deleteWorkspace, loading, refetch: fetchWorkspaces,
  };
};

// ── Boards Hook ───────────────────────────────────────────────────
export const useBoards = (workspaceId?: string) => {
  const {
    boards, currentBoard, setBoards, setCurrentBoard,
    addBoard, updateBoard: updateBoardStore, removeBoard,
    currentWorkspace, setLoading, loading, cards,
  } = useAppStore();

  const fetchBoards = async (wsId?: string) => {
    const targetWorkspaceId = wsId || currentWorkspace?._id;
    if (!targetWorkspaceId) return;
    setLoading(true);
    try {
      const response = await boardAPI.getByWorkspace(targetWorkspaceId);
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (wsId: string, name: string) => {
    try {
      const response = await boardAPI.create({ workspaceId: wsId, name });
      addBoard(response.data);
      return { success: true, board: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear tablero',
      };
    }
  };

  const updateBoard = async (boardId: string, name: string) => {
    try {
      const response = await boardAPI.update(boardId, { name });
      updateBoardStore(boardId, response.data);
      return { success: true, board: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar tablero',
      };
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      await boardAPI.delete(boardId);
      removeBoard(boardId);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar tablero',
      };
    }
  };

  const getBoardTaskCounts = (boardId: string) => {
    const boardCards = cards.filter(card => card.boardId === boardId);
    const pending = boardCards.filter(card => card.list === 'pending').length;
    const inProgress = boardCards.filter(card => card.list === 'inprogress').length;
    const done = boardCards.filter(card => card.list === 'done').length;
    return { pending, inProgress, done };
  };

  useEffect(() => {
    if (workspaceId || currentWorkspace?._id) {
      fetchBoards(workspaceId);
    }
  }, [workspaceId, currentWorkspace?._id]);

  return {
    boards, currentBoard, setCurrentBoard, createBoard,
    updateBoard, deleteBoard, loading, refetch: fetchBoards,
    getBoardTaskCounts,
  };
};

// ── Kanban Hook ───────────────────────────────────────────────────
export const useKanban = (boardId?: string) => {
  const {
    cards, lists, addCard, setCards, setLists,
    updateCard, addNotification, setLoading, loading, user,
  } = useAppStore();

  const fetchBoardData = async () => {
    if (!boardId) return;
    try {
      const [cardsRes, listsRes] = await Promise.all([
        cardAPI.getByBoard(boardId),
        listAPI.getByBoard(boardId),
      ]);
      setCards(cardsRes.data);
      setLists(listsRes.data);
    } catch (error) {
      console.error('Error fetching board data:', error);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  const createCard = async (cardData: any) => {
    setLoading(true);
    try {
      const response = await cardAPI.create(cardData);
      const newCard = response.data;
      addCard(newCard);

      addNotification({
        _id: `notif-${Date.now()}`,
        type: 'task_created',
        message: `Tarea "${newCard.title}" creada`,
        taskId: newCard._id,
        read: false,
        createdAt: new Date().toISOString(),
        user: user?.name || 'Usuario',
        status: newCard.list || 'pending',
      });

      setLoading(false);
      return { success: true, card: newCard };
    } catch (error: any) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear la tarea',
      };
    }
  };

  const moveCard = async (cardId: string, newListId: string) => {
    try {
      const card = cards.find((c: any) => c._id === cardId);
      const listType = newListId.includes('-') ? newListId.split('-')[1] : newListId;
      if (card) {
        updateCard(cardId, { ...card, list: listType, listId: newListId });
        await cardAPI.update(cardId, { list: listType, listId: newListId });
      }
      addNotification({
        _id: `notif-${Date.now()}`,
        type: listType === 'done' ? 'task_completed' : 'task_moved',
        message: listType === 'done'
          ? `Tarea completada: "${card?.title}"`
          : `Tarea movida: "${card?.title}"`,
        taskId: cardId,
        read: false,
        createdAt: new Date().toISOString(),
        user: user?.name || 'Usuario',
        status: listType,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al mover la tarea' };
    }
  };

  return {
    cards: cards.filter((c: any) => c.boardId === boardId),
    lists: lists.filter((l: any) => l.boardId === boardId),
    createCard,
    moveCard,
    loading,
    refetch: fetchBoardData,
  };
};

// ── Notifications Hook ────────────────────────────────────────────
export const useNotifications = () => {
  const { notifications, setNotifications, markNotificationAsRead } = useAppStore();
  const [loading, setLoading] = useState(false);

  const markAsRead = async (notificationId: string) => {
    try {
      markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return { notifications, loading, markAsRead, markAllAsRead };
};

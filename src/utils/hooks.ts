import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store';
import { authAPI, workspaceAPI, boardAPI, listAPI, cardAPI } from '../services/api';
import { AuthTokens, User } from '../types';

// Auth Hook
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
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

 
  const register = async (name: string, lastName: string, email: string, password: string, phone: string) => {
    setLoading(true);
    try {
   
      const response = await authAPI.register({ 
        name, 
        lastName,
        email, 
        password,
        phone,
        isAdmin: false
      });
      
      console.log('Usuario registrado exitosamente:', response.data);
      setLoading(false);
      
      return { 
        success: true, 
        message: '¡Registro exitoso! Tu cuenta ha sido creada correctamente.',
        user: response.data.user
      };
      
    } catch (error: any) {
      setLoading(false);
      console.error(' Error en registro:', error.response?.data);
      
    
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
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };


  const logout = async () => {
    try {
      console.log('🔄 Iniciando proceso de logout...');
      
 
      try {
        await AsyncStorage.clear(); 
        console.log('AsyncStorage completamente limpiado');
      } catch (storageError) {
        console.warn(' Error limpiando AsyncStorage:', storageError);
        try {
          await AsyncStorage.multiRemove(['authTokens', 'userData']);
        } catch (selectiveError) {
          console.warn('Falló limpieza selectiva:', selectiveError);
        }
      }
      

      storeLogout();
      console.log('✅ Estado del store limpiado');
      

      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(' Logout completado exitosamente');
      return { success: true };
      
    } catch (error) {
      console.error('Error durante logout:', error);
      

      try {
        storeLogout();
        await AsyncStorage.clear();
      } catch (cleanupError) {
        console.error('Error en limpieza forzada:', cleanupError);
      }
      
      return { 
        success: true, 
        error: 'Sesión cerrada con advertencias' 
      };
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    user,
    tokens,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };
};

// Workspaces Hook
export const useWorkspaces = () => {
  const { workspaces, setWorkspaces, addWorkspace, updateWorkspace: updateWorkspaceStore, removeWorkspace, setLoading, loading } = useAppStore();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
     
      const mockWorkspaces = [
        { 
          _id: 'personal', 
          name: 'Personal', 
          isDefault: true, 
          createdAt: new Date().toISOString(),
          role: 'owner' 
        }
      ];
      setWorkspaces(mockWorkspaces);
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
    
      const newWorkspace = {
        _id: `temp-${Date.now()}`,
        name,
        isDefault: false,
        createdAt: new Date().toISOString(),
        role: 'owner'
      };
      addWorkspace(newWorkspace);
      return { success: true, workspace: newWorkspace };
    }
  };

  const updateWorkspace = async (workspaceId: string, name: string) => {
    try {
      const response = await workspaceAPI.update(workspaceId, name);
      updateWorkspaceStore(workspaceId, response.data);
      return { success: true, workspace: response.data };
    } catch (error: any) {
 
      const updatedWorkspace = workspaces.find(w => w._id === workspaceId);
      if (updatedWorkspace) {
        const newWorkspace = { ...updatedWorkspace, name };
        updateWorkspaceStore(workspaceId, newWorkspace);
        return { success: true, workspace: newWorkspace };
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar workspace' 
      };
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await workspaceAPI.delete(workspaceId);
      removeWorkspace(workspaceId);
      return { success: true };
    } catch (error: any) {
    
      removeWorkspace(workspaceId);
      return { success: true }; 
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return { 
    workspaces, 
    createWorkspace, 
    updateWorkspace,
    deleteWorkspace,
    loading, 
    refetch: fetchWorkspaces 
  };
};


export const useBoards = (workspaceId?: string) => {
  const { 
    boards, 
    currentBoard, 
    setBoards, 
    setCurrentBoard, 
    addBoard, 
    updateBoard: updateBoardStore,
    removeBoard,
    currentWorkspace,
    setLoading,
    loading,
    cards 
  } = useAppStore();

  const fetchBoards = async (wsId?: string) => {
    const targetWorkspaceId = wsId || currentWorkspace?._id;
    if (!targetWorkspaceId) return;
  

    if (targetWorkspaceId === 'personal') {
      setBoards([
        {
          _id: 'board-personal',
          name: 'Personal',
          workspaceId: 'personal',
          createdAt: new Date().toISOString()
        }
      ]);
      setLoading(false);
      return;
    }
  
    setLoading(true);
    try {
      const response = await boardAPI.getByWorkspace(targetWorkspaceId);
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
   
      setBoards([
        {
          _id: `temp-board-${Date.now()}`,
          name: 'Mi Tablero',
          workspaceId: targetWorkspaceId,
          createdAt: new Date().toISOString()
        }
      ]);
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
 
      const newBoard = {
        _id: `temp-board-${Date.now()}`,
        name,
        workspaceId: wsId,
        createdAt: new Date().toISOString()
      };
      addBoard(newBoard);
      return { success: true, board: newBoard };
    }
  };

  const updateBoard = async (boardId: string, name: string) => {
    try {
      const response = await boardAPI.update(boardId, { name });
      updateBoardStore(boardId, response.data);
      return { success: true, board: response.data };
    } catch (error: any) {
   
      const existingBoard = boards.find(b => b._id === boardId);
      if (existingBoard) {
        const updatedBoard = { ...existingBoard, name };
        updateBoardStore(boardId, updatedBoard);
        return { success: true, board: updatedBoard };
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar tablero' 
      };
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      await boardAPI.delete(boardId);
      removeBoard(boardId);
      return { success: true };
    } catch (error: any) {

      removeBoard(boardId);
      return { success: true }; 
    }
  };


  const getBoardTaskCounts = (boardId: string) => {
    const boardCards = cards.filter(card => card.boardId === boardId);
    const pending = boardCards.filter(card => 
      card.list === 'pending' || card.list === `${boardId}-pending`
    ).length;
    const inProgress = boardCards.filter(card => 
      card.list === 'inprogress' || card.list === `${boardId}-inprogress`
    ).length;
    const done = boardCards.filter(card => 
      card.list === 'done' || card.list === `${boardId}-done`
    ).length;
    
    return { pending, inProgress, done };
  };

  useEffect(() => {
    if (workspaceId || currentWorkspace?._id) {
      fetchBoards(workspaceId);
    }
  }, [workspaceId, currentWorkspace]);

  return { 
    boards, 
    currentBoard, 
    setCurrentBoard, 
    createBoard, 
    updateBoard,
    deleteBoard,
    loading, 
    refetch: fetchBoards,
    getBoardTaskCounts 
  };
};

export const useKanban = (boardId?: string) => {
  const { 
    cards, 
    addCard,
    updateCard,
    addNotification,
    setLoading,
    loading,
    user 
  } = useAppStore();


  const createCard = async (cardData: any) => {
    setLoading(true);
    try {
   
      const newCard = { ...cardData, _id: `card-${Date.now()}` };
      addCard(newCard);

      addNotification({
        _id: `notif-${Date.now()}`,
        type: 'task_created',
        message: `Tarea "${cardData.title}" creada en estado "${cardData.list || 'pending'}"`,
        taskId: newCard._id,
        read: false,
        createdAt: new Date().toISOString(),
        user: user?.name || 'Michelle',
        status: cardData.list || 'pending'
      });

      setLoading(false);
      return { success: true, card: newCard };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Error al crear la tarea' };
    }
  };


  const moveCard = async (cardId: string, newListId: string) => {
    try {
      const card = cards.find((c: any) => c._id === cardId);
      const listType = newListId.includes('-') ? newListId.split('-')[1] : newListId;
      if (card) {
        updateCard(cardId, { ...card, list: listType, listId: newListId });
      }


      let message = `Tarea "${card?.title}" movida a "${listType}"`;
      let notifType = 'task_moved';
      if (listType === 'done') {
        message = `Tarea completada: "${card?.title}"`;
        notifType = 'task_completed';
      } else if (listType === 'inprogress') {
        message = `Tarea en progreso: "${card?.title}"`;
      }

      addNotification({
        _id: `notif-${Date.now()}`,
        type: notifType,
        message,
        taskId: cardId,
        read: false,
        createdAt: new Date().toISOString(),
        user: user?.name || 'Michelle',
        status: listType
      });

      return { success: true, card: { ...card, list: listType, listId: newListId } };
    } catch (error) {
      return { success: false, error: 'Error al mover la tarea' };
    }
  };

  return { 
    cards: cards.filter((c: any) => c.boardId === boardId), 
    createCard, 
    moveCard,
    loading
  };
};


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
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        read: true
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
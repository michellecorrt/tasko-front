import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoards } from '../utils/hooks';
import { useAppStore } from '../store';

export default function BoardsScreen({ route, navigation }: any) {
  const { workspace } = route.params || {};
  const { boards, createBoard, updateBoard, deleteBoard, loading, getBoardTaskCounts } = useBoards(workspace?._id);
  const { setCurrentWorkspace } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [boardTaskCounts, setBoardTaskCounts] = useState<{[key: string]: {pending: number, inProgress: number}}>({});
  
  
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    if (workspace) {
      setCurrentWorkspace(workspace);
      
      if (workspace.name === 'Personal' && boards.length === 0) {
        createBoard(workspace._id, 'Personal');
      }
    }
  }, [workspace, boards]);

  useEffect(() => {
    
    const fetchTaskCounts = () => {
      const counts: {[key: string]: {pending: number, inProgress: number}} = {};
      for (const board of boards) {
        const taskCount = getBoardTaskCounts(board._id);
        counts[board._id] = taskCount;
      }
      setBoardTaskCounts(counts);
    };

    if (boards.length > 0) {
      fetchTaskCounts();
    }
  }, [boards]);

  const handleCreateOrUpdateBoard = async () => {
    if (!boardName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    let result;
    if (editingBoard) {
      result = await updateBoard(editingBoard._id, boardName.trim());
    } else {
      result = await createBoard(workspace._id, boardName.trim());
    }

    if (result.success) {
      setBoardName('');
      setEditingBoard(null);
      setModalVisible(false);
      Alert.alert('Éxito', editingBoard ? 'Tablero actualizado correctamente' : 'Tablero creado correctamente');
    } else {
      Alert.alert('Error', result.error || (editingBoard ? 'No se pudo actualizar el tablero' : 'No se pudo crear el tablero'));
    }
  };

  const handleDeleteBoard = async (board: any) => {
    // No permitir eliminar el board Personal
    if (workspace.name === 'Personal' && board.name === 'Personal') {
      Alert.alert('Información', 'No se puede eliminar el tablero Personal del workspace Personal');
      return;
    }

    Alert.alert(
      'Eliminar Tablero',
      `¿Estás seguro de que deseas eliminar "${board.name}"? Se eliminarán todas las tareas asociadas. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed, calling deleteBoard...');
            try {
              const result = await deleteBoard(board._id);
              console.log('Delete result:', result);
              
              if (result.success) {
                Alert.alert('Éxito', 'Tablero eliminado correctamente');
              } else {
                Alert.alert('Error', result.error || 'No se pudo eliminar el tablero');
              }
            } catch (error) {
              console.error('Error deleting board:', error);
              Alert.alert('Error', 'Error inesperado al eliminar el tablero');
            }
          }
        }
      ]
    );
  };

  const handleEditBoard = (board: any) => {
    setEditingBoard(board);
    setBoardName(board.name);
    setModalVisible(true);
  };

 
  const showBoardOptions = (board: any) => {
    console.log('showBoardOptions called for:', board.name);
    
   
    if (workspace.name === 'Personal' && board.name === 'Personal') {
      console.log('Cannot edit Personal board');
      return;
    }

    console.log('Opening options modal for board:', board.name);
    setSelectedBoard(board);
    setOptionsModalVisible(true);
  };

 
  const handleOptionEdit = () => {
    console.log('handleOptionEdit called for:', selectedBoard?.name);
    setOptionsModalVisible(false);
    if (selectedBoard) {
      handleEditBoard(selectedBoard);
    }
  };

  const handleOptionDelete = () => {
    console.log('handleOptionDelete called for:', selectedBoard?.name);
    setOptionsModalVisible(false);
    if (selectedBoard) {
      handleDeleteBoard(selectedBoard);
    }
  };

  const handleCloseOptionsModal = () => {
    setOptionsModalVisible(false);
    setSelectedBoard(null);
  };

  const renderBoard = ({ item }: any) => {
    const taskCount = boardTaskCounts[item._id] || { pending: 0, inProgress: 0 };
    const hasPendingTasks = taskCount.pending > 0 || taskCount.inProgress > 0;
    const isPersonalBoard = workspace.name === 'Personal' && item.name === 'Personal';

    return (
      <TouchableOpacity 
        style={styles.boardCard}
        onPress={() => navigation.navigate('Kanban', { 
          board: item, 
          boardName: item.name 
        })}
        activeOpacity={0.7}
      >
        <View style={styles.boardHeader}>
          <View style={[
            styles.boardIcon, 
            { backgroundColor: hasPendingTasks ? '#3b82f6' : '#e5e7eb' }
          ]}>
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={hasPendingTasks ? '#fff' : '#9ca3af'} 
            />
          </View>
          <View style={styles.boardInfo}>
            <Text style={styles.boardName}>{item.name}</Text>
            <Text style={styles.boardSubtitle}>
              Creado en {new Date(item.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
              })}
            </Text>
          </View>
          <View style={styles.boardActions}>
            {!isPersonalBoard && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  console.log('More button pressed for board:', item.name);
                  console.log('Board details:', item);
                  showBoardOptions(item);
                }}
                style={styles.moreButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.6}
              >
                <Ionicons name="ellipsis-vertical" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
            <View style={styles.boardArrow}>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="grid-outline" size={48} color="#94a3b8" />
      </View>
      <Text style={styles.emptyTitle}>No hay tableros</Text>
      <Text style={styles.emptySubtitle}>
        Crea un tablero para organizar tus tareas
      </Text>
    </View>
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingBoard(null);
    setBoardName('');
  };

  if (!workspace) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró el workspace</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Tableros en {workspace.name}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#203d7f" />
        </TouchableOpacity>
      </View>

      {/* Lista de tableros */}
      <FlatList
        data={boards}
        renderItem={renderBoard}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* NUEVO: Modal de opciones personalizado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={handleCloseOptionsModal}
      >
        <View style={styles.optionsModalOverlay}>
          <View style={styles.optionsModalContent}>
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle}>
                {selectedBoard?.name}
              </Text>
              <TouchableOpacity 
                onPress={handleCloseOptionsModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsList}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={handleOptionEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={20} color="#3b82f6" />
                <Text style={styles.optionText}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionItem, styles.deleteOption]}
                onPress={handleOptionDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={20} color="#ef4444" />
                <Text style={[styles.optionText, styles.deleteOptionText]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para crear/editar tablero */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBoard ? 'Editar Tablero' : 'Nuevo Tablero'}
              </Text>
              <TouchableOpacity 
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del tablero</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Proyecto Mobile App"
                value={boardName}
                onChangeText={setBoardName}
                placeholderTextColor="#94a3b8"
                autoFocus
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateOrUpdateBoard}
              >
                <Text style={styles.createButtonText}>
                  {editingBoard ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  boardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  boardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  boardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 12,
    marginRight: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
  },
  boardArrow: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '500',
  },
  
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxWidth: 300,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteOptionText: {
    color: '#ef4444',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f9fafb',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#203d7f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
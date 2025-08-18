import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoards, useWorkspaces } from '../utils/hooks';
import { useAppStore } from '../store';

export default function PersonalBoardsScreen({ navigation }: any) {
  const { workspaces } = useWorkspaces();
  const [modalVisible, setModalVisible] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardTaskCounts, setBoardTaskCounts] = useState<{[key: string]: {pending: number, inProgress: number}}>({});

  //  workspace Personal
  const personalWorkspace = workspaces.find(w => w.name === 'Personal') || {
    _id: 'personal',
    name: 'Personal',
    isDefault: true,
    role: 'owner'
  };

  const { boards, createBoard, loading, getBoardTaskCounts } = useBoards(personalWorkspace._id);
  const { setCurrentWorkspace } = useAppStore();

  //  solo boards del workspace Personal
  const personalBoards = boards.filter(board => board.workspaceId === personalWorkspace._id);

  useEffect(() => {
    if (personalWorkspace) {
      setCurrentWorkspace(personalWorkspace);
      // Crear board personal por defecto si no existe nigun board
      if (personalBoards.length === 0) {
        createBoard(personalWorkspace._id, 'Personal');
      }
    }
  }, [personalWorkspace, boards]);

  useEffect(() => {
    //  conteos de tareas para cada board
    const fetchTaskCounts = async () => {
      const counts: {[key: string]: {pending: number, inProgress: number}} = {};
      for (const board of personalBoards) {
        const taskCount = getBoardTaskCounts(board._id);
        counts[board._id] = taskCount;
      }
      setBoardTaskCounts(counts);
    };

    if (personalBoards.length > 0) {
      fetchTaskCounts();
    }
  }, [personalBoards]);

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    const result = await createBoard(personalWorkspace._id, boardName.trim());
    if (result.success) {
      setBoardName('');
      setModalVisible(false);
      Alert.alert('Éxito', 'Tablero creado correctamente');
    } else {
      Alert.alert('Error', 'No se pudo crear el tablero');
    }
  };

  const renderBoard = ({ item }: any) => {
    const taskCount = boardTaskCounts[item._id] || { pending: 0, inProgress: 0 };
    const hasPendingTasks = taskCount.pending > 0 || taskCount.inProgress > 0;

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
            <Text style={styles.boardDate}>
              Creado {new Date(item.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.boardArrow}>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </View>

        {/* Indicador de tareas pendientes */}
        {hasPendingTasks && (
          <View style={styles.taskIndicator}>
            <View style={styles.taskBadge}>
              <Ionicons name="time-outline" size={12} color="#3b82f6" />
              <Text style={styles.taskBadgeText}>
                {taskCount.pending} pendientes
              </Text>
            </View>
            {taskCount.inProgress > 0 && (
              <View style={[styles.taskBadge, styles.inProgressBadge]}>
                <Ionicons name="play-circle-outline" size={12} color="#f59e0b" />
                <Text style={[styles.taskBadgeText, styles.inProgressText]}>
                  {taskCount.inProgress} en progreso
                </Text>
              </View>
            )}
          </View>
        )}

        {!hasPendingTasks && (
          <View style={styles.emptyIndicator}>
            <Text style={styles.emptyIndicatorText}>Sin tareas pendientes</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="person-circle-outline" size={64} color="#94a3b8" />
      </View>
      <Text style={styles.emptyTitle}>Tu espacio personal</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primer tablero personal para organizar tus tareas individuales
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Crear tablero</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mis Tableros</Text>
          <Text style={styles.headerSubtitle}>Workspace Personal</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#203d7f" />
        </TouchableOpacity>
      </View>

      {personalBoards.length > 0 && (
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {personalBoards.length} tablero{personalBoards.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Lista de tableros */}
      <FlatList
        data={personalBoards}
        renderItem={renderBoard}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Modal para crear tablero */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Tablero Personal</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del tablero</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Tareas del Hogar, Proyectos Personales"
                value={boardName}
                onChangeText={setBoardName}
                placeholderTextColor="#94a3b8"
                autoFocus
              />
              <Text style={styles.inputHint}>
                Este tablero será solo tuyo y tendrá las listas: Pending, In Progress y Done.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateBoard}
              >
                <Text style={styles.createButtonText}>Crear</Text>
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
    paddingBottom: 16,
    backgroundColor: '#f8fafc',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
  stats: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#64748b',
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
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  boardDate: {
    fontSize: 12,
    color: '#64748b',
  },
  boardArrow: {
    padding: 4,
  },
  taskIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inProgressBadge: {
    backgroundColor: '#fef3c7',
  },
  taskBadgeText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
  inProgressText: {
    color: '#f59e0b',
  },
  emptyIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyIndicatorText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#203d7f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#203d7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
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
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 16,
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
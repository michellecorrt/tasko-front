import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoards, useWorkspaces } from '../utils/hooks';
import { useAppStore } from '../store';

export default function PersonalBoardsScreen({ navigation }: any) {
  const { workspaces } = useWorkspaces();
  const [modalVisible, setModalVisible] = useState(false);
  const [boardName, setBoardName] = useState('');
  const { setCurrentWorkspace } = useAppStore();

  const personalWorkspace = workspaces.find((w) => w.name === 'Personal');

  const { boards, createBoard, loading, refetch } = useBoards(personalWorkspace?._id);

  const personalBoards = boards.filter(
    (board) => board.workspaceId === personalWorkspace?._id
  );

  // Set current workspace once
  useEffect(() => {
    if (personalWorkspace) {
      setCurrentWorkspace(personalWorkspace);
    }
  }, [personalWorkspace?._id]);

  // Create default board only once if workspace exists and has no boards

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }
    if (!personalWorkspace) {
      Alert.alert('Error', 'No se encontró el workspace personal');
      return;
    }

    const result = await createBoard(personalWorkspace._id, boardName.trim());
    if (result.success) {
      setBoardName('');
      setModalVisible(false);
      Alert.alert('Éxito', 'Tablero creado correctamente');
    } else {
      Alert.alert('Error', result.error || 'No se pudo crear el tablero');
    }
  };

  const renderBoard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() => navigation.navigate('Kanban', { board: item, boardName: item.name })}
      activeOpacity={0.7}
    >
      <View style={styles.boardHeader}>
        <View style={styles.boardIcon}>
          <Ionicons name="grid-outline" size={20} color="#9ca3af" />
        </View>
        <View style={styles.boardInfo}>
          <Text style={styles.boardName}>{item.name}</Text>
          <Text style={styles.boardDate}>
            Creado{' '}
            {new Date(item.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.boardArrow}>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="person-circle-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyTitle}>Tu espacio personal</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primer tablero personal para organizar tus tareas individuales
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Crear tablero</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mis Tableros</Text>
          <Text style={styles.headerSubtitle}>Workspace Personal</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
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

      <FlatList
        data={personalBoards}
        renderItem={renderBoard}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Tablero Personal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del tablero</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Tareas del Hogar"
                value={boardName}
                onChangeText={setBoardName}
                placeholderTextColor="#94a3b8"
                autoFocus
              />
              <Text style={styles.inputHint}>
                Tendrá las listas: Pending, In Progress y Done.
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateBoard}>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: '#f8fafc',
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: '#64748b' },
  addButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  stats: { paddingHorizontal: 20, paddingBottom: 16 },
  statsText: { fontSize: 14, color: '#64748b' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  boardCard: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  boardHeader: { flexDirection: 'row', alignItems: 'center' },
  boardIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  boardInfo: { flex: 1 },
  boardName: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  boardDate: { fontSize: 12, color: '#64748b' },
  boardArrow: { padding: 4 },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b', marginBottom: 8, marginTop: 24, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  emptyButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#203d7f',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 400 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b' },
  modalBody: { padding: 24 },
  inputLabel: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 },
  modalInput: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
    padding: 16, fontSize: 16, color: '#1e293b', backgroundColor: '#f9fafb',
  },
  inputHint: { fontSize: 12, color: '#64748b', marginTop: 8, lineHeight: 16 },
  modalActions: { flexDirection: 'row', padding: 24, paddingTop: 16, gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, alignItems: 'center' },
  createButton: { flex: 1, backgroundColor: '#203d7f', borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

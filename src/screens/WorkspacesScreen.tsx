import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkspaces } from '../utils/hooks';
import { useAuth } from '../utils/hooks';

export default function WorkspacesScreen({ route, navigation }: any) {
  const { workspaces, createWorkspace, updateWorkspace, deleteWorkspace, loading } = useWorkspaces();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  

  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);


  useEffect(() => {
    if (route.params?.openModal) {
      setModalVisible(true);
    }
  }, [route.params]);


  const personalWorkspace = workspaces.find(w => w.name === 'Personal') || {
    _id: 'personal',
    name: 'Personal',
    isDefault: true,
    role: 'owner'
  };

  const otherWorkspaces = workspaces.filter(w => w.name !== 'Personal');
  const allWorkspaces = [personalWorkspace, ...otherWorkspaces];

  const handleCreateOrUpdateWorkspace = async () => {
    if (!workspaceName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    let result;
    if (editingWorkspace) {
      result = await updateWorkspace(editingWorkspace._id, workspaceName.trim());
    } else {
      result = await createWorkspace(workspaceName.trim());
    }

    if (result.success) {
      setWorkspaceName('');
      setEditingWorkspace(null);
      setModalVisible(false);
      Alert.alert('Éxito', editingWorkspace ? 'Workspace actualizado correctamente' : 'Workspace creado correctamente');
    } else {
      Alert.alert('Error', result.error || (editingWorkspace ? 'No se pudo actualizar el workspace' : 'No se pudo crear el workspace'));
    }
  };

  const handleDeleteWorkspace = async (workspace: any) => {
    console.log('handleDeleteWorkspace called for:', workspace.name);
    console.log('Workspace details:', workspace);
    
    if (workspace.name === 'Personal' || workspace.isDefault) {
      Alert.alert('Error', 'No se puede eliminar el workspace Personal');
      return;
    }

    Alert.alert(
      'Eliminar Workspace',
      `¿Estás seguro de que deseas eliminar "${workspace.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed, calling deleteWorkspace...');
            try {
              const result = await deleteWorkspace(workspace._id);
              console.log('Delete result:', result);
              
              if (result.success) {
                Alert.alert('Éxito', 'Workspace eliminado correctamente');
              } else {
                Alert.alert('Error', result.error || 'No se pudo eliminar el workspace');
              }
            } catch (error) {
              console.error('Error deleting workspace:', error);
              Alert.alert('Error', 'Error inesperado al eliminar el workspace');
            }
          }
        }
      ]
    );
  };

  const handleEditWorkspace = (workspace: any) => {
    if (workspace.name === 'Personal' || workspace.isDefault) {
      Alert.alert('Información', 'El workspace Personal no se puede editar');
      return;
    }
    
    setEditingWorkspace(workspace);
    setWorkspaceName(workspace.name);
    setModalVisible(true);
  };

  const showWorkspaceOptions = (workspace: any) => {
    console.log('showWorkspaceOptions called for:', workspace.name);
    console.log('Workspace isDefault:', workspace.isDefault);
    console.log('Workspace role:', workspace.role);
    
    if (workspace.name === 'Personal' || workspace.isDefault) {
      console.log('Cannot edit Personal workspace');
      return;
    }

    console.log('Opening options modal for workspace:', workspace.name);
    setSelectedWorkspace(workspace);
    setOptionsModalVisible(true);
  };


  const handleOptionEdit = () => {
    console.log('handleOptionEdit called for:', selectedWorkspace?.name);
    setOptionsModalVisible(false);
    if (selectedWorkspace) {
      handleEditWorkspace(selectedWorkspace);
    }
  };

  const handleOptionDelete = () => {
    console.log('handleOptionDelete called for:', selectedWorkspace?.name);
    setOptionsModalVisible(false);
    
    if (selectedWorkspace) {
      console.log('About to delete workspace:', selectedWorkspace);
      
 
      if (selectedWorkspace.name === 'Personal' || selectedWorkspace.isDefault) {
        console.log('Cannot delete Personal workspace');
        Alert.alert('Error', 'No se puede eliminar el workspace Personal');
        return;
      }
      
      handleDeleteWorkspace(selectedWorkspace);
    }
  };

  const handleCloseOptionsModal = () => {
    setOptionsModalVisible(false);
    setSelectedWorkspace(null);
  };

  const renderWorkspace = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.workspaceCard}
      onPress={() => navigation.navigate('Boards', { workspace: item })}
      activeOpacity={0.7}
    >
      <View style={styles.workspaceHeader}>
        <View style={styles.workspaceIcon}>
          <Ionicons 
            name={item.name === 'Personal' ? 'person' : 'business'} 
            size={20} 
            color="#203d7f" 
          />
        </View>
        <View style={styles.workspaceInfo}>
          <Text style={styles.workspaceName}>{item.name}</Text>
          <Text style={styles.workspaceRole}>
            {item.role === 'owner' ? 'Propietario' : item.role === 'admin' ? 'Admin' : 'Miembro'}
          </Text>
        </View>
        <View style={styles.workspaceActions}>
          {item.name !== 'Personal' && !item.isDefault && (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                console.log('More button pressed for workspace:', item.name);
                console.log('Item details:', item);
                showWorkspaceOptions(item);
              }}
              style={styles.moreButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.6}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
          <View style={styles.workspaceArrow}>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingWorkspace(null);
    setWorkspaceName('');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workspaces</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#203d7f" />
        </TouchableOpacity>
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          Toca un workspace para ver sus tableros
        </Text>
      </View>

      {/* Lista de workspaces */}
      <FlatList
        data={allWorkspaces}
        renderItem={renderWorkspace}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
      />

      {/* Modal de opciones personalizado */}
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
                {selectedWorkspace?.name}
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

      {/* Modal para crear/editar workspace */}
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
                {editingWorkspace ? 'Editar Workspace' : 'Nuevo Workspace'}
              </Text>
              <TouchableOpacity 
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del workspace</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Mi Empresa"
                value={workspaceName}
                onChangeText={setWorkspaceName}
                placeholderTextColor="#94a3b8"
                autoFocus
              />
              <Text style={styles.inputHint}>
                Los workspaces te permiten organizar proyectos separados con sus propios tableros y tareas.
              </Text>
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
                onPress={handleCreateOrUpdateWorkspace}
              >
                <Text style={styles.createButtonText}>
                  {editingWorkspace ? 'Actualizar' : 'Crear'}
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
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
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
  subHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  subHeaderText: {
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
  workspaceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  workspaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  workspaceRole: {
    fontSize: 12,
    color: '#64748b',
  },
  workspaceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 12,
    marginRight: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
  },
  workspaceArrow: {
    padding: 4,
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
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { useKanban } from '../utils/hooks';

export default function CreateTaskScreen({ route, navigation }: any) {
  const { preSelectedList, preSelectedListId, board } = route.params || {};
  const { currentBoard, user } = useAppStore();
  const usedBoard = board || currentBoard;

  const { lists, createCard, refetch } = useKanban(usedBoard?._id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default selected list once lists are loaded
  useEffect(() => {
    if (lists.length === 0) return;

    if (preSelectedListId) {
      const found = lists.find((l) => l._id === preSelectedListId);
      setSelectedListId(found ? preSelectedListId : lists[0]._id);
    } else if (preSelectedList) {
      const found = lists.find((l) => l.type === preSelectedList);
      setSelectedListId(found ? found._id : lists[0]._id);
    } else {
      setSelectedListId(lists[0]._id);
    }
  }, [lists.length, preSelectedListId, preSelectedList]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la tarea');
      return;
    }
    if (!usedBoard) {
      Alert.alert('Error', 'No hay tablero seleccionado');
      return;
    }
    if (!selectedListId) {
      Alert.alert('Error', 'Por favor selecciona un estado para la tarea');
      return;
    }

    const selectedList = lists.find((l) => l._id === selectedListId);
    if (!selectedList) {
      Alert.alert('Error', 'Lista no encontrada');
      return;
    }

    setLoading(true);

    const result = await createCard({
      title: title.trim(),
      desc: description.trim(),
      listId: selectedListId,
      boardId: usedBoard._id,
      list: selectedList.type || 'pending',
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', `Tarea "${title.trim()}" creada correctamente`, [
        { text: 'Crear otra', onPress: () => { setTitle(''); setDescription(''); } },
        { text: 'Ver tablero', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'No se pudo crear la tarea');
    }
  };

  const renderListOption = (list: any) => (
    <TouchableOpacity
      key={list._id}
      style={[styles.listOption, selectedListId === list._id && styles.listOptionSelected]}
      onPress={() => setSelectedListId(list._id)}
      activeOpacity={0.7}
    >
      <View style={styles.listOptionContent}>
        <View style={[styles.colorIndicator, { backgroundColor: list.color || '#64748b' }]} />
        <View style={[styles.radioButton, selectedListId === list._id && styles.radioButtonSelected]}>
          {selectedListId === list._id && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={[styles.listOptionText, selectedListId === list._id && styles.listOptionTextSelected]}>
          {list.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!usedBoard) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No hay tablero seleccionado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Tarea</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Board info */}
        <View style={styles.boardInfo}>
          <Ionicons name="folder" size={20} color="#64748b" />
          <Text style={styles.boardName}>{usedBoard?.name}</Text>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Nombre de la Tarea<Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Ej: Revisar documentación del proyecto"
            value={title}
            onChangeText={setTitle}
            multiline
            placeholderTextColor="#94a3b8"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descripción</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Añade detalles sobre la tarea..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* List selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Estado<Text style={styles.required}> *</Text>
          </Text>
          {lists.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={24} color="#64748b" />
              <Text style={styles.loadingText}>Cargando listas...</Text>
            </View>
          ) : (
            <View style={styles.listSelector}>{lists.map(renderListOption)}</View>
          )}
        </View>

        {/* Create button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (loading || !selectedListId || !title.trim()) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={loading || !selectedListId || !title.trim()}
          activeOpacity={0.8}
        >
          <Ionicons
            name={loading ? 'hourglass-outline' : 'checkmark-circle'}
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.createButtonText}>
            {loading ? 'Creando...' : 'Crear Tarea'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 20, backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'center',
  },
  content: { flex: 1, paddingHorizontal: 20 },
  boardInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe',
    padding: 12, borderRadius: 8, marginBottom: 24,
  },
  boardName: { fontSize: 14, fontWeight: '500', color: '#0369a1', marginLeft: 8 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  required: { color: '#ef4444' },
  titleInput: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16,
    color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', minHeight: 60,
    textAlignVertical: 'top', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  descriptionInput: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16,
    color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', minHeight: 120,
    textAlignVertical: 'top', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  charCount: { fontSize: 12, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  loadingContainer: {
    backgroundColor: '#fff', borderRadius: 12, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  loadingText: { color: '#64748b', fontSize: 14, marginTop: 8 },
  listSelector: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#e2e8f0', overflow: 'hidden',
  },
  listOption: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  listOptionSelected: { backgroundColor: '#eff6ff' },
  listOptionContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  radioButton: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#d1d5db', marginRight: 12, alignItems: 'center', justifyContent: 'center',
  },
  radioButtonSelected: { borderColor: '#203d7f' },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#203d7f' },
  listOptionText: { fontSize: 16, color: '#64748b', flex: 1 },
  listOptionTextSelected: { color: '#203d7f', fontWeight: '600' },
  createButton: {
    backgroundColor: '#203d7f', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 40, shadowColor: '#203d7f', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  createButtonDisabled: { opacity: 0.6 },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b', marginTop: 16, textAlign: 'center' },
});

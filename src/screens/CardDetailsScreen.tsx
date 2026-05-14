import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cardAPI } from '../services/api';
import { useAppStore } from '../store';
import { Card } from '../types';

export default function CardDetailsScreen({ route, navigation }: any) {
  const { card: initialCard } = route.params;
  const [card, setCard] = useState<Card>(initialCard);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.desc || '');
  const { updateCard, removeCard } = useAppStore();

  const handleSave = async () => {
    try {
      const updates: Partial<Card> = {};
      if (title !== card.title) updates.title = title;
      if (description !== card.desc) updates.desc = description;

      if (Object.keys(updates).length > 0) {
        const response = await cardAPI.update(card._id, updates);
        const updatedCard = response.data;
        setCard(updatedCard);
        updateCard(card._id, updatedCard);
        Alert.alert('Éxito', 'Tarea actualizada');
      }
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await cardAPI.delete(card._id);
      removeCard(card._id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la tarea');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0f172a" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de Tarea</Text>
          <View style={styles.headerActions}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.headerButton}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.headerButton, styles.saveButton]}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                  <Ionicons name="pencil" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#203d7f" />
            <Text style={styles.sectionTitle}>Título</Text>
          </View>
          <View style={styles.sectionContent}>
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Título de la tarea"
                multiline
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.title}>{card.title}</Text>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="reader-outline" size={20} color="#203d7f" />
            <Text style={styles.sectionTitle}>Descripción</Text>
          </View>
          <View style={styles.sectionContent}>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Añadir descripción..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.description}>{card.desc || 'Sin descripción'}</Text>
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#203d7f" />
            <Text style={styles.sectionTitle}>Información</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de creación</Text>
              <Text style={styles.infoValue}>
                {new Date(card.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>
                {new Date(card.updatedAt).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </View>
            {card.due ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
                <View style={styles.dueDateContainer}>
                  <Ionicons name="time-outline" size={16} color="#f59e0b" />
                  <Text style={styles.dueDateText}>
                    {new Date(card.due).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Checklist */}
        {card.checklist && card.checklist.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkbox-outline" size={20} color="#203d7f" />
              <Text style={styles.sectionTitle}>Lista de verificación</Text>
              <View style={styles.checklistProgress}>
                <Text style={styles.checklistProgressText}>
                  {card.checklist.filter((i) => i.done).length}/{card.checklist.length}
                </Text>
              </View>
            </View>
            <View style={styles.sectionContent}>
              {card.checklist.map((item, index) => (
                <View key={index} style={styles.checklistItem}>
                  <Ionicons
                    name={item.done ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={item.done ? '#10b981' : '#64748b'}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[styles.checklistText, item.done && styles.checklistTextDone]}>
                    {item.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#0f172a', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 8, marginLeft: 8 },
  saveButton: { backgroundColor: '#10b981', borderRadius: 6 },
  content: { flex: 1, backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24 },
  section: {
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginLeft: 12, flex: 1 },
  sectionContent: { padding: 20 },
  title: { fontSize: 18, fontWeight: '600', color: '#1e293b', lineHeight: 26 },
  titleInput: {
    fontSize: 18, fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, padding: 16, textAlignVertical: 'top', backgroundColor: '#f9fafb', minHeight: 60,
  },
  description: { fontSize: 16, color: '#64748b', lineHeight: 24 },
  descriptionInput: {
    fontSize: 16, color: '#64748b', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, padding: 16, textAlignVertical: 'top', backgroundColor: '#f9fafb', minHeight: 120,
  },
  infoItem: { gap: 6, marginBottom: 16 },
  infoLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  dueDateContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start',
  },
  dueDateText: { fontSize: 14, color: '#d97706', marginLeft: 6, fontWeight: '600' },
  checklistProgress: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  checklistProgressText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  checklistItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  checklistText: { fontSize: 16, color: '#1e293b', flex: 1, lineHeight: 24 },
  checklistTextDone: { textDecorationLine: 'line-through', color: '#64748b' },
});

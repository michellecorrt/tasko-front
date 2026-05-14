import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { useKanban } from '../utils/hooks';
import { Card } from '../types';

const LIST_META: Record<string, { color: string; icon: string; label: string }> = {
  pending:    { color: '#ef4444', icon: 'time-outline',             label: 'Pending' },
  inprogress: { color: '#f59e0b', icon: 'play-circle-outline',      label: 'In Progress' },
  done:       { color: '#10b981', icon: 'checkmark-circle-outline', label: 'Done' },
};

export default function KanbanScreen({ route, navigation }: any) {
  const { board } = route.params || {};
  const { setCurrentBoard } = useAppStore();
  const { cards, lists, loading, refetch } = useKanban(board?._id);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (board) {
      setCurrentBoard(board);
    }
  }, [board?._id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getCardsForList = (listId: string) => {
    return cards
      .filter((card) => card.listId === listId || card.list === listId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const renderCard = (card: Card) => (
    <TouchableOpacity
      key={card._id}
      style={styles.card}
      onPress={() => navigation.navigate('CardDetails', { card })}
      activeOpacity={0.7}
    >
      <Text style={styles.cardTitle}>{card.title}</Text>
      {card.desc ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{card.desc}</Text>
      ) : null}
      <View style={styles.cardFooter}>
        {card.due ? (
          <View style={styles.cardDue}>
            <Ionicons name="time-outline" size={12} color="#f59e0b" />
            <Text style={styles.cardDueText}>
              {new Date(card.due).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        ) : null}
        {card.checklist && card.checklist.length > 0 ? (
          <View style={styles.cardChecklist}>
            <Ionicons name="checkbox-outline" size={12} color="#64748b" />
            <Text style={styles.cardChecklistText}>
              {card.checklist.filter((i) => i.done).length}/{card.checklist.length}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderList = (list: any) => {
    const meta = LIST_META[list.type] || { color: '#64748b', icon: 'list-outline', label: list.name };
    const listCards = getCardsForList(list._id);

    return (
      <View key={list._id} style={styles.list}>
        <View style={styles.listHeader}>
          <View style={styles.listTitleContainer}>
            <Ionicons name={meta.icon as any} size={16} color={meta.color} style={{ marginRight: 8 }} />
            <Text style={[styles.listTitle, { color: meta.color }]}>
              {list.name.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.cardCount, { backgroundColor: meta.color + '20' }]}>
            <Text style={[styles.cardCountText, { color: meta.color }]}>{listCards.length}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {listCards.length > 0 ? (
            listCards.map(renderCard)
          ) : (
            <View style={styles.emptyList}>
              <Ionicons name="folder-outline" size={32} color="#cbd5e1" />
              <Text style={styles.emptyListText}>Sin tareas</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.addCard, { borderColor: meta.color + '40' }]}
          onPress={() =>
            navigation.navigate('CreateTask', {
              preSelectedList: list.type,
              preSelectedListId: list._id,
              board,
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={meta.color} />
          <Text style={[styles.addCardText, { color: meta.color }]}>Agregar tarea</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!board) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>No se encontró el tablero</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{board.name}</Text>
            <Text style={styles.headerSubtitle}>{cards.length} tareas</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('CreateTask', { board })}
          >
            <Ionicons name="add" size={20} color="#203d7f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#203d7f" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        style={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#203d7f" />
        }
      >
        {lists.length > 0 ? (
          lists
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(renderList)
        ) : (
          <View style={styles.emptyBoard}>
            <Ionicons name="grid-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyBoardText}>Cargando listas...</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask', { board })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: '#f8fafc',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitleContainer: { marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  headerSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16 },
  list: {
    width: 280, backgroundColor: '#fff', borderRadius: 12, marginRight: 16,
    maxHeight: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  listTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  listTitle: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  cardCount: {
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    minWidth: 24, alignItems: 'center',
  },
  cardCountText: { fontSize: 12, fontWeight: '600' },
  cardsContainer: { flex: 1, paddingHorizontal: 16, minHeight: 200 },
  emptyList: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyListText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 },
  emptyBoard: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyBoardText: { fontSize: 14, color: '#94a3b8', marginTop: 12 },
  card: {
    backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#1e293b', marginBottom: 8, lineHeight: 20 },
  cardDesc: { fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDue: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  cardDueText: { fontSize: 10, color: '#d97706', marginLeft: 2, fontWeight: '500' },
  cardChecklist: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  cardChecklistText: { fontSize: 10, color: '#64748b', marginLeft: 2, fontWeight: '500' },
  addCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, margin: 16, marginTop: 8, backgroundColor: '#f8fafc',
    borderRadius: 8, borderWidth: 1, borderStyle: 'dashed',
  },
  addCardText: { fontSize: 14, marginLeft: 8, fontWeight: '500' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#203d7f', alignItems: 'center',
    justifyContent: 'center', shadowColor: '#203d7f', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f8fafc', paddingHorizontal: 40,
  },
  errorText: { fontSize: 18, color: '#ef4444', fontWeight: '500', marginTop: 16, textAlign: 'center' },
  backButton: {
    backgroundColor: '#203d7f', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 8, marginTop: 24,
  },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

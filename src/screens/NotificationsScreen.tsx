import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../utils/hooks';

export default function NotificationsScreen({ navigation }: any) {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'add-circle';
      case 'task_moved':
        return 'arrow-forward-circle';
      case 'task_completed':
        return 'checkmark-circle';
      case 'task_assigned':
        return 'person-add';
      case 'comment_added':
        return 'chatbubble';
      case 'due_date_reminder':
        return 'time';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_created':
        return '#10b981';
      case 'task_moved':
        return '#3b82f6';
      case 'task_completed':
        return '#10b981';
      case 'task_assigned':
        return '#8b5cf6';
      case 'comment_added':
        return '#f59e0b';
      case 'due_date_reminder':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'Nueva tarea creada';
      case 'task_moved':
        return 'Tarea movida';
      case 'task_completed':
        return 'Tarea completada';
      case 'task_assigned':
        return 'Tarea asignada';
      case 'comment_added':
        return 'Nuevo comentario';
      case 'due_date_reminder':
        return 'Fecha límite próxima';
      default:
        return 'Notificación';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} d`;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const renderNotification = (item: any) => (
    <TouchableOpacity 
      key={item._id} 
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard
      ]}
      onPress={() => {
        if (!item.read) {
          markAsRead(item._id);
        }
        
// no navegar sin card completo
      }}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: `${getNotificationColor(item.type)}20` }
        ]}>
          <Ionicons 
            name={getNotificationIcon(item.type)} 
            size={20} 
            color={getNotificationColor(item.type)} 
          />
        </View>
        
        <View style={styles.textContent}>
          <Text style={styles.notificationTitle}>
            {getNotificationTitle(item.type)}
          </Text>
          <Text style={styles.notificationDescription}>
            {item.message}
          </Text>
          {/* Mostrar usuario y estado si existen */}
          {(item.user || item.status) && (
            <Text style={styles.notificationMeta}>
              {item.user && `Por: ${item.user}`}
              {item.user && item.status && ' | '}
              {item.status && `Estado: ${item.status}`}
            </Text>
          )}
          <Text style={styles.notificationTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-outline" size={48} color="#94a3b8" />
      </View>
      <Text style={styles.emptyTitle}>No hay notificaciones</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'unread' 
          ? 'No tienes notificaciones sin leer'
          : 'Cuando tengas actividad en tus tareas, aparecerán aquí'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.headerActions}>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={20} color="#203d7f" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.filterTextActive
          ]}>
            Todas ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filter === 'unread' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            filter === 'unread' && styles.filterTextActive
          ]}>
            Sin leer ({notifications.filter(n => !n.read).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredNotifications.length > 0 
          ? filteredNotifications.map(renderNotification)
          : renderEmptyState()
        }
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#203d7f',
    borderColor: '#203d7f',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#203d7f',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#203d7f',
    marginTop: 6,
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
});
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/hooks';
import { useAppStore } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const { workspaces, boards, cards, lists } = useAppStore();

 
  const personalWorkspace = workspaces.find(w => w.name === 'Personal');
  const personalBoards = boards.filter(b => b.workspaceId === personalWorkspace?._id);
  
 
  const allTasks = cards.length;
  
 
  const completedTasks = cards.filter(card => {
  
    const cardList = lists.find(list => 
      list._id === card.listId || 
      list._id === card.list ||
      list.type === card.list ||
      list.type === card.listId
    );
    
    return (
      card.list === 'done' || 
      card.listId === 'done' ||
      cardList?.type === 'done' ||
      cardList?.name?.toLowerCase().includes('done') ||
      cardList?.name?.toLowerCase().includes('completada')
    );
  }).length;

  const pendingTasks = cards.filter(card => {
    
    const cardList = lists.find(list => 
      list._id === card.listId || 
      list._id === card.list ||
      list.type === card.list ||
      list.type === card.listId
    );
    
    return (
      card.list === 'pending' || 
      card.listId === 'pending' ||
      cardList?.type === 'pending' ||
      cardList?.name?.toLowerCase().includes('pending') ||
      cardList?.name?.toLowerCase().includes('pendiente')
    );
  }).length;

  const inProgressTasks = cards.filter(card => {
   
    const cardList = lists.find(list => 
      list._id === card.listId || 
      list._id === card.list ||
      list.type === card.list ||
      list.type === card.listId
    );
    
    return (
      card.list === 'inprogress' || 
      card.listId === 'inprogress' ||
      cardList?.type === 'inprogress' ||
      cardList?.name?.toLowerCase().includes('progress') ||
      cardList?.name?.toLowerCase().includes('progreso')
    );
  }).length;

  
  console.log('=== PROFILE SCREEN STATS DEBUG ===');
  console.log('Total cards:', cards.length);
  console.log('Total lists:', lists.length);
  console.log('Cards details:', cards.map(c => ({ 
    title: c.title, 
    list: c.list, 
    listId: c.listId 
  })));
  console.log('Lists details:', lists.map(l => ({ 
    name: l.name, 
    type: l.type, 
    id: l._id 
  })));
  console.log('Pending:', pendingTasks);
  console.log('In Progress:', inProgressTasks);
  console.log('Completed:', completedTasks);


  const handleLogout = () => {
    console.log('🔴 HANDLE LOGOUT CALLED');
    const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmed) {
      AsyncStorage.clear().catch(() => {});
      logout();
    }
  };

  const showComingSoon = (feature: string) => {
    Alert.alert(
      'Próximamente',
      `La función ${feature} estará disponible en una próxima actualización.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, rightElement, danger = false }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, danger && styles.menuItemDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={danger ? '#ef4444' : '#203d7f'} 
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={danger ? '#ef4444' : '#94a3b8'} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header con perfil */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
            <Text style={styles.profileJoined}>
              Miembro desde {new Date().toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estadísticas reales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Actividad</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>{completedTasks}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="time" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>{inProgressTasks}</Text>
              <Text style={styles.statLabel}>En Progreso</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="list-circle" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statNumber}>{pendingTasks}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
          
          <View style={styles.secondaryStats}>
            <View style={styles.secondaryStatItem}>
              <Ionicons name="grid" size={16} color="#64748b" />
              <Text style={styles.secondaryStatText}>
                {personalBoards.length} tableros personales
              </Text>
            </View>
            <View style={styles.secondaryStatItem}>
              <Ionicons name="business" size={16} color="#64748b" />
              <Text style={styles.secondaryStatText}>
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.secondaryStatItem}>
              <Ionicons name="document-text" size={16} color="#64748b" />
              <Text style={styles.secondaryStatText}>
                {allTasks} tareas totales
              </Text>
            </View>
          </View>
        </View>

        {/* Información de la cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="person-outline"
              title="Información personal"
              subtitle="Nombre y email"
              onPress={() => showComingSoon('edición de perfil')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Seguridad"
              subtitle="Contraseña y privacidad"
              onPress={() => showComingSoon('configuración de seguridad')}
            />
          </View>
        </View>

        {/* Configuración de la app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="notifications-outline"
              title="Notificaciones"
              subtitle="Configurar alertas y recordatorios"
              onPress={() => showComingSoon('configuración de notificaciones')}
            />
          </View>
        </View>

        {/* Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="help-circle-outline"
              title="Centro de ayuda"
              subtitle="Preguntas frecuentes y guías"
              onPress={() => showComingSoon('centro de ayuda')}
            />
            <MenuItem
              icon="bug-outline"
              title="Reportar problema"
              subtitle="Enviar feedback o reportar un error"
              onPress={() => showComingSoon('reporte de problemas')}
            />
            <MenuItem
              icon="information-circle-outline"
              title="Acerca de Task.o"
              subtitle="Versión 1.0.0"
              onPress={() => Alert.alert(
                'Task.o v1.0.0',
                'Aplicación de gestión de tareas y proyectos.\n\nDesarrollado con React Native.',
                [{ text: 'OK' }]
              )}
            />
          </View>
        </View>

        {/* Cerrar sesión - ✅ FUNCIONALIDAD CORREGIDA */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out-outline"
              title="Cerrar sesión"
              subtitle="Salir de tu cuenta"
              onPress={handleLogout}
              danger={true}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Task.o. Todos los derechos reservados.
          </Text>
        </View>
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
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#203d7f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  profileJoined: {
    fontSize: 12,
    color: '#94a3b8',
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  secondaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    gap: 8,
  },
  secondaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryStatText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#fef2f2',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  dangerText: {
    color: '#ef4444',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
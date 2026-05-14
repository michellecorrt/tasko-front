import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import { useAuth } from '../utils/hooks';
import { useAppStore } from '../store'; 

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WorkspacesScreen from '../screens/WorkspacesScreen';
import BoardsScreen from '../screens/BoardsScreen';
import PersonalBoardsScreen from '../screens/PersonalBoardScreen'; 
import KanbanScreen from '../screens/KanbanScreen';
import CardDetailsScreen from '../screens/CardDetailsScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Bar
const TabIcon = ({ name, focused, color, size, badge }: any) => (
  <View style={{ position: 'relative' }}>
    <Ionicons name={name} size={size} color={color} />
    {badge && badge > 0 && (
      <View style={{
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: '#ef4444',
        borderRadius: 6,
        minWidth: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ 
          color: 'white', 
          fontSize: 8, 
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {badge > 9 ? '9+' : badge}
        </Text>
      </View>
    )}
  </View>
);

const MainTabs = () => {
  
  const { notifications } = useAppStore();
  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let badge: number | null = null;

          switch (route.name) {
            case 'WorkspacesTab':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'PersonalBoardsTab':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            case 'CreateWorkspaceTab':
              iconName = 'add-circle';
              return (
                <View style={{
                  backgroundColor: '#203d7f',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -20,
                  shadowColor: '#203d7f',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}>
                  <Ionicons name="add" size={28} color="#fff" />
                </View>
              );
            case 'NotificationsTab':
              iconName = focused ? 'notifications' : 'notifications-outline';
              badge = unreadNotifications; 
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <TabIcon 
              name={iconName}
              focused={focused}
              color={color}
              size={size}
              badge={badge}
            />
          );
        },
        tabBarActiveTintColor: '#203d7f',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: { 
          backgroundColor: '#0f172a',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="WorkspacesTab" 
        component={WorkspacesScreen}
        options={{ 
          title: 'Workspaces',
          tabBarLabel: 'Workspaces',
          headerTitle: 'Task.o'
        }}
      />
      <Tab.Screen 
        name="PersonalBoardsTab" 
        component={PersonalBoardsScreen}
        options={{ 
          title: 'Mis Tableros',
          tabBarLabel: 'Personal',
          headerTitle: 'Mis Tableros'
        }}
      />
      <Tab.Screen 
        name="CreateWorkspaceTab" 
        component={WorkspacesScreen} 
        options={{ 
          title: '',
          tabBarLabel: 'Añadir',
          headerTitle: 'Nuevo Workspace'
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            
            e.preventDefault();
            
            navigation.navigate('WorkspacesTab', { openModal: true });
          },
        })}
      />
      <Tab.Screen 
        name="NotificationsTab" 
        component={NotificationsScreen}
        options={{ 
          title: 'Notificaciones',
          tabBarLabel: 'Alertas',
          headerTitle: 'Notificaciones'
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ 
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          headerTitle: 'Mi Perfil'
        }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs} 
      options={{ headerShown: false }}
    />
    {/* */}
    <Stack.Screen 
      name="Boards" 
      component={BoardsScreen}
      options={({ route }: any) => ({ 
        title: route.params?.workspace?.name || 'Tableros',
        headerStyle: { 
          backgroundColor: '#0f172a',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      })}
    />
    <Stack.Screen 
      name="Kanban" 
      component={KanbanScreen}
      options={({ route }: any) => ({ 
        title: route.params?.board?.name || 'Tablero',
        headerStyle: { 
          backgroundColor: '#0f172a',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      })}
    />
    <Stack.Screen 
      name="CardDetails" 
      component={CardDetailsScreen}
      options={{ 
        title: 'Detalles de Tarea',
        headerStyle: { 
          backgroundColor: '#0f172a',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    />
    <Stack.Screen 
      name="CreateTask" 
      component={CreateTaskScreen}
      options={{ 
        title: 'Nueva Tarea',
        headerStyle: { 
          backgroundColor: '#0f172a',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    />
  </Stack.Navigator>
);

export default function AppNavigation() {
  const { loading } = useAuth();
  const { isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  
  React.useEffect(() => {
    console.log('=== APP NAVIGATION AUTH CHANGE ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading (useAuth):', loading);
    console.log('isLoading (splash):', isLoading);
  }, [isAuthenticated, loading, isLoading]);

  // Splash
  const showSplash = isLoading || loading;

  console.log('=== APP NAVIGATION RENDER ===');
  console.log('isLoading (splash):', isLoading);
  console.log('loading (useAuth):', loading);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('showSplash:', showSplash);
  console.log('Final decision:', showSplash ? 'SPLASH' : (isAuthenticated ? 'APP' : 'AUTH'));
  

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : isAuthenticated ? (
          <Stack.Screen 
            name="App" 
            component={AppStack}
            key="authenticated"
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthStack}
            key="not-authenticated"
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
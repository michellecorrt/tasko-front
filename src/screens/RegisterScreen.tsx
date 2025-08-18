import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../utils/hooks';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState('Registrar');
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!name || !lastName || !email || !password || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }


    const result = await register(name, lastName, email, password, phone);
    
    if (result.success) {
      
      Alert.alert(
        '¡Registro Exitoso!', 
        result.message || '¡Tu cuenta ha sido creada correctamente! Ahora puedes iniciar sesión con tus credenciales.',
        [
          {
            text: 'Continuar',
            style: 'default',
            onPress: () => {
              setName('');
              setLastName('');
              setEmail('');
              setPassword('');
              setPhone('');
              navigation.navigate('Login');
            }
          }
        ],
        { 
          cancelable: false 
        }
      );
    } else {
 
      Alert.alert(
        'Error de Registro', 
        result.error || 'Ocurrió un error al crear tu cuenta. Intenta nuevamente.',
        [
          {
            text: 'Intentar de nuevo',
            style: 'default'
          }
        ]
      );
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#162032']} style={styles.container}>
      {/* Círculos decorativos */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <View style={styles.content}>
        <Text style={styles.title}>Crea una cuenta</Text>
        <Text style={styles.subtitle}>Regístrate y gestiona todo en un solo lugar</Text>
        
        <View style={styles.form}>
          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Login' && styles.activeTab]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Registrar' && styles.activeTab]}
              onPress={() => setActiveTab('Registrar')}
            >
              <Text style={[styles.tabText, activeTab === 'Registrar' && styles.activeTabText]}>
                Registrar
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#64748b"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#64748b"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#64748b"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#64748b"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#64748b"
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '⏳ Creando cuenta...' : ' Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          {/* */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Procesando registro...</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: '#243043',
    opacity: 0.2,
    top: -350,
    left: -200,
  },
  circle2: {
    position: 'absolute',
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: '#162032',
    opacity: 0.3,
    top: -275,
    left: -125,
  },
  circle3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#243043',
    opacity: 0.4,
    top: -200,
    left: -75,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    flex: 1,
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    padding: 6,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0f172a',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#203d7f',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    height: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
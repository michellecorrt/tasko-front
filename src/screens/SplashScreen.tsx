import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  return (
    <LinearGradient colors={['#0f172a', '#162032']} style={styles.container}>
      {/* Círculos  */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Task.o</Text>
        <Text style={styles.subtitle}>Gestiona tus ideas en un solo lugar</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '400',
  },
});
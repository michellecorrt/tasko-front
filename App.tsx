import React from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import AppNavigation from './src/navigation/AppNavigation';

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#1E3A8A" />
      <AppNavigation />
    </>
  );
}
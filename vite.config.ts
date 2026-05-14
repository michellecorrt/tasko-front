import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfill AsyncStorage for web
      '@react-native-async-storage/async-storage': '/src/utils/asyncStorageWeb.ts',
    },
  },
})

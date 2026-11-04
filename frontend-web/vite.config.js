import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expone la web en la red local (http://IP:5173)
    port: 5173,
  },
});

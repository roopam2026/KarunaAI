import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue(), etc.

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  base: '/KarunaAI/', // 👈 ADD THIS LINE (keep the slashes!)
})

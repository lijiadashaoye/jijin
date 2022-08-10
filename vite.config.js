import {
    defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
export default defineConfig({
    plugins: [vue(), ],
    server: {
        port: 3234,
        open: true,
    },
    resolve: {
        alias: {
            '@/': `${path.resolve(__dirname, 'src')}/`,
        }
    },
})
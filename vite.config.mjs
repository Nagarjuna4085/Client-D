import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        include: ['process', 'buffer', 'parse'] // pre-bundle parse too
    },
    plugins: [
        vue(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            stream: 'stream-browserify',
            util: 'util',
            buffer: 'buffer',
            process: 'process/browser'
        }
    },
    define: {
        global: 'window',
        'process.env': {},
        module: {} // avoid "module is not defined" errors in some libs
    },
    build: {
        rollupOptions: {
            plugins: [nodePolyfills()]
        }
    }
});

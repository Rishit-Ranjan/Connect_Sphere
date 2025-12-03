import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return {
        resolve: {
            alias: { '@': path.resolve(__dirname, './src') }
        }
    };
});

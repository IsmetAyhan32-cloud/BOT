import { defineConfig } from 'vite';

let reactPluginFactory;
try {
  const reactModule = await import('@vitejs/plugin-react');
  reactPluginFactory = reactModule.default;
} catch (error) {
  console.warn('Vite React eklentisi yüklenemedi, boş eklenti kullanılacak:', error?.message ?? error);
  reactPluginFactory = () => ({ name: 'noop-react-plugin' });
}

export default defineConfig({
  plugins: [reactPluginFactory()],
});

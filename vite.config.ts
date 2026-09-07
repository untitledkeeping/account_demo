import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { apiRouter } from './src/server/routes/api';
import { swaggerSpec } from './src/server/swagger';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true, limit: '50mb' }));

      // Swagger spec endpoint
      app.get('/api/docs/swagger.json', (_req, res) => res.json(swaggerSpec));

      // Swagger UI setup
      app.use('/api/docs', (req, res, next) => {
        if (req.path === '' || req.path === '/') {
          return (swaggerUi.setup(swaggerSpec) as any)(req, res, next);
        }
        next();
      });
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

      // API v1 router
      app.use('/api/v1', apiRouter);

      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

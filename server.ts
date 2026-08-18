// server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import swaggerUi from 'swagger-ui-express';
import { apiRouter } from './src/server/routes/api';
import { swaggerSpec } from './src/server/swagger';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multi-tenant header extraction middleware
app.use('/api', (req, res, next) => {
  const firmId = (req.headers['x-firm-id'] as string) || 'firm-studio-books-001';
  const clientId = (req.headers['x-client-id'] as string) || '';
  const userId = (req.headers['x-user-id'] as string) || 'usr-sarah-04';
  const userName = (req.headers['x-user-name'] as string) || 'Sarah Tremblay, CPA';

  (req as any).tenant = { firmId, clientId, userId, userName };
  next();
});

// Mount Swagger Interactive API Docs
app.get('/api/docs/swagger.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount API routes
app.use('/api/v1', apiRouter);

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Studio Books Server running on http://${HOST}:${PORT}`);
    console.log(`📊 API endpoints available at http://${HOST}:${PORT}/api/v1/health`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

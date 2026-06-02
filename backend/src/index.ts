import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import apiRoutes from './api/routes';
import { validateProviders } from './config/providers';

// ============================================================
// Express Server Entry Point
// ============================================================

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    // Validate AI providers are configured
    validateProviders();

    app.listen(PORT, () => {
      console.log(`\n🚀 OneAtlas Backend running on http://localhost:${PORT}`);
      console.log(`   Health:       http://localhost:${PORT}/health`);
      console.log(`   Generate:     POST http://localhost:${PORT}/api/generate`);
      console.log(`   Stream:       GET  http://localhost:${PORT}/api/generate/:jobId/stream`);
      console.log(`   Status:       GET  http://localhost:${PORT}/api/generate/:jobId`);
      console.log(`   Integrations: GET  http://localhost:${PORT}/api/integrations`);
      console.log(`   Repair:       POST http://localhost:${PORT}/api/generate/:jobId/repair\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Load environment variables FIRST (before any other imports)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import analyzeRouter from './routes/analyze.js';

// Validate configuration before starting
validateConfig();

const app = express();

// ======================
// MIDDLEWARE
// ======================

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ======================
// ROUTES
// ======================

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Main analyze endpoint
app.use('/api/analyze', analyzeRouter);

// ======================
// ERROR HANDLING
// ======================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Global error handler
app.use(errorHandler);

// ======================
// START SERVER
// ======================

app.listen(config.port, () => {
  console.log(`
🚀 Hiring Signal Analyzer API
   
   Server:  http://localhost:${config.port}
   Health:  http://localhost:${config.port}/health
   Analyze: POST http://localhost:${config.port}/api/analyze

   Press Ctrl+C to stop
  `);
});

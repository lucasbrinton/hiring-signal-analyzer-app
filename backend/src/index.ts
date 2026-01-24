/**
 * @fileoverview Express Server Entry Point - Hiring Signal Analyzer API
 *
 * This is the main entry point for the backend server. It configures:
 * - Express middleware (CORS, body parsing, error handling)
 * - API routes (/api/analyze for resume analysis)
 * - Health check endpoint (/health for monitoring)
 *
 * Architecture Notes:
 * - Uses environment variables via dotenv (loaded first for proper config)
 * - Validates all required configuration before server starts
 * - Implements centralized error handling via middleware
 * - Stateless design - no session or database dependencies
 *
 * @see routes/analyze.ts for main API endpoint implementation
 * @see services/claude.ts for AI integration details
 */

// Load environment variables FIRST (before any other imports)
// This ensures config.ts has access to all env vars
import "dotenv/config";

import cors from "cors";
import express from "express";

import { config, validateConfig } from "./config.js";
import { errorHandler } from "./middleware/error-handler.js";
import analyzeRouter from "./routes/analyze.js";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

// Validate required configuration before starting server
// Throws descriptive errors if API keys or ports are missing
validateConfig();

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS APP INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CORS Configuration
 * - Allows requests from configured frontend origin
 * - Restricts to GET/POST methods (no PUT/DELETE needed)
 * - Only accepts Content-Type header for JSON requests
 */
app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

/** JSON body parser with 1MB limit (sufficient for resume text) */
app.use(express.json({ limit: "1mb" }));

/** URL-encoded parser for form submissions (PDF upload uses multipart) */
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Health Check Endpoint
 * Used for monitoring and load balancer health checks
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Analysis API Routes
 * - POST /api/analyze - Analyze resume against job description
 * - POST /api/analyze/pdf - Extract text from PDF (preview)
 */
app.use("/api/analyze", analyzeRouter);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/** 404 handler for undefined routes */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  });
});

/** Global error handler - catches all thrown errors and formats response */
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`
🚀 Hiring Signal Analyzer API
   
   Server:  http://localhost:${config.port}
   Health:  http://localhost:${config.port}/health
   Analyze: POST http://localhost:${config.port}/api/analyze

   Press Ctrl+C to stop
  `);
});

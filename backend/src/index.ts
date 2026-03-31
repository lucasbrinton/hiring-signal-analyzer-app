import "dotenv/config";

import cors from "cors";
import express from "express";

import { config, validateConfig } from "./config.js";
import { errorHandler } from "./middleware/error-handler.js";
import analyzeRouter from "./routes/analyze.js";

validateConfig();

const app = express();

app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/analyze", analyzeRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`
🚀 Hiring Signal Analyzer API

   Server:  http://localhost:${config.port}
   Health:  http://localhost:${config.port}/health
   Analyze: POST http://localhost:${config.port}/api/analyze

   Press Ctrl+C to stop
  `);
});

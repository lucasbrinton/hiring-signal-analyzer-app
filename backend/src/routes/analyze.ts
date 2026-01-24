/**
 * @fileoverview Analysis API Routes - Resume-Job Matching Endpoints
 *
 * Provides the main API endpoints for resume analysis:
 * - POST /api/analyze - Full analysis (JSON or multipart/form-data)
 * - POST /api/analyze/pdf - PDF text extraction (preview only)
 *
 * Request Handling:
 * - JSON body: Direct resume text + job description
 * - Multipart: PDF file upload + job description
 * - Both routes validate input and return structured responses
 *
 * Error Handling:
 * - Validation errors → 400 with details
 * - PDF parsing errors → 400 with specific message
 * - AI service errors → 503 with retry guidance
 * - Rate limit errors → 429 with wait time
 *
 * @see services/claude.ts for AI analysis implementation
 * @see services/pdf-parser.ts for PDF text extraction
 */

import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";

import { config } from "../config.js";
import { analyzeWithClaude } from "../services/claude.js";
import { parsePdf } from "../services/pdf-parser.js";
import type {
  AnalyzeResponse,
  JobDescription,
  ResumeInput,
} from "../types/shared.js";
import { Errors } from "../utils/errors.js";
import { analyzeRequestSchema } from "../utils/validation.js";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER SETUP
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOAD CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multer configuration for PDF file uploads.
 *
 * Uses memory storage (no disk writes) for:
 * - Simpler deployment (no temp directories needed)
 * - Better security (files don't persist on server)
 * - Suitable for small files (PDFs typically < 5MB)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.limits.maxPdfSizeBytes,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYSIS ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/analyze
 *
 * Analyzes a resume against a job description using Claude AI.
 *
 * Accepts two request formats:
 * 1. JSON body: { resume: ResumeInput, jobDescription: JobDescription }
 * 2. Multipart form: resumeFile (PDF) + jobDescription (JSON string or plain text)
 *
 * Response: {
 *   success: true,
 *   result: AnalysisResult,
 *   processingTimeMs: number
 * }
 *
 * @throws 400 - Invalid request data (validation failed)
 * @throws 429 - Rate limit exceeded
 * @throws 503 - AI service unavailable
 */
router.post(
  "/",
  upload.single("resumeFile"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    try {
      let resume: ResumeInput;
      let jobDescription: JobDescription;

      // Determine request format and extract data accordingly
      if (req.file) {
        // ─── MULTIPART REQUEST (PDF Upload) ───────────────────────────────
        const pdfText = await parsePdf(req.file.buffer);
        resume = {
          text: pdfText,
          source: "pdf",
          fileName: req.file.originalname,
        };

        // Job description can come as JSON string or plain text
        if (!req.body.jobDescription) {
          throw Errors.validation("Job description is required");
        }

        try {
          jobDescription = JSON.parse(req.body.jobDescription);
        } catch {
          // Plain text job description (backwards compatibility)
          jobDescription = { text: req.body.jobDescription };
        }
      } else {
        // ─── JSON REQUEST (Direct Text) ───────────────────────────────────
        if (!req.body.resume || !req.body.jobDescription) {
          throw Errors.validation("Resume and job description are required");
        }
        resume = req.body.resume;
        jobDescription = req.body.jobDescription;
      }

      // Validate complete request against schema
      const validationResult = analyzeRequestSchema.safeParse({
        resume,
        jobDescription,
      });

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        throw Errors.validation("Invalid request data", errorMessages);
      }

      // Perform AI analysis
      const result = await analyzeWithClaude(
        validationResult.data.resume.text,
        validationResult.data.jobDescription.text,
      );

      // Calculate processing time for performance monitoring
      const processingTimeMs = Date.now() - startTime;

      // Return success response
      const response: AnalyzeResponse = {
        success: true,
        result,
        processingTimeMs,
      };

      res.json(response);
    } catch (error) {
      // Pass errors to global error handler
      next(error);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// PDF PREVIEW ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/analyze/pdf
 *
 * Extracts text from a PDF file without performing analysis.
 * Used for preview purposes - allows user to verify text extraction before analyzing.
 *
 * Request: multipart/form-data with 'file' field containing PDF
 *
 * Response: {
 *   success: true,
 *   text: string,
 *   fileName: string,
 *   characterCount: number
 * }
 *
 * @throws 400 - No file provided or invalid PDF
 */
router.post(
  "/pdf",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw Errors.validation("PDF file is required");
      }

      // Extract text from PDF buffer
      const text = await parsePdf(req.file.buffer);

      res.json({
        success: true,
        text,
        fileName: req.file.originalname,
        characterCount: text.length,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

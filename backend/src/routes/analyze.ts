import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { analyzeRequestSchema } from '../utils/validation.js';
import { parsePdf } from '../services/pdf-parser.js';
import { analyzeWithClaude } from '../services/claude.js';
import { ApiError, Errors } from '../utils/errors.js';
import { config } from '../config.js';
import type { AnalyzeResponse, ResumeInput, JobDescription } from '../../../shared/types.js';

const router = Router();

// Configure multer for PDF uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.limits.maxPdfSizeBytes,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * POST /api/analyze
 * Analyze resume against job description
 * 
 * Accepts either:
 * - JSON body with { resume, jobDescription }
 * - Multipart form with PDF file + jobDescription
 */
router.post(
  '/',
  upload.single('resumeFile'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    try {
      let resume: ResumeInput;
      let jobDescription: JobDescription;

      // Handle PDF upload vs JSON body
      if (req.file) {
        // PDF upload case
        const pdfText = await parsePdf(req.file.buffer);
        resume = {
          text: pdfText,
          source: 'pdf',
          fileName: req.file.originalname,
        };

        // Job description comes from form field
        if (!req.body.jobDescription) {
          throw Errors.validation('Job description is required');
        }

        try {
          jobDescription = JSON.parse(req.body.jobDescription);
        } catch {
          // Allow plain text job description
          jobDescription = { text: req.body.jobDescription };
        }
      } else {
        // JSON body case
        if (!req.body.resume || !req.body.jobDescription) {
          throw Errors.validation('Resume and job description are required');
        }
        resume = req.body.resume;
        jobDescription = req.body.jobDescription;
      }

      // Validate the complete request
      const validationResult = analyzeRequestSchema.safeParse({
        resume,
        jobDescription,
      });

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        throw Errors.validation('Invalid request data', errorMessages);
      }

      // Perform analysis with Claude
      const result = await analyzeWithClaude(
        validationResult.data.resume.text,
        validationResult.data.jobDescription.text
      );

      const processingTimeMs = Date.now() - startTime;

      const response: AnalyzeResponse = {
        success: true,
        result,
        processingTimeMs,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/analyze/pdf
 * Upload PDF and extract text (preview only, no analysis)
 */
router.post(
  '/pdf',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw Errors.validation('PDF file is required');
      }

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
  }
);

export default router;

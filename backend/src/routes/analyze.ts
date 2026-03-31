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

const router = Router();

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

router.post(
  "/",
  upload.single("resumeFile"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    try {
      let resume: ResumeInput;
      let jobDescription: JobDescription;

      if (req.file) {
        const pdfText = await parsePdf(req.file.buffer);
        resume = {
          text: pdfText,
          source: "pdf",
          fileName: req.file.originalname,
        };

        if (!req.body.jobDescription) {
          throw Errors.validation("Job description is required");
        }

        try {
          jobDescription = JSON.parse(req.body.jobDescription);
        } catch {
          jobDescription = { text: req.body.jobDescription };
        }
      } else {
        if (!req.body.resume || !req.body.jobDescription) {
          throw Errors.validation("Resume and job description are required");
        }
        resume = req.body.resume;
        jobDescription = req.body.jobDescription;
      }

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

      const result = await analyzeWithClaude(
        validationResult.data.resume.text,
        validationResult.data.jobDescription.text,
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
  },
);

router.post(
  "/pdf",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw Errors.validation("PDF file is required");
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
  },
);

export default router;

import { z } from 'zod';
import { config } from '../config.js';

/**
 * Zod schemas for request validation
 */

export const resumeInputSchema = z.object({
  text: z
    .string()
    .min(config.limits.minTextLength, `Resume must be at least ${config.limits.minTextLength} characters`)
    .max(config.limits.maxResumeLength, `Resume exceeds maximum length of ${config.limits.maxResumeLength} characters`),
  source: z.enum(['paste', 'pdf']),
  fileName: z.string().optional(),
});

export const jobDescriptionSchema = z.object({
  text: z
    .string()
    .min(config.limits.minTextLength, `Job description must be at least ${config.limits.minTextLength} characters`)
    .max(config.limits.maxJobDescriptionLength, `Job description exceeds maximum length`),
  title: z.string().optional(),
  company: z.string().optional(),
});

export const analyzeRequestSchema = z.object({
  resume: resumeInputSchema,
  jobDescription: jobDescriptionSchema,
});

export type ValidatedAnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

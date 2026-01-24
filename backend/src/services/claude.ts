/**
 * @fileoverview Claude AI Service - Resume Analysis Engine
 *
 * This service integrates with Anthropic's Claude API to perform intelligent
 * resume-job matching analysis. It's the core AI component of the application.
 *
 * Architecture Overview:
 * 1. System Prompt: Defines Claude's persona and output format (strict JSON)
 * 2. User Prompt Builder: Formats resume + job description for analysis
 * 3. Response Parser: Validates and normalizes Claude's JSON output
 * 4. Error Handler: Normalizes Anthropic SDK errors to application errors
 *
 * Prompt Engineering Decisions:
 * - Persona: "Expert technical recruiter" for domain authority
 * - Output Format: Strict JSON schema for reliable parsing
 * - Scoring Guidelines: Detailed rubric for consistent scoring
 * - Neutral Tone: No guarantees, balanced feedback
 *
 * @see https://docs.anthropic.com/en/api/messages for Claude API docs
 */

import Anthropic from "@anthropic-ai/sdk";

import { config } from "../config.js";
import type { AnalysisResult } from "../types/shared.js";
import { Errors } from "../utils/errors.js";

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/** Anthropic API client singleton */
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT ENGINEERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * System prompt that defines Claude's behavior and output format.
 *
 * Design Rationale:
 * 1. PERSONA: "Expert technical recruiter with 15+ years" establishes domain
 *    authority and frames responses in a professional hiring context.
 *
 * 2. STRICT JSON OUTPUT: We explicitly specify the JSON schema to ensure
 *    reliable parsing. Claude is instructed to return "valid JSON only" with
 *    no markdown or explanatory text outside the structure.
 *
 * 3. SCORING RUBRIC: The 0-100 scale with detailed bands (90-100, 75-89, etc.)
 *    ensures consistent scoring across different analyses and prevents
 *    score inflation or deflation.
 *
 * 4. NEUTRAL TONE: "No hype, no guarantees" instruction prevents the model
 *    from making promises about hiring outcomes that could mislead users.
 *
 * 5. RISK FLAGS: Explicitly listed (gaps, job hopping, etc.) to ensure
 *    comprehensive analysis from a recruiter's perspective.
 *
 * 6. ARRAY GUIDANCE: "2-5 items per category" provides structure without
 *    over-constraining the model's output.
 */
const SYSTEM_PROMPT = `You are an expert technical recruiter and hiring manager with 15+ years of experience reviewing resumes for tech roles. Your job is to analyze how well a candidate's resume matches a specific job description.

Your analysis must be:
- Objective and evidence-based (cite specific examples from the resume)
- Balanced (acknowledge both strengths and weaknesses)
- Actionable (provide specific, implementable suggestions)
- Professional (no hype, no guarantees about hiring outcomes)

You will output your analysis as a JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "summary": "<2-3 sentence overview of the match>",
  "strengths": [
    {"headline": "<short title>", "detail": "<1-2 sentence explanation with evidence>"}
  ],
  "gaps": [
    {"headline": "<short title>", "detail": "<1-2 sentence explanation>"}
  ],
  "riskFlags": [
    {"headline": "<short title>", "detail": "<1-2 sentence explanation>"}
  ],
  "improvements": [
    {"headline": "<short title>", "detail": "<specific actionable suggestion>"}
  ]
}

Scoring guidelines:
- 90-100: Exceptional match, candidate exceeds most requirements
- 75-89: Strong match, meets core requirements with minor gaps
- 60-74: Moderate match, meets some requirements but has notable gaps
- 40-59: Weak match, significant skill or experience gaps
- 0-39: Poor match, fundamental misalignment with role requirements

For each category, provide 2-5 items. If a category has no items, return an empty array.

Risk flags should include things like:
- Employment gaps without explanation
- Job hopping patterns (many short tenures)
- Overqualification concerns
- Missing expected progression
- Inconsistencies in the resume

Always respond with valid JSON only. No markdown, no explanation outside the JSON.`;

/**
 * Builds the user prompt with resume and job description content.
 *
 * Prompt Structure:
 * - Clear section delimiters (=== markers) for easy parsing by the model
 * - Resume first, job description second (order matters for context)
 * - Simple instruction to produce JSON analysis
 *
 * @param resumeText - Full text content of the resume
 * @param jobDescriptionText - Full text of the job posting
 * @returns Formatted user prompt string
 */
function buildUserPrompt(
  resumeText: string,
  jobDescriptionText: string,
): string {
  return `Analyze how well this resume matches the job description.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescriptionText}

Provide your analysis as a JSON object.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses and validates Claude's JSON response.
 *
 * Handles edge cases:
 * - Markdown code blocks (```json ... ```)
 * - Invalid JSON structure
 * - Missing or malformed required fields
 *
 * @param content - Raw text content from Claude's response
 * @returns Validated and normalized AnalysisResult
 * @throws {ApiError} If response cannot be parsed or validated
 */
function parseAnalysisResponse(content: string): AnalysisResult {
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (
      typeof parsed.matchScore !== "number" ||
      parsed.matchScore < 0 ||
      parsed.matchScore > 100
    ) {
      throw new Error("Invalid matchScore");
    }

    if (typeof parsed.summary !== "string") {
      throw new Error("Invalid summary");
    }

    // Ensure arrays exist
    const result: AnalysisResult = {
      matchScore: Math.round(parsed.matchScore),
      summary: parsed.summary,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements
        : [],
    };

    return result;
  } catch (error) {
    console.error("Failed to parse Claude response:", content);
    throw Errors.aiService("Failed to parse AI response");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Performs resume analysis using Claude AI.
 *
 * This is the main entry point for AI-powered analysis. It:
 * 1. Constructs the prompt with resume and job description
 * 2. Calls the Claude API with configured model and token limits
 * 3. Parses and validates the JSON response
 * 4. Handles all error cases with appropriate application errors
 *
 * Error Handling:
 * - Rate limit errors → 429 response with retry guidance
 * - API errors → 503 response indicating service unavailable
 * - Parse errors → 500 response (internal error)
 *
 * @param resumeText - Plain text content of the resume
 * @param jobDescriptionText - Plain text of the job posting
 * @returns Structured analysis result with score and insights
 * @throws {ApiError} On any failure (rate limit, API error, parse error)
 */
export async function analyzeWithClaude(
  resumeText: string,
  jobDescriptionText: string,
): Promise<AnalysisResult> {
  try {
    // Call Claude API with our configured prompts
    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(resumeText, jobDescriptionText),
        },
      ],
    });

    // Extract text content from response (Claude can return multiple content blocks)
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw Errors.aiService("Empty response from AI service");
    }

    // Parse and validate the JSON response
    return parseAnalysisResponse(textContent.text);
  } catch (error) {
    // Handle Anthropic SDK-specific error types
    if (error instanceof Anthropic.RateLimitError) {
      throw Errors.rateLimit();
    }

    if (error instanceof Anthropic.APIError) {
      console.error("Claude API error:", error.message);
      throw Errors.aiService(error.message);
    }

    // Re-throw our application errors as-is
    if (error instanceof Error && error.name === "ApiError") {
      throw error;
    }

    // Catch-all for unexpected errors
    console.error("Unexpected error in Claude service:", error);
    throw Errors.internal("Failed to analyze resume");
  }
}

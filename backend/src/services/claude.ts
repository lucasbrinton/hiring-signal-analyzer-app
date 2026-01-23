import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import { Errors } from '../utils/errors.js';
import type { AnalysisResult } from '../../../shared/types.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

/**
 * System prompt for the hiring signal analyzer
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
 * Build the user prompt with resume and job description
 */
function buildUserPrompt(resumeText: string, jobDescriptionText: string): string {
  return `Analyze how well this resume matches the job description.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescriptionText}

Provide your analysis as a JSON object.`;
}

/**
 * Parse and validate Claude's response
 */
function parseAnalysisResponse(content: string): AnalysisResult {
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (typeof parsed.matchScore !== 'number' || parsed.matchScore < 0 || parsed.matchScore > 100) {
      throw new Error('Invalid matchScore');
    }

    if (typeof parsed.summary !== 'string') {
      throw new Error('Invalid summary');
    }

    // Ensure arrays exist
    const result: AnalysisResult = {
      matchScore: Math.round(parsed.matchScore),
      summary: parsed.summary,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };

    return result;
  } catch (error) {
    console.error('Failed to parse Claude response:', content);
    throw Errors.aiService('Failed to parse AI response');
  }
}

/**
 * Analyze resume against job description using Claude
 */
export async function analyzeWithClaude(
  resumeText: string,
  jobDescriptionText: string
): Promise<AnalysisResult> {
  try {
    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(resumeText, jobDescriptionText),
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw Errors.aiService('Empty response from AI service');
    }

    return parseAnalysisResponse(textContent.text);
  } catch (error) {
    // Handle Anthropic-specific errors
    if (error instanceof Anthropic.RateLimitError) {
      throw Errors.rateLimit();
    }

    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error:', error.message);
      throw Errors.aiService(error.message);
    }

    // Re-throw ApiErrors as-is
    if (error instanceof Error && error.name === 'ApiError') {
      throw error;
    }

    console.error('Unexpected error in Claude service:', error);
    throw Errors.internal('Failed to analyze resume');
  }
}

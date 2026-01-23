/**
 * Application configuration
 * Environment variables with sensible defaults
 */

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2048,
  },
  
  limits: {
    maxPdfSizeBytes: 5 * 1024 * 1024, // 5MB
    maxResumeLength: 50_000,
    maxJobDescriptionLength: 20_000,
    minTextLength: 100,
  },
} as const;

/**
 * Validate required configuration at startup
 */
export function validateConfig(): void {
  if (!config.anthropic.apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
}

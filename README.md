# Hiring Signal Analyzer

An AI-powered tool that helps job seekers understand how well their resume matches a specific job posting.

## Features

- **Resume Input**: Paste text or upload PDF (up to 5MB)
- **Job Description Analysis**: Paste any job posting
- **AI-Powered Analysis**: Uses Claude to evaluate match quality
- **Structured Results**:
  - Match score (0-100) with visual gauge
  - Strengths: what aligns well
  - Gaps: missing skills or experience
  - Risk flags: potential red flags recruiters might notice
  - Improvements: actionable suggestions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI**: Anthropic Claude API
- **PDF Parsing**: pdf-parse

## Quick Start

### Prerequisites

- Node.js 20+
- Anthropic API key

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 3. Open the App

Visit http://localhost:5173

## Project Structure

```
hiring-signal-analyzer-app/
├── shared/
│   └── types.ts              # Shared TypeScript types
├── backend/
│   └── src/
│       ├── index.ts          # Express server
│       ├── config.ts         # Environment config
│       ├── routes/
│       │   └── analyze.ts    # /api/analyze endpoints
│       ├── services/
│       │   ├── claude.ts     # Claude API integration
│       │   └── pdf-parser.ts # PDF text extraction
│       ├── middleware/
│       │   └── error-handler.ts
│       └── utils/
│           ├── errors.ts
│           └── validation.ts
├── frontend/
│   └── src/
│       ├── App.tsx           # Main app component
│       ├── api/
│       │   └── client.ts     # API client
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── ResumeInput.tsx
│       │   ├── JobDescriptionInput.tsx
│       │   ├── AnalyzeButton.tsx
│       │   ├── LoadingState.tsx
│       │   ├── ErrorMessage.tsx
│       │   └── results/
│       │       ├── AnalysisResults.tsx
│       │       ├── ScoreGauge.tsx
│       │       ├── InsightSection.tsx
│       │       ├── ScoreBreakdown.tsx
│       │       ├── CopyableResults.tsx
│       │       └── Disclaimer.tsx
│       └── hooks/
│           ├── useAnalysis.ts
│           └── useResumeInput.ts
└── README.md
```

## API Reference

### POST /api/analyze

Analyze resume against job description.

**Request (JSON):**
```json
{
  "resume": {
    "text": "Resume content...",
    "source": "paste"
  },
  "jobDescription": {
    "text": "Job posting content..."
  }
}
```

**Request (Multipart - PDF upload):**
```
resumeFile: [PDF file]
jobDescription: "Job posting content..."
```

**Response:**
```json
{
  "success": true,
  "result": {
    "matchScore": 72,
    "summary": "Solid match with some gaps...",
    "strengths": [
      {"headline": "...", "detail": "..."}
    ],
    "gaps": [...],
    "riskFlags": [...],
    "improvements": [...]
  },
  "processingTimeMs": 3421
}
```

## Score Interpretation

| Score | Label | Meaning |
|-------|-------|---------|
| 90-100 | Exceptional | Exceeds most requirements |
| 75-89 | Strong | Meets core requirements with minor gaps |
| 60-74 | Moderate | Has notable gaps to address |
| 40-59 | Weak | Significant skill or experience gaps |
| 0-39 | Poor | Fundamental misalignment with role |

## Limitations & Disclaimers

This tool is for **informational purposes only**:

- Results are AI-generated estimates, not guarantees
- Does not simulate actual ATS systems
- Not a replacement for human recruiter evaluation
- Career changers may see lower scores due to terminology differences
- Junior roles often value potential over exact matches

## Performance Considerations

- **PDF Processing**: PDFs are parsed server-side, limited to 5MB
- **Claude API**: Analysis typically takes 5-15 seconds
- **No Data Storage**: All data is transient; nothing is saved
- **Rate Limiting**: Consider adding rate limiting for production

## Environment Variables

### Backend (.env)

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## License

MIT

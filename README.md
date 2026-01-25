<div align="center">

# Hiring Signal Analyzer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-API-orange)](https://www.anthropic.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**An AI-powered resume analysis tool that helps job seekers understand how well their resume matches a specific job posting—before they hit "Apply."**

</div>

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Development](#development)
- [Privacy & Security](#privacy--security)
- [Performance](#performance)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

### Resume Input Methods

![Attach and remove files](assets/hiring-signal-attach-remove.gif)

_Browse for PDF files with clear file management controls or paste resume text manually_

![Drag and drop functionality](assets/hiring-signal-drag-drop-description.gif)

_Or drag-and-drop PDF upload. Enter a job description input text or link_

### Complete Analysis Workflow

![Analysis workflow demonstration](assets/hiring-signal-analyzing.gif)

_Complete analysis from resume input through AI-powered evaluation to results display_

### Results Display

![Analysis results visualization](assets/hiring-signal-results.gif)

_Comprehensive results with match score, strengths, gaps, and actionable improvements_

### User Experience Features

![Dark mode toggle](assets/hiring-signal-dark-mode-restart.gif)

_Seamless dark mode with persistent theme preference_

![Responsive design](assets/hiring-signal-resize.gif)

_Fully responsive layout adapting from desktop to mobile viewports_

---

## Features

Job seekers often wonder: _"Is my resume a good fit for this role?"_ This tool provides instant, actionable feedback by analyzing:

| Feature                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| **Match Score**          | A 0-100 score showing overall fit                |
| **Strengths**            | What aligns well between experience and role     |
| **Gaps**                 | Missing skills, keywords, or experience          |
| **Risk Flags**           | Potential red flags a recruiter might notice     |
| **Improvements**         | Actionable suggestions to strengthen application |
| **Dual Resume Input**    | Paste text directly or upload PDF (up to 5MB)    |
| **Dark Mode**            | System-aware theme with manual toggle            |
| **Visual Score Gauge**   | Animated circular gauge with color-coded scoring |
| **Copy Results**         | One-click copy to clipboard for sharing          |
| **Download PDF**         | Export analysis as a formatted PDF report        |
| **Real-time Validation** | Client-side validation before submission         |
| **Privacy-First**        | No data storage—all processing is transient      |

---

## Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| **Frontend**       | React 18, TypeScript, Vite, Tailwind CSS                |
| **Backend**        | Node.js, Express, TypeScript, Zod validation, pdf-parse |
| **AI**             | Anthropic Claude API (claude-sonnet-4-20250514)         |
| **State Mgmt**     | Custom hooks (useAnalysis, useResumeInput, useDarkMode) |
| **Validation**     | Zod for runtime type checking, TypeScript strict mode   |
| **Error Handling** | Structured error handling with typed responses          |

---

## Architecture

### Type-Safe API Contract

The `shared/types.ts` file defines the contract between frontend and backend. Both sides import from this single source of truth, eliminating type mismatches.

```typescript
// Discriminated union for type-safe response handling
export type ApiResponse = AnalyzeResponse | ApiErrorResponse;
// Frontend can safely branch: if (response.success) { ... }
```

### State Machine Pattern

The analysis workflow uses an explicit state machine pattern:

```
┌──────┐
│ idle │
└──┬───┘
   │
   ▼
┌───────────┐       ┌─────────┐
│ analyzing │──────▶│ success │
└─────┬─────┘       └─────────┘
      │
      ▼
   ┌───────┐
   │ error │
   └───────┘
```

This prevents impossible states like "loading and error simultaneously" and makes the UI logic predictable.

### Prompt Engineering

The Claude integration uses carefully designed prompts:

- **Persona**: "Seasoned technical recruiter with 15+ years experience"
- **Strict JSON output**: Schema enforcement prevents parsing failures
- **Scoring rubric**: Consistent 0-100 scoring with defined bands
- **Neutral tone**: Factual observations, not career advice

### Error Handling Strategy

Errors are categorized and handled consistently:

| Error Code         | HTTP Status | User Experience           |
| ------------------ | ----------- | ------------------------- |
| `VALIDATION_ERROR` | 400         | Inline field errors       |
| `PDF_PARSE_ERROR`  | 400         | Retry with different file |
| `AI_SERVICE_ERROR` | 503         | Retry button              |
| `RATE_LIMIT_ERROR` | 429         | Wait and retry            |

---

## Installation & Setup

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hiring-signal-analyzer-app.git
cd hiring-signal-analyzer-app

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Terminal 1: Start backend (port 3002)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
npm start
```

---

## Project Structure

```
hiring-signal-analyzer-app/
|
├── shared/
|   └── types.ts                 # Shared TypeScript interfaces (API contract)
|
├── backend/
|   └── src/
|       ├── index.ts             # Express server entry point
|       ├── config.ts            # Environment configuration
|       ├── routes/
|       |   └── analyze.ts       # /api/analyze endpoints
|       ├── services/
|       |   ├── claude.ts        # Claude API integration + prompt engineering
|       |   └── pdf-parser.ts    # PDF text extraction
|       ├── middleware/
|       |   └── error-handler.ts # Global error handling
|       └── utils/
|           ├── errors.ts        # Typed error classes
|           └── validation.ts    # Zod schemas
|
├── frontend/
|   └── src/
|       ├── App.tsx              # Root component
|       ├── api/
|       |   └── client.ts        # Type-safe API client
|       ├── components/
|       |   ├── ResumeInput.tsx  # PDF upload + text paste
|       |   ├── JobDescriptionInput.tsx
|       |   └── results/
|       |       ├── AnalysisResults.tsx
|       |       ├── ScoreGauge.tsx    # Animated circular gauge
|       |       └── InsightSection.tsx
|       └── hooks/
|           ├── useAnalysis.ts   # Analysis state machine
|           ├── useResumeInput.ts
|           └── useDarkMode.ts
|
└── README.md
```

---

## API Reference

### POST /api/analyze

Analyze resume against job description.

**JSON Request:**

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

**Multipart Request (PDF upload):**

```
POST /api/analyze
Content-Type: multipart/form-data

resumeFile: [PDF file]
jobDescription: "Job posting content..."
```

**Success Response:**

```json
{
  "success": true,
  "result": {
    "matchScore": 72,
    "summary": "Solid match with some gaps...",
    "strengths": [
      {"headline": "Strong Python experience", "detail": "5+ years matches requirement"}
    ],
    "gaps": [...],
    "riskFlags": [...],
    "improvements": [...]
  },
  "processingTimeMs": 3421
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Resume text is required",
    "details": "resume.text: Required"
  }
}
```

### Score Interpretation

| Score  | Label         | Meaning                                                |
| ------ | ------------- | ------------------------------------------------------ |
| 90-100 | **Excellent** | Exceeds most requirements. High interview likelihood.  |
| 75-89  | **Strong**    | Meets core requirements. Likely passes initial screen. |
| 60-74  | **Moderate**  | Has notable gaps. Needs tailoring to stand out.        |
| 40-59  | **Weak**      | Significant gaps. Consider addressing before applying. |
| 0-39   | **Poor**      | Fundamental misalignment with the role.                |

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional
PORT=3002                          # Backend port (default: 3002)
CORS_ORIGIN=http://localhost:5173  # Frontend URL for CORS
NODE_ENV=development               # development | production
```

---

## Development

### Code Quality

The codebase follows these practices:

- **TypeScript strict mode** for maximum type safety
- **JSDoc comments** on all public functions and interfaces
- **Consistent file headers** documenting purpose and architecture
- **Zod validation** for runtime type checking
- **Discriminated unions** for exhaustive pattern matching

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Linting

```bash
# Run ESLint
npm run lint

# Type checking
npm run typecheck
```

---

## Privacy & Security

- **No data storage**: All analysis is transient—nothing is saved to disk or database
- **No analytics**: No tracking or third-party services
- **Local processing**: PDF parsing happens on your server
- **API key security**: Keep your `.env` file out of version control

---

## Performance

| Metric              | Value                         |
| ------------------- | ----------------------------- |
| PDF size limit      | 5MB                           |
| Analysis time       | 5-15 seconds (depends on API) |
| Max resume length   | 50,000 characters             |
| Max job description | 20,000 characters             |

---

## Limitations

This tool is for **informational purposes only**:

- Results are AI-generated estimates, not guarantees
- Does not simulate actual ATS (Applicant Tracking Systems)
- Not a replacement for human recruiter evaluation
- Career changers may see lower scores due to terminology differences
- Junior roles often value potential over exact keyword matches

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Lucas Brinton**

[![Twitter/X](https://img.shields.io/badge/Twitter-@LucasBrinton1-1da1f2.svg)](https://twitter.com/LucasBrinton1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucas_Brinton-0077b5.svg)](https://www.linkedin.com/in/lucas-brinton-52aa32174/)

**Contact:** [lucasbrintondev@gmail.com](mailto:lucasbrintondev@gmail.com)

---

<div align="center">

Built with ❤️ using React, TypeScript, and Claude AI

</div>

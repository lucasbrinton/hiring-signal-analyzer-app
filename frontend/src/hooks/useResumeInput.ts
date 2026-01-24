/**
 * @fileoverview Resume Input State Management Hook
 *
 * Handles two distinct input methods for resume content:
 * 1. Text Paste: User directly pastes resume text
 * 2. PDF Upload: File is uploaded, text extracted via backend API
 *
 * Design Decisions:
 * - Uses `useRef` for file storage (not displayed, doesn't trigger re-renders)
 * - Validates file type/size client-side for immediate feedback
 * - Centralizes all resume-related state in one hook
 *
 * Error Handling:
 * - API errors are caught and displayed inline
 * - File validation happens before API call (fast feedback)
 *
 * @example
 * ```tsx
 * const { text, isLoading, handleFileUpload, setText } = useResumeInput();
 *
 * // For text input
 * <textarea value={text} onChange={e => setText(e.target.value)} />
 *
 * // For file upload
 * <input type="file" onChange={e => handleFileUpload(e.target.files[0])} />
 * ```
 */

import { useCallback, useRef, useState } from "react";

import { ApiError, extractPdfText } from "@/api/client";
import { VALIDATION } from "@/constants/validation";
import type { ResumeInput } from "@shared/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Internal state shape for resume input */
interface UseResumeInputState {
  /** Current resume text (either pasted or extracted from PDF) */
  text: string;
  /** Source of the current text content */
  source: "paste" | "pdf";
  /** Original filename if uploaded (for display purposes) */
  fileName: string | null;
  /** Whether PDF extraction is in progress */
  isLoading: boolean;
  /** Current error message (null if no error) */
  error: string | null;
}

/** Actions exposed by the hook */
interface UseResumeInputActions {
  /** Updates text content (clears any file reference) */
  setText: (text: string) => void;
  /** Handles PDF file selection and extraction */
  handleFileUpload: (file: File) => Promise<void>;
  /** Resets all state to initial values */
  clear: () => void;
  /** Returns structured resume input for API submission */
  getResumeInput: () => ResumeInput | null;
  /** Returns stored file reference (for multipart upload) */
  getFile: () => File | null;
}

type UseResumeInputReturn = UseResumeInputState & UseResumeInputActions;

// ─────────────────────────────────────────────────────────────────────────────
// HOOK IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manages resume input state for both paste and PDF upload workflows.
 *
 * State Flow:
 * - Text paste: Immediate state update, no loading
 * - PDF upload: Loading → Extract text via API → Success/Error
 *
 * @returns Combined state and actions for resume input management
 */
export function useResumeInput(): UseResumeInputReturn {
  const [state, setState] = useState<UseResumeInputState>({
    text: "",
    source: "paste",
    fileName: null,
    isLoading: false,
    error: null,
  });

  // File reference stored in ref to avoid re-renders (only needed for form submission)
  const fileRef = useRef<File | null>(null);

  /**
   * Updates resume text from paste input.
   * Clears any existing file reference to prevent stale data.
   */
  const setText = useCallback((text: string): void => {
    fileRef.current = null;
    setState({
      text,
      source: "paste",
      fileName: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Handles PDF file upload with client-side validation and server-side extraction.
   * Validates file type and size before sending to API for text extraction.
   */
  const handleFileUpload = useCallback(async (file: File): Promise<void> => {
    // Validate file type (client-side for immediate feedback)
    if (file.type !== "application/pdf") {
      setState((prev) => ({
        ...prev,
        error: "Please upload a PDF file",
        isLoading: false,
      }));
      return;
    }

    // Validate file size (prevent unnecessary API calls for oversized files)
    if (file.size > VALIDATION.MAX_PDF_SIZE) {
      setState((prev) => ({
        ...prev,
        error: `File too large. Maximum size is ${VALIDATION.MAX_PDF_SIZE / 1024 / 1024}MB`,
        isLoading: false,
      }));
      return;
    }

    // Set loading state before async operation
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Extract text from PDF via backend API
      const { text, fileName } = await extractPdfText(file);

      // Store file reference for potential multipart upload
      fileRef.current = file;

      setState({
        text,
        source: "pdf",
        fileName,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      // Clear file reference on error
      fileRef.current = null;

      // Normalize error message
      let errorMessage = "Failed to extract text from PDF";
      if (err instanceof ApiError) {
        errorMessage = err.details || err.message;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /** Resets all state to initial values */
  const clear = useCallback((): void => {
    fileRef.current = null;
    setState({
      text: "",
      source: "paste",
      fileName: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Builds a structured ResumeInput object for API submission.
   * @returns ResumeInput object or null if text is empty
   */
  const getResumeInput = useCallback((): ResumeInput | null => {
    if (!state.text.trim()) return null;

    return {
      text: state.text,
      source: state.source,
      fileName: state.fileName ?? undefined,
    };
  }, [state.text, state.source, state.fileName]);

  /**
   * Returns the stored file reference for multipart uploads.
   * @returns File object or null if no file uploaded
   */
  const getFile = useCallback((): File | null => {
    return fileRef.current;
  }, []);

  return {
    ...state,
    setText,
    handleFileUpload,
    clear,
    getResumeInput,
    getFile,
  };
}

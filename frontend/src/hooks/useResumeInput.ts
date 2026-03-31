import { useCallback, useRef, useState } from "react";

import { ApiError, extractPdfText } from "@/api/client";
import { VALIDATION } from "@shared/types";
import type { ResumeInput } from "@shared/types";

interface UseResumeInputState {
  text: string;
  source: "paste" | "pdf";
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseResumeInputReturn extends UseResumeInputState {
  setText: (text: string) => void;
  handleFileUpload: (file: File) => Promise<void>;
  clear: () => void;
  getResumeInput: () => ResumeInput | null;
  getFile: () => File | null;
}

export function useResumeInput(): UseResumeInputReturn {
  const [state, setState] = useState<UseResumeInputState>({
    text: "",
    source: "paste",
    fileName: null,
    isLoading: false,
    error: null,
  });

  const fileRef = useRef<File | null>(null);

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

  const handleFileUpload = useCallback(async (file: File): Promise<void> => {
    if (file.type !== "application/pdf") {
      setState((prev) => ({
        ...prev,
        error: "Please upload a PDF file",
        isLoading: false,
      }));
      return;
    }

    if (file.size > VALIDATION.MAX_PDF_SIZE) {
      setState((prev) => ({
        ...prev,
        error: `File too large. Maximum size is ${VALIDATION.MAX_PDF_SIZE / 1024 / 1024}MB`,
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { text, fileName } = await extractPdfText(file);
      fileRef.current = file;

      setState({
        text,
        source: "pdf",
        fileName,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      fileRef.current = null;

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

  const getResumeInput = useCallback((): ResumeInput | null => {
    if (!state.text.trim()) return null;

    return {
      text: state.text,
      source: state.source,
      fileName: state.fileName ?? undefined,
    };
  }, [state.text, state.source, state.fileName]);

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

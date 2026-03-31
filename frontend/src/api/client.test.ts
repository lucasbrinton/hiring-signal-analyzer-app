import { describe, expect, it, vi } from "vitest";
import { analyzeResume, analyzePdfResume, extractPdfText, ApiError } from "./client";

const mockResume = { text: "Engineer with experience", source: "paste" as const };
const mockJobDescription = { text: "Looking for engineer" };

describe("API client", () => {
  describe("analyzeResume", () => {
    it("sends JSON POST and returns parsed response", async () => {
      const mockResponse = {
        success: true,
        result: { matchScore: 75, summary: "Good match", strengths: [], gaps: [], riskFlags: [], improvements: [] },
        processingTimeMs: 2000,
      };

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await analyzeResume(mockResume, mockJobDescription);

      expect(fetch).toHaveBeenCalledWith("/api/analyze", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }));
      expect(result.result.matchScore).toBe(75);
    });

    it("throws ApiError on failure response", async () => {
      const errorResponse = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid input", details: "Too short" },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(analyzeResume(mockResume, mockJobDescription))
        .rejects
        .toThrow(ApiError);

      try {
        await analyzeResume(mockResume, mockJobDescription);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).code).toBe("VALIDATION_ERROR");
        expect((err as ApiError).details).toBe("Too short");
      }
    });

    it("passes abort signal to fetch", async () => {
      const controller = new AbortController();
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          result: { matchScore: 50, summary: "", strengths: [], gaps: [], riskFlags: [], improvements: [] },
          processingTimeMs: 1000,
        }),
      });

      await analyzeResume(mockResume, mockJobDescription, controller.signal);

      expect(fetch).toHaveBeenCalledWith("/api/analyze", expect.objectContaining({
        signal: controller.signal,
      }));
    });
  });

  describe("analyzePdfResume", () => {
    it("sends multipart form data", async () => {
      const file = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          result: { matchScore: 60, summary: "OK", strengths: [], gaps: [], riskFlags: [], improvements: [] },
          processingTimeMs: 5000,
        }),
      });

      await analyzePdfResume(file, mockJobDescription);

      const [, options] = vi.mocked(fetch).mock.calls[0];
      expect(options?.body).toBeInstanceOf(FormData);
    });
  });

  describe("extractPdfText", () => {
    it("returns extracted text and filename", async () => {
      const file = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          text: "Extracted resume text",
          fileName: "resume.pdf",
        }),
      });

      const result = await extractPdfText(file);

      expect(result.text).toBe("Extracted resume text");
      expect(result.fileName).toBe("resume.pdf");
    });

    it("throws ApiError on PDF parse failure", async () => {
      const file = new File(["bad content"], "bad.pdf", { type: "application/pdf" });
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: { code: "PDF_PARSE_ERROR", message: "Failed to parse" },
        }),
      });

      await expect(extractPdfText(file)).rejects.toThrow(ApiError);
    });
  });
});

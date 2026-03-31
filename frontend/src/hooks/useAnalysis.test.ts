import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAnalysis } from "./useAnalysis";

const mockResume = { text: "Software engineer with 5 years experience", source: "paste" as const };
const mockJobDescription = { text: "Looking for a senior software engineer" };

const mockSuccessResponse = {
  success: true as const,
  result: {
    matchScore: 85,
    summary: "Strong match",
    strengths: [{ headline: "Experience", detail: "5 years relevant" }],
    gaps: [],
    riskFlags: [],
    improvements: [],
  },
  processingTimeMs: 3000,
};

vi.mock("@/api/client", () => ({
  analyzeResume: vi.fn(),
  analyzePdfResume: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      public code: string,
      message: string,
      public details?: string,
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

import { analyzePdfResume, analyzeResume } from "@/api/client";

describe("useAnalysis", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useAnalysis());

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.processingTimeMs).toBeNull();
  });

  it("transitions to analyzing then success on successful text analysis", async () => {
    vi.mocked(analyzeResume).mockResolvedValueOnce(mockSuccessResponse);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze(mockResume, mockJobDescription);
    });

    expect(result.current.status).toBe("success");
    expect(result.current.result?.matchScore).toBe(85);
    expect(result.current.processingTimeMs).toBe(3000);
    expect(result.current.error).toBeNull();
  });

  it("uses analyzePdfResume when file is provided", async () => {
    vi.mocked(analyzePdfResume).mockResolvedValueOnce(mockSuccessResponse);
    const mockFile = new File(["test"], "resume.pdf", { type: "application/pdf" });

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze(mockResume, mockJobDescription, mockFile);
    });

    expect(analyzePdfResume).toHaveBeenCalledWith(
      mockFile,
      mockJobDescription,
      expect.any(AbortSignal),
    );
    expect(result.current.status).toBe("success");
  });

  it("transitions to error on API failure", async () => {
    vi.mocked(analyzeResume).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze(mockResume, mockJobDescription);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Network error");
    expect(result.current.result).toBeNull();
  });

  it("resets state back to idle", async () => {
    vi.mocked(analyzeResume).mockResolvedValueOnce(mockSuccessResponse);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze(mockResume, mockJobDescription);
    });

    expect(result.current.status).toBe("success");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
  });

  it("aborts in-flight request on reset", async () => {
    vi.mocked(analyzeResume).mockImplementationOnce(
      (_resume, _jd, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );

    const { result } = renderHook(() => useAnalysis());

    // Start analysis but don't await
    let analyzePromise: Promise<void>;
    act(() => {
      analyzePromise = result.current.analyze(mockResume, mockJobDescription);
    });

    expect(result.current.status).toBe("analyzing");

    // Reset while in-flight
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await analyzePromise!;
    });

    // Should be idle, not error — abort was intentional
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });
});

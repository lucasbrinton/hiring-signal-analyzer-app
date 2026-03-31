import { describe, expect, it } from "vitest";
import { analyzeRequestSchema } from "./validation.js";

describe("validation schemas", () => {
  it("accepts valid analyze request", () => {
    const result = analyzeRequestSchema.safeParse({
      resume: {
        text: "A".repeat(100),
        source: "paste",
      },
      jobDescription: {
        text: "B".repeat(100),
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects resume text shorter than minimum", () => {
    const result = analyzeRequestSchema.safeParse({
      resume: {
        text: "too short",
        source: "paste",
      },
      jobDescription: {
        text: "B".repeat(100),
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects job description shorter than minimum", () => {
    const result = analyzeRequestSchema.safeParse({
      resume: {
        text: "A".repeat(100),
        source: "paste",
      },
      jobDescription: {
        text: "short",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid resume source", () => {
    const result = analyzeRequestSchema.safeParse({
      resume: {
        text: "A".repeat(100),
        source: "invalid",
      },
      jobDescription: {
        text: "B".repeat(100),
      },
    });

    expect(result.success).toBe(false);
  });

  it("accepts PDF source with optional fileName", () => {
    const result = analyzeRequestSchema.safeParse({
      resume: {
        text: "A".repeat(100),
        source: "pdf",
        fileName: "resume.pdf",
      },
      jobDescription: {
        text: "B".repeat(100),
        title: "Senior Engineer",
        company: "Acme Corp",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects resume exceeding max length", () => {
    const result = analyzeRequestSchema.safeParse({
      resume: {
        text: "A".repeat(50_001),
        source: "paste",
      },
      jobDescription: {
        text: "B".repeat(100),
      },
    });

    expect(result.success).toBe(false);
  });
});

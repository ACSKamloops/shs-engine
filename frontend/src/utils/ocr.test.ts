import { describe, expect, it } from "vitest";
import { computeOcrQuality } from "./ocr";

describe("computeOcrQuality", () => {
  it("returns null for empty", () => {
    expect(computeOcrQuality(" ")).toBeNull();
    expect(computeOcrQuality(undefined)).toBeNull();
  });

  it("flags low for very short", () => {
    expect(computeOcrQuality("abc")).toBe("low");
  });

  it("flags medium when noisy", () => {
    expect(computeOcrQuality("a".repeat(120) + "%%%###")).toBe("medium");
  });

  it("flags high when clean and long", () => {
    expect(computeOcrQuality("a".repeat(500))).toBe("high");
  });
});

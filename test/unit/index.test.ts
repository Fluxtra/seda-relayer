import { describe, it, expect } from "vitest";
import { summarizeError } from "../../src/utils.js";

describe("summarizeError", () => {
  it("extracts code, action, and reason from ethers error", () => {
    const input = 'code=CALL_EXCEPTION action="estimateGas" reason="execution reverted"';
    const result = summarizeError(input);
    expect(result).toContain("CALL_EXCEPTION");
    expect(result).toContain("estimateGas");
    expect(result).toContain("execution reverted");
  });

  it("handles missing action and reason gracefully", () => {
    const input = "code=NETWORK_ERROR";
    const result = summarizeError(input);
    expect(result).toContain("NETWORK_ERROR");
    expect(result).toContain("unknown");
  });

  it("truncates long messages without code pattern", () => {
    const input = "a".repeat(300);
    const result = summarizeError(input);
    expect(result.length).toBe(201); // 200 + "…"
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns short messages as-is", () => {
    const input = "a".repeat(50);
    const result = summarizeError(input);
    expect(result).toBe(input);
  });
});

import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import { feedIdFromSymbol } from "../../src/submitter.js";

describe("feedIdFromSymbol", () => {
  it("returns deterministic output", () => {
    const a = feedIdFromSymbol("ETH/USD");
    const b = feedIdFromSymbol("ETH/USD");
    expect(a).toBe(b);
  });

  it("matches known keccak256 value", () => {
    const expected = ethers.keccak256(ethers.toUtf8Bytes("ETH/USD"));
    expect(feedIdFromSymbol("ETH/USD")).toBe(expected);
  });

  it("produces different IDs for different symbols", () => {
    expect(feedIdFromSymbol("ETH/USD")).not.toBe(feedIdFromSymbol("BTC/USD"));
  });
});

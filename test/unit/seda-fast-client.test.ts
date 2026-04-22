import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SedaFastResponse } from "../../src/types.js";
import { decodeResult, SedaFastClient } from "../../src/seda-fast-client.js";
import type { RelayerConfig, FeedConfig } from "../../src/types.js";

// ─── Helper: build a mock SedaFastResponse ──────────────────────────
function makeMockResponse(overrides: {
  price?: string;
  timestamp?: string;
  hexResult?: string;
  exitCode?: number;
}): SedaFastResponse {
  return {
    _tag: "ok",
    data: {
      id: "test-id",
      requestId: "req-id",
      dataRequest: {
        execProgramId: "prog",
        tallyProgramId: "tally",
        execInputs: "inputs",
      },
      dataResult: {
        drId: "dr-id",
        gasUsed: "1000",
        blockHeight: "100",
        blockTimestamp: "2025-01-01T00:00:00Z",
        consensus: true,
        exitCode: overrides.exitCode ?? 0,
        version: "1.0",
        result: overrides.hexResult ?? "",
        paybackAddress: "0x00",
        sedaPayload: "payload",
      },
      signature: "sig",
      result: {
        price: overrides.price ?? "",
        timestamp: overrides.timestamp ?? "",
      },
    },
  };
}

// ─── decodeResult tests ─────────────────────────────────────────────
describe("decodeResult", () => {
  it("decodes from convenience result field", () => {
    const resp = makeMockResponse({
      price: "1234000000000000000000",
      timestamp: "2025-06-15T12:00:00Z",
    });
    const result = decodeResult(resp);
    expect(result.price).toBe(1234000000000000000000n);
    expect(result.timestamp.toISOString()).toBe("2025-06-15T12:00:00.000Z");
  });

  it("falls back to hex dataResult.result", () => {
    const json = JSON.stringify({
      price: "123000000",
      timestamp: "2025-01-01T00:00:00Z",
    });
    const hex = Buffer.from(json, "utf-8").toString("hex");
    const resp = makeMockResponse({ hexResult: hex });
    const result = decodeResult(resp);
    expect(result.price).toBe(123000000n);
    expect(result.timestamp.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("truncates decimal prices to integer part", () => {
    const resp = makeMockResponse({
      price: "123.456",
      timestamp: "2025-01-01T00:00:00Z",
    });
    const result = decodeResult(resp);
    expect(result.price).toBe(123n);
  });

  it("throws on malformed hex fallback", () => {
    const resp = makeMockResponse({ hexResult: "zzzz" });
    expect(() => decodeResult(resp)).toThrow();
  });
});

// ─── SedaFastClient.execute tests ───────────────────────────────────
describe("SedaFastClient.execute", () => {
  const config: RelayerConfig = {
    sedaFast: { apiUrl: "https://api.test", apiKey: "key" },
    feeds: [],
    evm: { rpcUrl: "", chainId: 1, priceStoreAddress: "" },
    updateIntervalMs: 1000,
    maxGasPriceGwei: 50,
  };
  const feed: FeedConfig = {
    symbol: "ETH/USD",
    execProgramId: "prog-id",
    execInputs: { pair: "ETH/USD" },
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns price and response on success", async () => {
    const mockResp = makeMockResponse({
      price: "2000000000000000000000",
      timestamp: "2025-06-15T12:00:00Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResp),
      })
    );

    const client = new SedaFastClient(config);
    const { response, price } = await client.execute(feed);
    expect(price.price).toBe(2000000000000000000000n);
    expect(response.data.id).toBe("test-id");
  });

  it("throws on non-200 response with status code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      })
    );

    const client = new SedaFastClient(config);
    await expect(client.execute(feed)).rejects.toThrow("500");
  });

  it("throws on non-zero exit code", async () => {
    const mockResp = makeMockResponse({ exitCode: 1, price: "1", timestamp: "2025-01-01T00:00:00Z" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResp),
      })
    );

    const client = new SedaFastClient(config);
    await expect(client.execute(feed)).rejects.toThrow("exit code 1");
  });

  it("truncates long error bodies", async () => {
    const longBody = "x".repeat(1000);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve(longBody),
      })
    );

    const client = new SedaFastClient(config);
    await expect(client.execute(feed)).rejects.toThrow(/…/);
  });
});

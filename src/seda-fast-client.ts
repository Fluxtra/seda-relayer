import type { SedaFastResponse, FeedConfig, OraclePrice, RelayerConfig } from "./types.js";

export class SedaFastClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: RelayerConfig) {
    this.apiUrl = config.sedaFast.apiUrl;
    this.apiKey = config.sedaFast.apiKey;
  }

  async execute(feed: FeedConfig): Promise<{ response: SedaFastResponse; price: OraclePrice }> {
    const url = `${this.apiUrl}/execute`;
    const body = {
      execProgramId: feed.execProgramId,
      execInputs: feed.execInputs,
      inputEncoding: "auto",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const short = text.length > 300 ? text.slice(0, 300) + "…" : text;
      throw new Error(`SEDA FAST API error ${res.status}: ${short}`);
    }

    const response = (await res.json()) as SedaFastResponse;

    if (response.data.dataResult.exitCode !== 0) {
      throw new Error(
        `Oracle execution failed for ${feed.symbol} (exit code ${response.data.dataResult.exitCode})`
      );
    }

    const price = decodeResult(response);
    return { response, price };
  }
}

/**
 * Decode the oracle result from the SEDA FAST response.
 * The result field in dataResult is hex-encoded JSON: {"price":"<bigint_string>","timestamp":"<ISO8601>"}
 * The response also has a convenience `result` field with the same data already decoded.
 */
function decodeResult(response: SedaFastResponse): OraclePrice {
  // Use the convenience `result` field (already decoded JSON)
  const { price, timestamp } = response.data.result;

  if (!price || !timestamp) {
    // Fallback: decode from hex result in dataResult
    const hexResult = response.data.dataResult.result;
    const jsonStr = Buffer.from(hexResult, "hex").toString("utf-8");
    const parsed = JSON.parse(jsonStr) as { price: string; timestamp: string };
    return {
      price: BigInt(parsed.price.split(".")[0]),
      timestamp: new Date(parsed.timestamp),
    };
  }

  return {
    price: BigInt(price.split(".")[0]),
    timestamp: new Date(timestamp),
  };
}

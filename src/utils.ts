import type { FeedConfig } from "./types.js";
import type { PriceBatch } from "./submitter.js";

/** @internal */
export function summarizeError(msg: string): string {
  const codeMatch = msg.match(/code=(\w+)/);
  const actionMatch = msg.match(/action="(\w+)"/);
  const reasonMatch = msg.match(/reason=(".*?"|\w+)/);
  if (codeMatch) {
    const code = codeMatch[1];
    const action = actionMatch?.[1] ?? "unknown";
    const reason = reasonMatch?.[1] ?? "null";
    return `${code} during ${action} (reason=${reason})`;
  }
  return msg.length > 200 ? msg.slice(0, 200) + "…" : msg;
}

export interface FetchedPrice {
  feed: FeedConfig;
  price: { price: bigint; timestamp: Date };
  tsUnix: number;
}

/**
 * Filter fetch results to only include feeds with timestamps newer than the
 * last known timestamp. Skips rejected promises and stale/equal timestamps.
 */
export function filterNewPrices(
  fetchResults: PromiseSettledResult<FetchedPrice>[],
  lastTimestamps: Map<string, number>,
  feedIds: Map<string, string>
): PriceBatch[] {
  const batch: PriceBatch[] = [];
  for (const r of fetchResults) {
    if (r.status === "rejected") continue;
    const { feed, price, tsUnix } = r.value;
    const lastTs = lastTimestamps.get(feed.symbol) || 0;
    if (tsUnix <= lastTs) continue;
    batch.push({
      feedId: feedIds.get(feed.symbol)!,
      price: price.price,
      timestamp: tsUnix,
      symbol: feed.symbol,
    });
  }
  return batch;
}

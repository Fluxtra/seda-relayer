import { loadConfig } from "./config.js";
import { SedaFastClient } from "./seda-fast-client.js";
import { Submitter, feedIdFromSymbol } from "./submitter.js";
import { summarizeError, filterNewPrices } from "./utils.js";
import type { PriceBatch } from "./submitter.js";

const DRY_RUN = process.env.DRY_RUN === "true";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const configPath = process.argv[2] || "config.yaml";
  console.log(`Loading config from ${configPath}`);
  const config = loadConfig(configPath);

  const client = new SedaFastClient(config);
  const submitter = DRY_RUN ? null : new Submitter(config);

  console.log(`SEDA Relayer started`);
  console.log(`  API: ${config.sedaFast.apiUrl}`);
  console.log(`  Feeds: ${config.feeds.map((f) => f.symbol).join(", ")}`);
  console.log(`  Chain: ${config.evm.chainId}`);
  console.log(`  PriceStore: ${config.evm.priceStoreAddress}`);
  console.log(`  Interval: ${config.updateIntervalMs}ms`);
  if (DRY_RUN) console.log(`  Mode: DRY RUN (no transactions)`);
  if (submitter) console.log(`  Relayer wallet: ${submitter.getAddress()}`);
  console.log();

  // Map symbol → feedId (bytes32)
  const feedIds = new Map<string, string>();
  for (const feed of config.feeds) {
    const id = feedIdFromSymbol(feed.symbol);
    feedIds.set(feed.symbol, id);
    console.log(`  ${feed.symbol} → feedId: ${id}`);
  }
  console.log();

  const lastTimestamps = new Map<string, number>();

  while (true) {
    const now = new Date().toISOString();

    // Fetch all feeds in parallel
    const fetchResults = await Promise.allSettled(
      config.feeds.map(async (feed) => {
        console.log(`[${now}] ${feed.symbol}: Fetching...`);
        const { response, price } = await client.execute(feed);
        const dr = response.data.dataResult;
        const tsUnix = Math.floor(price.timestamp.getTime() / 1000);
        console.log(
          `  ${feed.symbol}: price=${price.price} ts=${price.timestamp.toISOString()} exitCode=${dr.exitCode}`
        );
        return { feed, price, tsUnix };
      })
    );

    // Collect payloads with new timestamps
    const batch = filterNewPrices(fetchResults, lastTimestamps, feedIds);

    // Log skipped feeds
    for (const r of fetchResults) {
      if (r.status === "rejected") {
        const msg =
          r.reason instanceof Error ? r.reason.message : String(r.reason);
        console.error(`  fetch error: ${summarizeError(msg)}`);
      } else {
        const { feed, tsUnix } = r.value;
        const lastTs = lastTimestamps.get(feed.symbol) || 0;
        if (tsUnix <= lastTs) {
          console.log(
            `  ${feed.symbol}: Skipping, timestamp ${tsUnix} <= last ${lastTs}`
          );
        }
      }
    }

    if (batch.length === 0) {
      console.log(`  No new prices, sleeping...`);
      await sleep(config.updateIntervalMs);
      continue;
    }

    if (DRY_RUN) {
      for (const b of batch) {
        console.log(
          `  ${b.symbol} [DRY RUN] price=${b.price} ts=${b.timestamp} feedId=${b.feedId}`
        );
        lastTimestamps.set(b.symbol, b.timestamp);
      }
    } else {
      try {
        if (await submitter!.isPaused()) {
          console.log(`  Contract is paused, skipping batch`);
          await sleep(config.updateIntervalMs);
          continue;
        }

        console.log(
          `  Submitting batch of ${batch.length} feeds: ${batch.map((b) => b.symbol).join(", ")}`
        );
        const receipt = await submitter!.submitBatch(batch);
        if (receipt) {
          console.log(
            `  Confirmed in block ${receipt.blockNumber}, gas used: ${receipt.gasUsed}`
          );
          for (const b of batch) {
            lastTimestamps.set(b.symbol, b.timestamp);
          }
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : String(error);
        console.error(`  Batch submit error: ${summarizeError(msg)}`);
      }
    }

    await sleep(config.updateIntervalMs);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

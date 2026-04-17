import { readFileSync, existsSync } from "node:fs";
import { parse } from "yaml";
import type { RelayerConfig } from "./types.js";

function loadDotenv(envPath: string = ".env"): void {
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function loadConfig(path: string = "config.yaml"): RelayerConfig {
  loadDotenv();

  const raw = readFileSync(path, "utf-8");
  const config = parse(raw) as RelayerConfig;

  if (process.env.SEDA_FAST_API_KEY) {
    config.sedaFast.apiKey = process.env.SEDA_FAST_API_KEY;
  }

  // Validate required fields
  if (!config.sedaFast?.apiUrl) throw new Error("Missing sedaFast.apiUrl");
  if (!config.sedaFast?.apiKey)
    throw new Error(
      "Missing sedaFast.apiKey (set SEDA_FAST_API_KEY env var or config)"
    );
  if (!config.feeds?.length) throw new Error("Missing feeds configuration");
  for (const feed of config.feeds) {
    if (!feed.symbol) throw new Error("Feed missing symbol");
    if (!feed.execProgramId) throw new Error(`Feed ${feed.symbol} missing execProgramId`);
    if (!feed.execInputs) throw new Error(`Feed ${feed.symbol} missing execInputs`);
  }
  if (!config.evm?.rpcUrl) throw new Error("Missing evm.rpcUrl");
  if (!config.evm?.priceStoreAddress)
    throw new Error("Missing evm.priceStoreAddress");
  if (!process.env.RELAYER_PRIVATE_KEY)
    throw new Error("Missing RELAYER_PRIVATE_KEY env var");

  return config;
}

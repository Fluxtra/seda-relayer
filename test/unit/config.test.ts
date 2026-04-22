import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../../src/config.js";

let savedEnv: NodeJS.ProcessEnv;

function makeTempDir(): string {
  const dir = join(tmpdir(), `seda-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeYaml(dir: string, content: string): string {
  const path = join(dir, "config.yaml");
  writeFileSync(path, content, "utf-8");
  return path;
}

const VALID_YAML = `
sedaFast:
  apiUrl: https://api.test
  apiKey: yaml-api-key
feeds:
  - symbol: ETH/USD
    execProgramId: prog-1
    execInputs:
      pair: ETH/USD
evm:
  rpcUrl: https://rpc.test
  chainId: 1
  priceStoreAddress: "0x1234567890abcdef1234567890abcdef12345678"
updateIntervalMs: 5000
maxGasPriceGwei: 50
`;

describe("loadConfig", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    savedEnv = { ...process.env };
    tempDir = makeTempDir();
    originalCwd = process.cwd();
    // Change CWD so loadDotenv() doesn't read the project's real .env
    process.chdir(tempDir);
    process.env.RELAYER_PRIVATE_KEY = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
    delete process.env.SEDA_FAST_API_KEY;
  });

  afterEach(() => {
    process.chdir(originalCwd);
    process.env = savedEnv;
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  it("loads valid config", () => {
    const configPath = writeYaml(tempDir, VALID_YAML);
    const config = loadConfig(configPath);
    expect(config.sedaFast.apiUrl).toBe("https://api.test");
    expect(config.feeds).toHaveLength(1);
    expect(config.feeds[0].symbol).toBe("ETH/USD");
    expect(config.evm.rpcUrl).toBe("https://rpc.test");
  });

  it("SEDA_FAST_API_KEY env var overrides config", () => {
    process.env.SEDA_FAST_API_KEY = "env-key";
    const configPath = writeYaml(tempDir, VALID_YAML);
    const config = loadConfig(configPath);
    expect(config.sedaFast.apiKey).toBe("env-key");
  });

  it("throws on missing sedaFast.apiUrl", () => {
    const yaml = VALID_YAML.replace("apiUrl: https://api.test", "");
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("Missing sedaFast.apiUrl");
  });

  it("throws on missing sedaFast.apiKey", () => {
    const yaml = VALID_YAML.replace("apiKey: yaml-api-key", "");
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("Missing sedaFast.apiKey");
  });

  it("throws on empty feeds", () => {
    const yaml = VALID_YAML.replace(
      /feeds:[\s\S]*?(?=evm:)/,
      "feeds: []\n"
    );
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("Missing feeds configuration");
  });

  it("throws on feed missing symbol", () => {
    const yaml = VALID_YAML.replace("symbol: ETH/USD", "");
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("Feed missing symbol");
  });

  it("throws on feed missing execProgramId", () => {
    const yaml = VALID_YAML.replace("execProgramId: prog-1", "");
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("missing execProgramId");
  });

  it("throws on missing evm.rpcUrl", () => {
    const yaml = VALID_YAML.replace("rpcUrl: https://rpc.test", "");
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("Missing evm.rpcUrl");
  });

  it("throws on missing evm.priceStoreAddress", () => {
    const yaml = VALID_YAML.replace(
      /priceStoreAddress:.*$/m,
      ""
    );
    const configPath = writeYaml(tempDir, yaml);
    expect(() => loadConfig(configPath)).toThrow("Missing evm.priceStoreAddress");
  });

  it("throws on missing RELAYER_PRIVATE_KEY env var", () => {
    delete process.env.RELAYER_PRIVATE_KEY;
    const configPath = writeYaml(tempDir, VALID_YAML);
    expect(() => loadConfig(configPath)).toThrow("Missing RELAYER_PRIVATE_KEY");
  });
});

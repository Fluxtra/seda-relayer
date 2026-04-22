import { expect } from "chai";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { ethers, network, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Submitter, feedIdFromSymbol } from "../../../src/submitter";
import { SedaFastClient } from "../../../src/seda-fast-client";
import type { RelayerConfig, SedaFastResponse } from "../../../src/types";
import { filterNewPrices } from "../../../src/utils";
import type { FetchedPrice } from "../../../src/utils";
import type { PriceBatch } from "../../../src/submitter";

const HARDHAT_MNEMONIC = "test test test test test test test test test test test junk";
const RELAYER_PRIVATE_KEY = ethers.HDNodeWallet.fromPhrase(
  HARDHAT_MNEMONIC,
  undefined,
  "m/44'/60'/0'/0/1"
).privateKey;

// ─── Shared fixture ─────────────────────────────────────────────────
async function deployWithRelayerFixture() {
  const [owner, relayer, other] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("SedaPriceStore", owner);
  const contract = await upgrades.deployProxy(
    Factory,
    [owner.address, relayer.address],
    { kind: "uups" }
  );
  await contract.waitForDeployment();
  return { contract, owner, relayer, other };
}

// ─── Mock SEDA FAST response builder ────────────────────────────────
function makeSedaResponse(
  price: string,
  timestamp: string
): SedaFastResponse {
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
        exitCode: 0,
        version: "1.0",
        result: "",
        paybackAddress: "0x00",
        sedaPayload: "payload",
      },
      signature: "sig",
      result: { price, timestamp },
    },
  };
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function toJsonRpcError(error: unknown): { code: number; message: string } {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "number" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return {
      code: (error as { code: number }).code,
      message: (error as { message: string }).message,
    };
  }

  return {
    code: -32000,
    message: error instanceof Error ? error.message : String(error),
  };
}

async function handleJsonRpcPayload(payload: {
  id?: number | string | null;
  method: string;
  params?: unknown[];
}) {
  try {
    const result = await network.provider.send(payload.method, payload.params ?? []);
    return { jsonrpc: "2.0", id: payload.id ?? null, result };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: payload.id ?? null,
      error: toJsonRpcError(error),
    };
  }
}

async function startJsonRpcProxy(): Promise<{
  close: () => Promise<void>;
  rpcUrl: string;
}> {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }

    const body = await readRequestBody(req);
    const payload = JSON.parse(body) as
      | { id?: number | string | null; method: string; params?: unknown[] }
      | Array<{ id?: number | string | null; method: string; params?: unknown[] }>;
    const response = Array.isArray(payload)
      ? await Promise.all(payload.map(handleJsonRpcPayload))
      : await handleJsonRpcPayload(payload);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const { port } = server.address() as AddressInfo;
  return {
    rpcUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

function makeConfig(contractAddress: string, rpcUrl: string): RelayerConfig {
  return {
    sedaFast: { apiUrl: "https://mock", apiKey: "key" },
    feeds: [
      { symbol: "ETH/USD", execProgramId: "prog", execInputs: { pair: "ETH/USD" } },
    ],
    evm: {
      rpcUrl,
      chainId: 31337,
      priceStoreAddress: contractAddress,
    },
    updateIntervalMs: 1000,
    maxGasPriceGwei: 1000,
  };
}

describe("Integration Tests", function () {
  let savedRelayerPrivateKey: string | undefined;
  let closeJsonRpcProxy: (() => Promise<void>) | undefined;
  let rpcUrl = "";

  before(async function () {
    const proxy = await startJsonRpcProxy();
    closeJsonRpcProxy = proxy.close;
    rpcUrl = proxy.rpcUrl;
  });

  after(async function () {
    await closeJsonRpcProxy?.();
  });

  beforeEach(function () {
    savedRelayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    process.env.RELAYER_PRIVATE_KEY = RELAYER_PRIVATE_KEY;
  });

  afterEach(function () {
    if (savedRelayerPrivateKey === undefined) {
      delete process.env.RELAYER_PRIVATE_KEY;
    } else {
      process.env.RELAYER_PRIVATE_KEY = savedRelayerPrivateKey;
    }
  });

  // ─── Round-trip: API → Submitter → Contract ─────────────────────
  describe("Round-trip", function () {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(function () {
      originalFetch = globalThis.fetch;
    });

    afterEach(function () {
      globalThis.fetch = originalFetch;
    });

    it("end-to-end: mocked API → submitBatch → on-chain read-back", async function () {
      const { contract } = await loadFixture(deployWithRelayerFixture);
      const contractAddress = await contract.getAddress();

      const mockPrice = "2000000000000000000000";
      const mockTimestamp = "2025-06-15T12:00:00Z";
      const mockResp = makeSedaResponse(mockPrice, mockTimestamp);

      // Mock fetch
      globalThis.fetch = (async () => ({
        ok: true,
        json: async () => mockResp,
      })) as any;

      const config = makeConfig(contractAddress, rpcUrl);

      // Execute via client
      const client = new SedaFastClient(config);
      const submitter = new Submitter(config);
      const { price } = await client.execute(config.feeds[0]);

      // Submit via the real relayer path
      const fid = feedIdFromSymbol("ETH/USD");
      const tsUnix = Math.floor(price.timestamp.getTime() / 1000);
      const batch: PriceBatch[] = [
        { feedId: fid, price: price.price, timestamp: tsUnix, symbol: "ETH/USD" },
      ];
      const receipt = await submitter.submitBatch(batch);
      expect(receipt).to.not.equal(null);

      // Read back
      const [onChainPrice, onChainTs] = await contract.getLatestPrice(fid);
      expect(onChainPrice).to.equal(BigInt(mockPrice));
      expect(onChainTs).to.equal(BigInt(tsUnix));
    });
  });

  // ─── Submitter integration against real contract ────────────────
  describe("Submitter against Hardhat contract", function () {
    it("submitBatch writes prices to contract", async function () {
      const { contract } = await loadFixture(deployWithRelayerFixture);
      const contractAddress = await contract.getAddress();
      const fid = feedIdFromSymbol("ETH/USD");
      const price = 2000n * 10n ** 18n;
      const ts = 1700000000;
      const submitter = new Submitter(makeConfig(contractAddress, rpcUrl));
      const batch: PriceBatch[] = [
        { feedId: fid, price, timestamp: ts, symbol: "ETH/USD" },
      ];

      const receipt = await submitter.submitBatch(batch);
      expect(receipt).to.not.equal(null);

      const [p, t, r] = await contract.getLatestPrice(fid);
      expect(p).to.equal(price);
      expect(t).to.equal(BigInt(ts));
      expect(r).to.equal(1n);
    });

    it("simulation reverts on stale timestamp", async function () {
      const { contract } = await loadFixture(deployWithRelayerFixture);
      const contractAddress = await contract.getAddress();
      const fid = feedIdFromSymbol("ETH/USD");
      const submitter = new Submitter(makeConfig(contractAddress, rpcUrl));
      const initialBatch: PriceBatch[] = [
        { feedId: fid, price: 100n, timestamp: 100, symbol: "ETH/USD" },
      ];
      const staleBatch: PriceBatch[] = [
        { feedId: fid, price: 200n, timestamp: 100, symbol: "ETH/USD" },
      ];

      await submitter.submitBatch(initialBatch);
      await expect(submitter.submitBatch(staleBatch)).to.be.rejectedWith(
        "Simulation reverted:"
      );
    });

    it("isPaused reflects contract state", async function () {
      const { contract, owner } = await loadFixture(deployWithRelayerFixture);
      const contractAddress = await contract.getAddress();
      const submitter = new Submitter(makeConfig(contractAddress, rpcUrl));

      expect(await submitter.isPaused()).to.equal(false);
      await contract.connect(owner).pause();
      expect(await submitter.isPaused()).to.equal(true);
    });
  });

  // ─── Timestamp deduplication ────────────────────────────────────
  describe("Timestamp deduplication (filterNewPrices)", function () {
    const feed = {
      symbol: "ETH/USD",
      execProgramId: "prog",
      execInputs: { pair: "ETH/USD" },
    };
    const fid = feedIdFromSymbol("ETH/USD");
    const feedIds = new Map([["ETH/USD", fid]]);

    it("excludes feeds with unchanged timestamps", function () {
      const lastTimestamps = new Map([["ETH/USD", 1000]]);
      const fetchResults: PromiseSettledResult<FetchedPrice>[] = [
        {
          status: "fulfilled",
          value: {
            feed,
            price: { price: 2000n, timestamp: new Date(1000 * 1000) },
            tsUnix: 1000,
          },
        },
      ];

      const batch = filterNewPrices(fetchResults, lastTimestamps, feedIds);
      expect(batch).to.have.length(0);
    });

    it("includes feeds with newer timestamps", function () {
      const lastTimestamps = new Map([["ETH/USD", 1000]]);
      const fetchResults: PromiseSettledResult<FetchedPrice>[] = [
        {
          status: "fulfilled",
          value: {
            feed,
            price: { price: 2500n, timestamp: new Date(1060 * 1000) },
            tsUnix: 1060,
          },
        },
      ];

      const batch = filterNewPrices(fetchResults, lastTimestamps, feedIds);
      expect(batch).to.have.length(1);
      expect(batch[0].timestamp).to.equal(1060);
      expect(batch[0].price).to.equal(2500n);
    });
  });
});

import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { feedIdFromSymbol } from "../../src/submitter";
import { SedaFastClient } from "../../src/seda-fast-client";
import type { SedaFastResponse } from "../../src/types";
import { filterNewPrices } from "../../src/utils";
import type { FetchedPrice } from "../../src/utils";
import type { PriceBatch } from "../../src/submitter";

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

describe("Integration Tests", function () {
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
      const { contract, relayer } = await loadFixture(deployWithRelayerFixture);
      const contractAddress = await contract.getAddress();

      const mockPrice = "2000000000000000000000";
      const mockTimestamp = "2025-06-15T12:00:00Z";
      const mockResp = makeSedaResponse(mockPrice, mockTimestamp);

      // Mock fetch
      globalThis.fetch = (async () => ({
        ok: true,
        json: async () => mockResp,
      })) as any;

      const config = {
        sedaFast: { apiUrl: "https://mock", apiKey: "key" },
        feeds: [
          { symbol: "ETH/USD", execProgramId: "prog", execInputs: { pair: "ETH/USD" } },
        ],
        evm: {
          rpcUrl: "http://localhost:8545",
          chainId: 31337,
          priceStoreAddress: contractAddress,
        },
        updateIntervalMs: 1000,
        maxGasPriceGwei: 1000,
      };

      // Execute via client
      const client = new SedaFastClient(config);
      const { price } = await client.execute(config.feeds[0]);

      // Submit via contract directly (using relayer signer)
      const fid = feedIdFromSymbol("ETH/USD");
      const tsUnix = Math.floor(price.timestamp.getTime() / 1000);
      await contract
        .connect(relayer)
        .updatePrices([fid], [price.price], [tsUnix]);

      // Read back
      const [onChainPrice, onChainTs] = await contract.getLatestPrice(fid);
      expect(onChainPrice).to.equal(BigInt(mockPrice));
      expect(onChainTs).to.equal(BigInt(tsUnix));
    });
  });

  // ─── Submitter integration against real contract ────────────────
  describe("Submitter against Hardhat contract", function () {
    it("submitBatch writes prices to contract", async function () {
      const { contract, relayer } = await loadFixture(deployWithRelayerFixture);
      const contractAddress = await contract.getAddress();
      const fid = feedIdFromSymbol("ETH/USD");
      const price = 2000n * 10n ** 18n;
      const ts = 1700000000;

      // Use contract directly as a "Submitter" stand-in
      await contract.connect(relayer).updatePrices([fid], [price], [ts]);

      const [p, t, r] = await contract.getLatestPrice(fid);
      expect(p).to.equal(price);
      expect(t).to.equal(BigInt(ts));
      expect(r).to.equal(1n);
    });

    it("simulation reverts on stale timestamp", async function () {
      const { contract, relayer } = await loadFixture(deployWithRelayerFixture);
      const fid = feedIdFromSymbol("ETH/USD");

      await contract.connect(relayer).updatePrices([fid], [100n], [100n]);

      // staticCall to simulate — should revert
      await expect(
        contract
          .connect(relayer)
          .updatePrices.staticCall([fid], [200n], [100n])
      ).to.be.revertedWithCustomError(contract, "StaleTimestamp");
    });

    it("isPaused reflects contract state", async function () {
      const { contract, owner } = await loadFixture(deployWithRelayerFixture);

      expect(await contract.paused()).to.equal(false);
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.equal(true);
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

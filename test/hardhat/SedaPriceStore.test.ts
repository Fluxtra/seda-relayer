import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SedaPriceStore", function () {
  // ─── Shared fixture ───────────────────────────────────────────────
  async function deployFixture() {
    const [owner, relayer, unauthorized] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SedaPriceStore", owner);
    const contract = await upgrades.deployProxy(
      Factory,
      [owner.address, relayer.address],
      { kind: "uups" }
    );
    await contract.waitForDeployment();
    return { contract, owner, relayer, unauthorized };
  }

  // Helper: deterministic feedId
  const feedId = (symbol: string) =>
    ethers.keccak256(ethers.toUtf8Bytes(symbol));

  // ─── 1. Initialization ────────────────────────────────────────────
  describe("Initialization", function () {
    it("sets owner and relayer correctly", async function () {
      const { contract, owner, relayer } = await loadFixture(deployFixture);
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.relayers(relayer.address)).to.equal(true);
    });

    it("emits RelayerAdded event", async function () {
      const [owner, relayer] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("SedaPriceStore", owner);
      const contract = await upgrades.deployProxy(
        Factory,
        [owner.address, relayer.address],
        { kind: "uups" }
      );
      // Check events on the deployment tx
      const deployTx = contract.deploymentTransaction();
      expect(deployTx).to.not.be.null;
      await expect(deployTx!).to.emit(contract, "RelayerAdded").withArgs(relayer.address);
    });

    it("reverts on zero-address owner", async function () {
      const [, relayer] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("SedaPriceStore");
      await expect(
        upgrades.deployProxy(
          Factory,
          [ethers.ZeroAddress, relayer.address],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });

    it("reverts on zero-address relayer", async function () {
      const [owner] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("SedaPriceStore");
      await expect(
        upgrades.deployProxy(
          Factory,
          [owner.address, ethers.ZeroAddress],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });

    it("cannot be initialized twice", async function () {
      const { contract, owner, relayer } = await loadFixture(deployFixture);
      await expect(
        contract.initialize(owner.address, relayer.address)
      ).to.be.revertedWithCustomError(contract, "InvalidInitialization");
    });
  });

  // ─── 2. updatePrices — Happy Path ─────────────────────────────────
  describe("updatePrices — Happy Path", function () {
    it("stores a single feed update", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fid = feedId("ETH/USD");
      const price = 2000n * 10n ** 18n;
      const ts = 1700000000n;

      await contract.connect(relayer).updatePrices([fid], [price], [ts]);
      const [p, t, r] = await contract.getLatestPrice(fid);
      expect(p).to.equal(price);
      expect(t).to.equal(ts);
      expect(r).to.equal(1n);
    });

    it("stores a batch of 3 feeds", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fids = ["ETH/USD", "BTC/USD", "ATOM/USD"].map(feedId);
      const prices = [2000n, 40000n, 10n].map((p) => p * 10n ** 18n);
      const timestamps = [1700000001n, 1700000002n, 1700000003n];

      await contract.connect(relayer).updatePrices(fids, prices, timestamps);

      for (let i = 0; i < 3; i++) {
        const [p, t, r] = await contract.getLatestPrice(fids[i]);
        expect(p).to.equal(prices[i]);
        expect(t).to.equal(timestamps[i]);
        expect(r).to.equal(1n);
      }
    });

    it("increments roundId on sequential updates", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fid = feedId("ETH/USD");

      await contract.connect(relayer).updatePrices([fid], [1000n], [100n]);
      await contract.connect(relayer).updatePrices([fid], [2000n], [200n]);

      const [p, t, r] = await contract.getLatestPrice(fid);
      expect(p).to.equal(2000n);
      expect(t).to.equal(200n);
      expect(r).to.equal(2n);
    });

    it("emits PriceUpdated events for each feed", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fids = ["ETH/USD", "BTC/USD"].map(feedId);
      const prices = [2000n, 40000n];
      const timestamps = [100n, 200n];

      const tx = contract.connect(relayer).updatePrices(fids, prices, timestamps);
      await expect(tx)
        .to.emit(contract, "PriceUpdated")
        .withArgs(fids[0], prices[0], timestamps[0], 1n);
      await expect(tx)
        .to.emit(contract, "PriceUpdated")
        .withArgs(fids[1], prices[1], timestamps[1], 1n);
    });
  });

  // ─── 3. updatePrices — Reverts ────────────────────────────────────
  describe("updatePrices — Reverts", function () {
    it("reverts on feedIds/prices length mismatch", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fids = [feedId("A"), feedId("B")];
      await expect(
        contract.connect(relayer).updatePrices(fids, [100n], [1n, 2n])
      ).to.be.revertedWithCustomError(contract, "ArrayLengthMismatch");
    });

    it("reverts on feedIds/timestamps length mismatch", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fids = [feedId("A"), feedId("B")];
      await expect(
        contract.connect(relayer).updatePrices(fids, [100n, 200n], [1n, 2n, 3n])
      ).to.be.revertedWithCustomError(contract, "ArrayLengthMismatch");
    });

    it("reverts on equal timestamp (stale)", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fid = feedId("ETH/USD");
      const ts = 1000n;
      await contract.connect(relayer).updatePrices([fid], [100n], [ts]);
      await expect(
        contract.connect(relayer).updatePrices([fid], [200n], [ts])
      ).to.be.revertedWithCustomError(contract, "StaleTimestamp")
        .withArgs(fid, ts, ts);
    });

    it("reverts on earlier timestamp", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fid = feedId("ETH/USD");
      await contract.connect(relayer).updatePrices([fid], [100n], [100n]);
      await expect(
        contract.connect(relayer).updatePrices([fid], [200n], [50n])
      ).to.be.revertedWithCustomError(contract, "StaleTimestamp")
        .withArgs(fid, 50n, 100n);
    });

    it("succeeds with empty arrays (no-op)", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      await expect(
        contract.connect(relayer).updatePrices([], [], [])
      ).to.not.be.reverted;
    });
  });

  // ─── 4. Access Control ────────────────────────────────────────────
  describe("Access Control", function () {
    it("reverts updatePrices for non-relayer", async function () {
      const { contract, unauthorized } = await loadFixture(deployFixture);
      await expect(
        contract.connect(unauthorized).updatePrices([feedId("X")], [1n], [1n])
      ).to.be.revertedWithCustomError(contract, "OnlyRelayer");
    });

    it("reverts addRelayer for non-owner", async function () {
      const { contract, relayer, unauthorized } = await loadFixture(deployFixture);
      await expect(
        contract.connect(relayer).addRelayer(unauthorized.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts removeRelayer for non-owner", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      await expect(
        contract.connect(relayer).removeRelayer(relayer.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts addRelayer with zero address", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).addRelayer(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "ZeroAddress");
    });

    it("allows newly added relayer to submit", async function () {
      const { contract, owner, unauthorized } = await loadFixture(deployFixture);
      await contract.connect(owner).addRelayer(unauthorized.address);
      const fid = feedId("NEW");
      await expect(
        contract.connect(unauthorized).updatePrices([fid], [42n], [1n])
      ).to.not.be.reverted;
    });

    it("blocks removed relayer from submitting", async function () {
      const { contract, owner, relayer } = await loadFixture(deployFixture);
      await contract.connect(owner).removeRelayer(relayer.address);
      await expect(
        contract.connect(relayer).updatePrices([feedId("X")], [1n], [1n])
      ).to.be.revertedWithCustomError(contract, "OnlyRelayer");
    });
  });

  // ─── 5. Pause / Unpause ───────────────────────────────────────────
  describe("Pause / Unpause", function () {
    it("blocks updatePrices when paused", async function () {
      const { contract, owner, relayer } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await expect(
        contract.connect(relayer).updatePrices([feedId("X")], [1n], [1n])
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });

    it("re-enables updatePrices after unpause", async function () {
      const { contract, owner, relayer } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await contract.connect(owner).unpause();
      await expect(
        contract.connect(relayer).updatePrices([feedId("X")], [1n], [1n])
      ).to.not.be.reverted;
    });

    it("reverts pause for non-owner", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      await expect(
        contract.connect(relayer).pause()
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts unpause for non-owner", async function () {
      const { contract, owner, relayer } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await expect(
        contract.connect(relayer).unpause()
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("paused() reflects correct state transitions", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      expect(await contract.paused()).to.equal(false);
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.equal(true);
      await contract.connect(owner).unpause();
      expect(await contract.paused()).to.equal(false);
    });
  });

  // ─── 6. Read Functions ────────────────────────────────────────────
  describe("Read Functions", function () {
    it("returns zeros for uninitialized feed", async function () {
      const { contract } = await loadFixture(deployFixture);
      const [p, t, r] = await contract.getLatestPrice(feedId("UNKNOWN"));
      expect(p).to.equal(0n);
      expect(t).to.equal(0n);
      expect(r).to.equal(0n);
    });

    it("latestRoundData returns AggregatorV3 format", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const fid = feedId("ETH/USD");
      const price = 2000n * 10n ** 18n;
      const ts = 1700000000n;
      await contract.connect(relayer).updatePrices([fid], [price], [ts]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] =
        await contract.latestRoundData(fid);
      expect(roundId).to.equal(1n);
      expect(answer).to.equal(price);
      expect(startedAt).to.equal(ts);
      expect(updatedAt).to.equal(ts);
      expect(answeredInRound).to.equal(1n);
    });

    it("decimals returns 18", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.decimals()).to.equal(18);
    });
  });

  // ─── 7. UUPS Upgrade ─────────────────────────────────────────────
  describe("UUPS Upgrade", function () {
    it("owner can upgrade to V2", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      const V2Factory = await ethers.getContractFactory("SedaPriceStoreV2", owner);
      const upgraded = await upgrades.upgradeProxy(
        await contract.getAddress(),
        V2Factory
      );
      expect(await upgraded.version()).to.equal(2n);
    });

    it("non-owner cannot upgrade", async function () {
      const { contract, relayer } = await loadFixture(deployFixture);
      const V2Factory = await ethers.getContractFactory("SedaPriceStoreV2", relayer);
      await expect(
        upgrades.upgradeProxy(await contract.getAddress(), V2Factory)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });
});

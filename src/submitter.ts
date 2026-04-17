import { ethers } from "ethers";
import type { RelayerConfig } from "./types.js";

const PRICE_STORE_ABI = [
  "function updatePrices(bytes32[] calldata feedIds, int256[] calldata prices, uint256[] calldata timestamps) external",
  "function getLatestPrice(bytes32 feedId) external view returns (int256 price, uint256 timestamp, uint80 roundId)",
  "function paused() external view returns (bool)",
];

export interface PriceBatch {
  feedId: string; // bytes32
  price: bigint;
  timestamp: number; // unix seconds
  symbol: string;
}

export class Submitter {
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private maxGasPriceGwei: number;

  constructor(config: RelayerConfig) {
    const provider = new ethers.JsonRpcProvider(config.evm.rpcUrl);
    this.wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY!, provider);
    this.contract = new ethers.Contract(
      config.evm.priceStoreAddress,
      PRICE_STORE_ABI,
      this.wallet
    );
    this.maxGasPriceGwei = config.maxGasPriceGwei || 50;
  }

  async submitBatch(
    batch: PriceBatch[]
  ): Promise<ethers.TransactionReceipt | null> {
    if (batch.length === 0) return null;

    const feeData = await this.wallet.provider!.getFeeData();
    const maxGasWei = ethers.parseUnits(String(this.maxGasPriceGwei), "gwei");
    if (feeData.gasPrice && feeData.gasPrice > maxGasWei) {
      console.warn(
        `Gas price ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei exceeds cap ${this.maxGasPriceGwei} gwei, skipping`
      );
      return null;
    }

    const feedIds = batch.map((b) => b.feedId);
    const prices = batch.map((b) => b.price);
    const timestamps = batch.map((b) => BigInt(b.timestamp));

    // Simulate first to catch reverts
    try {
      await this.contract.updatePrices.staticCall(feedIds, prices, timestamps);
    } catch (simErr: unknown) {
      const reason =
        simErr instanceof Error ? simErr.message : String(simErr);
      const short = reason.length > 300 ? reason.slice(0, 300) + "…" : reason;
      throw new Error(`Simulation reverted: ${short}`);
    }

    const tx = await this.contract.updatePrices(feedIds, prices, timestamps);
    console.log(`  tx submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    return receipt;
  }

  async isPaused(): Promise<boolean> {
    return this.contract.paused();
  }

  getAddress(): string {
    return this.wallet.address;
  }
}

/** Compute the feedId from a symbol string (keccak256) */
export function feedIdFromSymbol(symbol: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(symbol));
}

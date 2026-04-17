/** SEDA FAST API response from POST /execute */
export interface SedaFastResponse {
  _tag: string;
  data: {
    id: string;
    requestId: string;
    dataRequest: {
      execProgramId: string;
      tallyProgramId: string;
      execInputs: string;
      [key: string]: unknown;
    };
    dataResult: {
      drId: string;
      gasUsed: string;
      blockHeight: string;
      blockTimestamp: string;
      consensus: boolean;
      exitCode: number;
      version: string;
      result: string; // hex-encoded JSON
      paybackAddress: string;
      sedaPayload: string;
    };
    signature: string;
    result: {
      price: string;
      timestamp: string;
    };
    [key: string]: unknown;
  };
}

/** Decoded oracle result */
export interface OraclePrice {
  price: bigint;
  timestamp: Date;
}

/** Per-feed configuration from YAML */
export interface FeedConfig {
  symbol: string;
  execProgramId: string;
  execInputs: Record<string, unknown>;
}

/** Full relayer configuration loaded from YAML */
export interface RelayerConfig {
  sedaFast: {
    apiUrl: string;
    apiKey: string;
  };
  feeds: FeedConfig[];
  evm: {
    rpcUrl: string;
    chainId: number;
    priceStoreAddress: string;
  };
  updateIntervalMs: number;
  maxGasPriceGwei: number;
}

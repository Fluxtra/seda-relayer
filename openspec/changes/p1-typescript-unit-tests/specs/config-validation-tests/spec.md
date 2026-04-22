## ADDED Requirements

### Requirement: Valid config loads successfully
The test suite SHALL verify that `loadConfig` returns a correctly typed `RelayerConfig` when given a valid YAML file and all required environment variables.

#### Scenario: Complete valid config
- **WHEN** `loadConfig` is called with a path to a valid YAML file containing all required fields AND `RELAYER_PRIVATE_KEY` and `SEDA_FAST_API_KEY` env vars are set
- **THEN** the returned `RelayerConfig` MUST contain the correct values for `sedaFast`, `feeds`, `evm`, `updateIntervalMs`, and `maxGasPriceGwei`

### Requirement: SEDA_FAST_API_KEY env var overrides config
The test suite SHALL verify that the `SEDA_FAST_API_KEY` environment variable takes precedence over the YAML config value.

#### Scenario: Env var override
- **WHEN** the YAML file contains `sedaFast.apiKey: "yaml-key"` AND `SEDA_FAST_API_KEY=env-key` is set in the environment
- **THEN** `loadConfig` MUST return a config where `sedaFast.apiKey` equals `"env-key"`

### Requirement: Missing sedaFast.apiUrl throws
The test suite SHALL verify that `loadConfig` throws a descriptive error when `sedaFast.apiUrl` is missing.

#### Scenario: Missing apiUrl
- **WHEN** `loadConfig` is called with a YAML file that omits `sedaFast.apiUrl`
- **THEN** the function MUST throw an error with message "Missing sedaFast.apiUrl"

### Requirement: Missing sedaFast.apiKey throws
The test suite SHALL verify that `loadConfig` throws when no API key is available from config or environment.

#### Scenario: Missing apiKey
- **WHEN** `loadConfig` is called with a YAML file that omits `sedaFast.apiKey` AND `SEDA_FAST_API_KEY` env var is not set
- **THEN** the function MUST throw an error with message containing "Missing sedaFast.apiKey"

### Requirement: Missing feeds throws
The test suite SHALL verify that `loadConfig` throws when the feeds array is empty or missing.

#### Scenario: Empty feeds array
- **WHEN** `loadConfig` is called with a YAML file where `feeds` is an empty array
- **THEN** the function MUST throw an error with message "Missing feeds configuration"

### Requirement: Feed missing symbol throws
The test suite SHALL verify that `loadConfig` throws when a feed entry lacks a `symbol` field.

#### Scenario: No symbol in feed
- **WHEN** `loadConfig` is called with a YAML file where a feed has no `symbol`
- **THEN** the function MUST throw an error with message "Feed missing symbol"

### Requirement: Feed missing execProgramId throws
The test suite SHALL verify that `loadConfig` throws when a feed entry lacks an `execProgramId` field.

#### Scenario: No execProgramId in feed
- **WHEN** `loadConfig` is called with a YAML file where a feed has `symbol: "ETH/USD"` but no `execProgramId`
- **THEN** the function MUST throw an error with message containing "missing execProgramId"

### Requirement: Missing evm.rpcUrl throws
The test suite SHALL verify that `loadConfig` throws when `evm.rpcUrl` is missing.

#### Scenario: Missing rpcUrl
- **WHEN** `loadConfig` is called with a YAML file that omits `evm.rpcUrl`
- **THEN** the function MUST throw an error with message "Missing evm.rpcUrl"

### Requirement: Missing evm.priceStoreAddress throws
The test suite SHALL verify that `loadConfig` throws when `evm.priceStoreAddress` is missing.

#### Scenario: Missing priceStoreAddress
- **WHEN** `loadConfig` is called with a YAML file that omits `evm.priceStoreAddress`
- **THEN** the function MUST throw an error with message "Missing evm.priceStoreAddress"

### Requirement: Missing RELAYER_PRIVATE_KEY throws
The test suite SHALL verify that `loadConfig` throws when the `RELAYER_PRIVATE_KEY` environment variable is not set.

#### Scenario: Missing private key env var
- **WHEN** `loadConfig` is called with a valid YAML file BUT `RELAYER_PRIVATE_KEY` is not set in `process.env`
- **THEN** the function MUST throw an error with message "Missing RELAYER_PRIVATE_KEY env var"

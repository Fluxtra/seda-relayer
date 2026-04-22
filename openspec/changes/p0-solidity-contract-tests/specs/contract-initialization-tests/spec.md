## ADDED Requirements

### Requirement: Initialize sets owner and relayer
The test suite SHALL verify that after deploying `SedaPriceStore` via UUPS proxy with `initialize(owner, relayer)`, the `owner()` function returns the owner address and `relayers(relayer)` returns `true`.

#### Scenario: Successful initialization
- **WHEN** `SedaPriceStore` is deployed via `upgrades.deployProxy` with valid owner and relayer addresses
- **THEN** `owner()` MUST return the owner address AND `relayers(relayer)` MUST return `true`

### Requirement: Initialize emits RelayerAdded event
The test suite SHALL verify that the `initialize` function emits a `RelayerAdded` event with the relayer address.

#### Scenario: Event emitted on initialization
- **WHEN** `SedaPriceStore` is initialized with a relayer address
- **THEN** a `RelayerAdded` event MUST be emitted with the relayer address as the indexed parameter

### Requirement: Initialize reverts on zero-address owner
The test suite SHALL verify that `initialize` reverts with `ZeroAddress()` when `address(0)` is passed as the owner.

#### Scenario: Zero-address owner rejected
- **WHEN** `deployProxy` is called with `address(0)` as the owner parameter
- **THEN** the transaction MUST revert with custom error `ZeroAddress()`

### Requirement: Initialize reverts on zero-address relayer
The test suite SHALL verify that `initialize` reverts with `ZeroAddress()` when `address(0)` is passed as the relayer.

#### Scenario: Zero-address relayer rejected
- **WHEN** `deployProxy` is called with `address(0)` as the relayer parameter
- **THEN** the transaction MUST revert with custom error `ZeroAddress()`

### Requirement: Double initialization is blocked
The test suite SHALL verify that calling `initialize` on an already-initialized proxy reverts.

#### Scenario: Re-initialization rejected
- **WHEN** `initialize(owner, relayer)` is called on a proxy that has already been initialized
- **THEN** the transaction MUST revert with `InvalidInitialization()` (OpenZeppelin v5)

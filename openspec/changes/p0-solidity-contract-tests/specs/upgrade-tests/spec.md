## ADDED Requirements

### Requirement: Owner can upgrade proxy
The test suite SHALL verify that the contract owner can perform a UUPS upgrade to a new implementation.

#### Scenario: Successful UUPS upgrade
- **WHEN** the owner calls `upgrades.upgradeProxy(proxyAddress, SedaPriceStoreV2Factory)` with a valid V2 implementation
- **THEN** the upgrade MUST succeed AND calling the new `version()` function on the proxy MUST return the expected value

### Requirement: Non-owner cannot upgrade proxy
The test suite SHALL verify that only the owner can authorize a UUPS upgrade.

#### Scenario: Unauthorized upgrade rejected
- **WHEN** a non-owner address attempts to call `upgrades.upgradeProxy` (which internally calls `upgradeToAndCall`)
- **THEN** the transaction MUST revert with `OwnableUnauthorizedAccount`

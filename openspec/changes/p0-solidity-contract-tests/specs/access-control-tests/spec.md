## ADDED Requirements

### Requirement: Non-relayer cannot update prices
The test suite SHALL verify that the `onlyRelayer` modifier blocks unauthorized callers from calling `updatePrices`.

#### Scenario: Unauthorized caller rejected
- **WHEN** an address that is not in the `relayers` mapping calls `updatePrices`
- **THEN** the transaction MUST revert with custom error `OnlyRelayer()`

### Requirement: Only owner can add relayer
The test suite SHALL verify that `addRelayer` is restricted to the contract owner.

#### Scenario: Non-owner cannot add relayer
- **WHEN** a non-owner address calls `addRelayer(newRelayer)`
- **THEN** the transaction MUST revert with `OwnableUnauthorizedAccount`

### Requirement: Only owner can remove relayer
The test suite SHALL verify that `removeRelayer` is restricted to the contract owner.

#### Scenario: Non-owner cannot remove relayer
- **WHEN** a non-owner address calls `removeRelayer(existingRelayer)`
- **THEN** the transaction MUST revert with `OwnableUnauthorizedAccount`

### Requirement: addRelayer rejects zero address
The test suite SHALL verify that `addRelayer` reverts when passed `address(0)`.

#### Scenario: Zero address rejected
- **WHEN** the owner calls `addRelayer(address(0))`
- **THEN** the transaction MUST revert with `ZeroAddress()`

### Requirement: Added relayer can submit prices
The test suite SHALL verify that after `addRelayer`, the new relayer can call `updatePrices`.

#### Scenario: New relayer submits successfully
- **WHEN** the owner calls `addRelayer(newAddress)` AND the newAddress calls `updatePrices` with valid data
- **THEN** the `updatePrices` call MUST succeed and the price MUST be stored correctly

### Requirement: Removed relayer cannot submit prices
The test suite SHALL verify that after `removeRelayer`, the removed address can no longer call `updatePrices`.

#### Scenario: Removed relayer is blocked
- **WHEN** the owner calls `removeRelayer(existingRelayer)` AND the existingRelayer calls `updatePrices`
- **THEN** the transaction MUST revert with `OnlyRelayer()`

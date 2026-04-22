## ADDED Requirements

### Requirement: Pause blocks updatePrices
The test suite SHALL verify that when the contract is paused, `updatePrices` reverts.

#### Scenario: Update rejected when paused
- **WHEN** the owner calls `pause()` AND a relayer calls `updatePrices` with valid data
- **THEN** the transaction MUST revert with `EnforcedPause()` (OpenZeppelin v5)

### Requirement: Unpause re-enables updatePrices
The test suite SHALL verify that after unpausing, `updatePrices` works again.

#### Scenario: Update succeeds after unpause
- **WHEN** the owner calls `pause()` then `unpause()` AND a relayer calls `updatePrices`
- **THEN** the transaction MUST succeed and the price MUST be stored

### Requirement: Only owner can pause
The test suite SHALL verify that `pause()` is restricted to the owner.

#### Scenario: Non-owner cannot pause
- **WHEN** a non-owner address calls `pause()`
- **THEN** the transaction MUST revert with `OwnableUnauthorizedAccount`

### Requirement: Only owner can unpause
The test suite SHALL verify that `unpause()` is restricted to the owner.

#### Scenario: Non-owner cannot unpause
- **WHEN** a non-owner address calls `unpause()`
- **THEN** the transaction MUST revert with `OwnableUnauthorizedAccount`

### Requirement: paused() reflects correct state
The test suite SHALL verify that `paused()` returns the correct boolean throughout the lifecycle.

#### Scenario: Pause state transitions
- **WHEN** the contract is freshly deployed
- **THEN** `paused()` MUST return `false`

#### Scenario: Paused after pause call
- **WHEN** the owner calls `pause()`
- **THEN** `paused()` MUST return `true`

#### Scenario: Unpaused after unpause call
- **WHEN** the owner calls `pause()` then `unpause()`
- **THEN** `paused()` MUST return `false`

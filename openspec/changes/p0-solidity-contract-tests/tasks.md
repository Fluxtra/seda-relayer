## 1. Setup

- [x] 1.1 Create `test/` directory and `test/SedaPriceStore.test.ts` file with imports for hardhat, ethers, chai, `@nomicfoundation/hardhat-network-helpers` (`loadFixture`), and `@openzeppelin/hardhat-upgrades`
- [x] 1.2 Create `contracts/test/SedaPriceStoreV2.sol` — a minimal UUPS-upgradeable contract extending `SedaPriceStore` with an added `function version() external pure returns (uint256)` returning `2`
- [x] 1.3 Implement the shared `deployFixture` function: get signers (owner, relayer, unauthorized), deploy `SedaPriceStore` via `upgrades.deployProxy(factory, [owner.address, relayer.address], { kind: "uups" })`, return `{ contract, owner, relayer, unauthorized }`

## 2. Initialization Tests

- [x] 2.1 Test `initialize` sets owner and relayer correctly: assert `owner()` returns owner address, `relayers(relayer)` returns `true`
- [x] 2.2 Test `initialize` emits `RelayerAdded` event with the relayer address
- [x] 2.3 Test `initialize` reverts with `ZeroAddress()` when `address(0)` is passed as owner
- [x] 2.4 Test `initialize` reverts with `ZeroAddress()` when `address(0)` is passed as relayer
- [x] 2.5 Test calling `initialize` again on deployed proxy reverts with `InvalidInitialization()`

## 3. Price Update Happy Path Tests

- [x] 3.1 Test single feed update: relayer calls `updatePrices([feedId], [price], [ts])`, verify `getLatestPrice` returns `(price, ts, 1)`
- [x] 3.2 Test batch update of 3 feeds in one call: verify each feed stored correctly with `roundId = 1`
- [x] 3.3 Test sequential updates increment `roundId`: update same feed twice with increasing timestamps, verify second returns `roundId = 2`
- [x] 3.4 Test `PriceUpdated` events emitted for each feed in a batch with correct args

## 4. Price Update Revert Tests

- [x] 4.1 Test array length mismatch (feedIds vs prices) reverts with `ArrayLengthMismatch()`
- [x] 4.2 Test array length mismatch (feedIds vs timestamps) reverts with `ArrayLengthMismatch()`
- [x] 4.3 Test equal timestamp reverts with `StaleTimestamp(feedId, T, T)`
- [x] 4.4 Test earlier timestamp (T=50 after T=100) reverts with `StaleTimestamp(feedId, 50, 100)`
- [x] 4.5 Test empty arrays `updatePrices([], [], [])` succeeds without revert

## 5. Access Control Tests

- [x] 5.1 Test unauthorized caller `updatePrices` reverts with `OnlyRelayer()`
- [x] 5.2 Test non-owner calling `addRelayer` reverts with `OwnableUnauthorizedAccount`
- [x] 5.3 Test non-owner calling `removeRelayer` reverts with `OwnableUnauthorizedAccount`
- [x] 5.4 Test `addRelayer(address(0))` reverts with `ZeroAddress()`
- [x] 5.5 Test owner adds new relayer, then new relayer can successfully call `updatePrices`
- [x] 5.6 Test owner removes relayer, then removed relayer `updatePrices` call reverts with `OnlyRelayer()`

## 6. Pause / Unpause Tests

- [x] 6.1 Test `updatePrices` reverts with `EnforcedPause()` when contract is paused
- [x] 6.2 Test `updatePrices` succeeds after owner pauses then unpauses
- [x] 6.3 Test non-owner calling `pause()` reverts with `OwnableUnauthorizedAccount`
- [x] 6.4 Test non-owner calling `unpause()` reverts with `OwnableUnauthorizedAccount`
- [x] 6.5 Test `paused()` returns `false` initially, `true` after `pause()`, `false` after `unpause()`

## 7. Read Function Tests

- [x] 7.1 Test `getLatestPrice` returns `(0, 0, 0)` for an uninitialized feedId
- [x] 7.2 Test `latestRoundData` returns `(roundId, price, timestamp, timestamp, roundId)` after an update
- [x] 7.3 Test `decimals()` returns `18`

## 8. UUPS Upgrade Tests

- [x] 8.1 Test owner can upgrade proxy to `SedaPriceStoreV2` via `upgrades.upgradeProxy`, then call `version()` returns `2`
- [x] 8.2 Test non-owner upgrade attempt reverts with `OwnableUnauthorizedAccount`

## 9. Verification

- [x] 9.1 Run `npx hardhat test` and verify all tests pass
- [x] 9.2 Verify no compilation warnings or errors from the V2 test contract

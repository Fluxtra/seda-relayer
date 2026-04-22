// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SedaPriceStore} from "../SedaPriceStore.sol";

/// @title SedaPriceStoreV2 — minimal upgrade target for testing UUPS upgrades
contract SedaPriceStoreV2 is SedaPriceStore {
    function version() external pure returns (uint256) {
        return 2;
    }
}

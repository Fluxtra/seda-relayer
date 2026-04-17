import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SedaPriceStore with account:", deployer.address);

  const relayerAddress = process.env.RELAYER_ADDRESS || deployer.address;
  console.log("Initial relayer:", relayerAddress);

  const SedaPriceStore = await hre.ethers.getContractFactory("SedaPriceStore");
  const proxy = await hre.upgrades.deployProxy(
    SedaPriceStore,
    [deployer.address, relayerAddress],
    { kind: "uups" }
  );
  await proxy.waitForDeployment();

  const address = await proxy.getAddress();
  console.log("SedaPriceStore deployed to:", address);
  console.log("\nUpdate config.yaml with:");
  console.log(`  priceStoreAddress: "${address}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

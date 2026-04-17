import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Check balance before deploying
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} OM`);

  if (balance === 0n) {
    console.error(`\nError: Deployer has 0 balance. Send funds to ${deployer.address}`);
    process.exit(1);
  }

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
  console.log("\n✅ SedaPriceStore deployed to:", address);
  console.log("\nUpdate config.yaml with:");
  console.log(`  priceStoreAddress: "${address}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

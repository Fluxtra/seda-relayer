import hre from "hardhat";
import { bech32 } from "bech32";

function evmToBech32(evmAddress: string, prefix: string = "mantra"): string {
  const bytes = Buffer.from(evmAddress.replace("0x", ""), "hex");
  return bech32.encode(prefix, bech32.toWords(bytes));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const evmAddr = deployer.address;
  const bech32Addr = evmToBech32(evmAddr);

  console.log("Deployer EVM address:    ", evmAddr);
  console.log("Deployer bech32 address: ", bech32Addr);

  // Check balance before deploying
  const balance = await hre.ethers.provider.getBalance(evmAddr);
  const balanceFormatted = hre.ethers.formatEther(balance);
  console.log(`Balance: ${balanceFormatted} OM`);

  if (balance === 0n) {
    console.error("\nError: Deployer has 0 balance on the EVM side.");
    console.error("On Mantra chain, make sure you send funds to the EVM-compatible address:");
    console.error(`  EVM:    ${evmAddr}`);
    console.error(`  bech32: ${bech32Addr}`);
    console.error("\nIf you sent to the bech32 address and balance still shows 0,");
    console.error("you may need to use the Mantra bridge to convert Cosmos → EVM funds.");
    process.exit(1);
  }

  const relayerAddress = process.env.RELAYER_ADDRESS || evmAddr;
  console.log("Initial relayer:", relayerAddress);

  const SedaPriceStore = await hre.ethers.getContractFactory("SedaPriceStore");
  const proxy = await hre.upgrades.deployProxy(
    SedaPriceStore,
    [evmAddr, relayerAddress],
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

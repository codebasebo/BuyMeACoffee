require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffe.sol/BuyMeACoffee.json");


async function getBalance(provider, address) {
    const balanceBigInt = await provider.getBalance(address);
    return hre.ethers.formatEther(balanceBigInt);
}

async function main() {
    // Get the contract that has been deployed to Sepolia
    const contractAddress = "0xe13a09d0bD7AbAAc234eeF7F3f73a067AdDc7b5d";
    const contractABI = abi.abi;

    // Get the node connection and wallet connection
    const provider = new hre.ethers.JsonRpcProvider(
        process.env.ALCHEMY_ETH_SEPOLIA
    );

    // Ensure that signer is the SAME address as the original contract deployer,
    // or else this script will fail with an error.
    const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Instantiate connected contract
    const buyMeACoffee = new hre.ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );

    // Check starting balances
    console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
    const contractBalance = await getBalance(provider, buyMeACoffee.address);
    console.log("current balance of contract: ", contractBalance, "ETH");

    // Withdraw funds if there are funds to withdraw
    if (contractBalance !== "0.0") {
        console.log("withdrawing funds..")
        const withdrawTxn = await buyMeACoffee.withdrawTips();
        await withdrawTxn.wait();
    } else {
        console.log("no funds to withdraw!");
    }

    // Check ending balance
    console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);

    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}

runMain();
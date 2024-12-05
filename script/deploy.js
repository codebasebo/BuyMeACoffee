const main = async () => {

    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await hre.ethers.provider.getBalance(deployer.address);


    console.log("deploying contract with account ", await deployer.getAddress());
    console.log("Account balance ", accountBalance.toString());

    const BuyMeACoffeeFactory = await hre.ethers.getContractFactory("BuyMeACoffee");
    const BuyMeACoffeeContract = await BuyMeACoffeeFactory.deploy();
    await BuyMeACoffeeContract.waitForDeployment();
    console.log("Contract deployed to: ", await BuyMeACoffeeContract.getAddress());





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
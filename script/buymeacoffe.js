// Description: This script is used to deploy the contract and interact with it.
//Return the Ether balance of an account
async function getBalance(account) {
    return hre.ethers.provider.getBalance(account);
}

//Return the Ether balance of an account in a readable format
async function printBalance(addresses) {
    let idx = 0;
    for (const address of addresses) {
        console.log(`Account ${idx++}: ${address} has a balance of`,
            (await getBalance(address)).toString(), "ETH" // Get the balance of the account
        );
    }
}

//Log the memos stored on the blockchain
async function printMemos(memos) {
    for (const memo of memos) {
        const timestamp = memo.timestamp.toNumber();
        const tipper = memo.name;
        const tipperAddress = memo.from;
        const message = memo.message;
        console.log(`[${new Date(timestamp * 1000).toLocaleString()}] ${tipper} (${tipperAddress}): ${message}`);
    }
}

// ... previous code remains the same ...

async function main() {
    // Get accounts 
    const [owner] = await hre.ethers.getSigners();

    // Get the contract and Deploy
    const BuyMeCoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
    const buyMeCoffee = await BuyMeCoffee.deploy();
    await buyMeCoffee.waitForDeployment();
    console.log("BuyMeCoffee deployed to:", await buyMeCoffee.getAddress());

    // Check the balance of the accounts
    const addresses = [
        await owner.getAddress(),
        await tipper1.getAddress(),
        await buyMeCoffee.getAddress()
    ];
    console.log("== start == ");
    await printBalance(addresses);

    // Buy the owner a coffee
    const tip = { value: hre.ethers.parseEther("0.0001") };
    await buyMeCoffee.connect(tipper1).buyCoffee("Caroline", "Thanks for the great content!", tip);
    await buyMeCoffee.connect(tipper2).buyCoffee("Vitto", "Awesome work!", tip);
    await buyMeCoffee.connect(tipper3).buyCoffee("John", "Great job!", tip);

    // Check balances after purchasing coffee
    console.log("== after purchase == ");
    await printBalance(addresses);

    // Withdraw the funds
    await buyMeCoffee.connect(owner).withdraw();

    // Check balances after withdrawal
    console.log("== after withdrawal == ");
    await printBalance(addresses);

    // Print the memos
    console.log("== memos == ");
    const memos = await buyMeCoffee.getMemos();
    await printMemos(memos);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

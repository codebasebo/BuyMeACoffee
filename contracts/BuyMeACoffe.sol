// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BuyMeACoffee {
    event NewMemo(address indexed from, uint256 timestamp, string name, string message);

    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    address payable public owner;
    Memo[] public memos;

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev buy a coffe for the owner
     * @param _name the name of the buyer
     * @param _message the message for the owner
     */
    function buyCoffe(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "You can't buy a coffe without money");

        memos.push(Memo({from: msg.sender, timestamp: block.timestamp, name: _name, message: _message}));
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev withdraw the balance of the contract
     * Only the owner can withdraw the balance
     */
    function withdrawTips() public {
        require(msg.sender == owner, "Only the owner can withdraw the balance");
        uint256 balance = address(this).balance;
        owner.transfer(balance);
    }

    /**
     * @dev retrieve all the memos
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}

import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head';
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';


export default function Home() {
  const contractAddress = "0xe13a09d0bD7AbAAc234eeF7F3f73a067AdDc7b5d";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => setName(event.target.value);
  const onMessageChange = (event) => setMessage(event.target.value);

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const coffeeTxn = await buyMeACoffee.buyCoffe(
          name || "anon",
          message || "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.0001") }
        );

        await coffeeTxn.wait();
        setName("");
        setMessage("");
        getMemos();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const memos = await buyMeACoffee.getMemos();
        setMemos(memos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Me a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Buy Me a Coffee!</h1>

        {currentAccount ? (
          <form className={styles.form}>
            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="anon"
                value={name}
                onChange={onNameChange}
              />
            </div>
            <div>
              <label>Send Me a Message</label>
              <textarea
                rows="3"
                placeholder="Enjoy your coffee!"
                value={message}
                onChange={onMessageChange}
              />
            </div>
            <button type="button" onClick={buyCoffee}>
              Send 1 Coffee for 0.0001ETH
            </button>
          </form>
        ) : (
          <button onClick={connectWallet} className={styles.connectWallet}>
            Connect your Wallet
          </button>
        )}

        {currentAccount && <h1 className={styles.memosHeader}>Memos Received</h1>}

        {currentAccount &&
          memos.slice().reverse().map((memo, idx) => (
            <div key={idx} className={styles.memo}>
              <p>"{memo.message}"</p>
              <p>
                From: <strong>{memo.name}</strong> at{" "}
                {new Date(memo.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          ))}
      </main>

      <footer className={styles.footer}>
        <p>Created by @Me</p>
      </footer>
    </div>
  );
}

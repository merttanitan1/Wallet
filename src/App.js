import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns(uint256)",
    "function decimals() view returns(uint8)",
    "function transfer(address to, uint256 amount) returns(bool)"
  ];
  const LINK_ADDRESS = "0x779877a7b0d9e8603169ddbd7836e478b4624789"
  const TEST_ADDRESS = "0xD19AF147a94B42991fC7d5f8CC85120742550bB2"
  const [account, setAccount] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [testBalance, setTestBalance] = useState(null);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const connectWallet = async() => {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        await getEthBalance(accounts[0]);
        await getTokenBalance(accounts[0]);
        await getTestBalance(accounts[0]);
      }catch(error){
        console.error("MetaMask connection error:", error);
      }
    }else{
      alert("Please install Metamask");
    }
  }

  const getEthBalance = async(account) => {
    if(window.ethereum){
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(balance));
    }
  };

  const getTokenBalance = async(account) => {
    if(window.ethereum){
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenContract = new ethers.Contract(LINK_ADDRESS, ERC20_ABI, provider);

        const balance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        const adjustedBalance = ethers.formatEther(balance, decimals);
        setTokenBalance(adjustedBalance);
      }catch(error){
        alert("Couldn't find Token Address at this chain. Please change your chain", error);
      }
    }
  }

  const getTestBalance = async(account) => {
    if(window.ethereum){
      try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenContract = new ethers.Contract(TEST_ADDRESS, ERC20_ABI, provider);

        const balance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        const adjustedBalance = ethers.formatEther(balance, decimals);
        setTestBalance(adjustedBalance);
      }catch(error){
        alert("Couldn't find Token Address at this chain. Please change your chain.", error);
      }
    }
  }

  const transferTokens = async() => {
    if (window.ethereum && transferAddress && transferAmount) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(LINK_ADDRESS, ERC20_ABI, signer);

      try {
        const decimals = await tokenContract.decimals();
        const amount = ethers.parseUnits(transferAmount, decimals);
        const tx = await tokenContract.transfer(transferAddress, amount);
        await tx.wait();
        alert('Transaction successful.');
        await getTokenBalance(account);
      }catch (error){
        console.error("Transaction Failed.", error);
        alert("Transaction Failed.");
      }
    }else{
      alert('Please enter a valid address and amount.');
    }
  };

  useEffect(() => {
    const checkConnection = async() => {
      if(window.ethereum){
        try{
          const accounts = await window.ethereum.request({ method: "eth_accounts"});
          if(accounts.length > 0){
            setAccount(accounts[0]);
            await getEthBalance(accounts[0]);
            await getTokenBalance(accounts[0]);
            await getTestBalance(accounts[0]);
          }
        }catch(error){
          console.error("MetaMask connection error:", error);
        }
      }
    };

    checkConnection();

    const handleAccountChanged = async(accounts) => {
      if(accounts.length > 0){
        setAccount(accounts[0]);
        await getEthBalance(accounts[0]);
        await getTokenBalance(accounts[0]);
        await getTestBalance(accounts[0]);
      }else {
        setAccount(null);
        await getEthBalance(null);
        await getTokenBalance(null);
        await getTestBalance(null);
      }
    }

    const handleChainChanged = async(chainId) => {
      if(account) {
        await getEthBalance(account);
        await getTokenBalance(account);
        await getTestBalance(account);
      }
    };

    if(window.ethereum){
      window.ethereum.on('accountsChanged', handleAccountChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if(window.ethereum){
        window.ethereum.removeListener('accountsChanged', handleAccountChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  return(
    <div className='App'>
      <header className='App-header'>
        <h1>Wallet</h1>
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <p>Account: {account}</p>
            <p>ETH Balance: {ethBalance}</p>
            <p>Token Balance: {tokenBalance}</p>
            <p>Test Balance: {testBalance}</p>
            <div>
              <h2>Transfer Token</h2>
              <input
                type="text"
                placeholder="Receiver"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <button onClick={transferTokens}>Transfer</button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

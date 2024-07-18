import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  const LINK_ADDRESS = "0x779877a7b0d9e8603169ddbd7836e478b4624789"
  const ethers = require('ethers');
  const [account, setAccount] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);

  useEffect(() => {
    const checkConnection = async() => {
      if(window.ethereum){
        try{
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if(accounts.length > 0){
            setAccount(accounts[0]);
            await getEthBalance(accounts[0]); //s
            await getTokenBalance(accounts[0]);
          }
        }
        catch(error){
          console.error("MetaMask connection error: ", error);
        }
      }
    };

    checkConnection();

    const handleAccountChanged = async(accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await getEthBalance(accounts[0]);
        await getTokenBalance(accounts[0]);
      }else {
        setAccount(null);
        setEthBalance(null);
        setTokenBalance(null);
      }
    };

    const handleChainChanged = async(chainId) => {
      if(account){
        await getEthBalance(account);
        await getTokenBalance(account);
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

  const connectWallet = async() => {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await getEthBalance(accounts[0]); //s
        await getTokenBalance(accounts[0]);
      } catch(err){
        console.error("MetaMask connection error: ", err);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  const getTokenBalance = async (account) => {
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

  const getEthBalance = async (account) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(balance)); //s
    }
  };

  return(
    <div className='App'>
      <header className='App-header'>
        <h1>Wallet</h1>
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <p>Account: {account}</p>
            <p>Balance: {ethBalance} ETH</p>
            <p>Token Balance: {tokenBalance} LINK</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

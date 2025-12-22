import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';
import { hashPassword } from '../utils/crypto';

export const useEthereum = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState(null);
  const [error, setError] = useState(null);

  // Подключение к MetaMask
  const connectWallet = async () => {
    try {
      setError(null);
      
      if (typeof window.ethereum !== 'undefined') {
        // Запрос доступа к аккаунтам
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        // Создаем provider с явным указанием Ganache
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Проверяем подключение к правильной сети (Ganache обычно 1337)
        const network = await provider.getNetwork();
        setNetworkId(Number(network.chainId));
        
        // Если вы используете Ganache, можно автоматически переключиться
        if (network.chainId !== 1337n) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x539' }], // 1337 в hex
            });
          } catch (switchError) {
            // Если сеть не добавлена, добавляем её
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x539',
                  chainName: 'Ganache Local',
                  rpcUrls: ['http://127.0.0.1:7545'],
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                  }
                }]
              });
            }
          }
        }
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        setAccount(accounts[0]);
        setSigner(signer);
        setContract(contract);
        setIsConnected(true);
        
        console.log('Connected to:', accounts[0]);
        console.log('Network:', network);
        
        return true;
      } else {
        setError('Please install MetaMask!');
        return false;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
      return false;
    }
  };

  // Получение provider для чтения (без signer)
  const getReadOnlyContract = () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    }
    return null;
  };

  // Слушатель изменений
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          connectWallet();
        } else {
          setIsConnected(false);
          setAccount(null);
          setContract(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return {
    account,
    contract,
    signer,
    isConnected,
    networkId,
    error,
    connectWallet,
    getReadOnlyContract,
  };
};
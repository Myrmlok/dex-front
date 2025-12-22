import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

// Конфигурация RPC
const RPC_URL = 'http://127.0.0.1:7545';
const NETWORK_CONFIG = {
  chainId: 1337,
  name: 'ganache',
  ensAddress: null
};

export const useDirectProvider = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState('0');

  // Инициализация провайдера
  const initProvider = useCallback(async () => {
    try {
      console.log('Initializing direct provider...');
      
      // Создаем провайдер с настройками для Ganache
      const jsonRpcProvider = new ethers.JsonRpcProvider(
        RPC_URL,
        NETWORK_CONFIG,
        {
          staticNetwork: true, // Не проверять сеть
          batchMaxCount: 1,    // Отключить батчинг
          cacheTimeout: -1,    // Отключить кэш
          polling: false       // Отключить опрос
        }
      );
      
      setProvider(jsonRpcProvider);
      console.log('Provider initialized');
      
      return jsonRpcProvider;
    } catch (error) {
      console.error('Failed to initialize provider:', error);
      setError(`Provider initialization failed: ${error.message}`);
      return null;
    }
  }, []);

  // Получение аккаунтов из Ganache
  const getAccounts = useCallback(async (providerInstance) => {
    try {
      console.log('Fetching accounts from Ganache...');
      const accounts = await providerInstance.listAccounts();
      console.log('Found accounts:', accounts.map(a => a.address));
      return accounts;
    } catch (error) {
      console.error('Failed to get accounts:', error);
      setError(`Failed to get accounts: ${error.message}`);
      return [];
    }
  }, []);

  // Подключение к Ganache
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Connecting to Ganache...');
      
      // Инициализируем провайдер
      const providerInstance = await initProvider();
      if (!providerInstance) {
        throw new Error('Failed to initialize provider');
      }
      
      // Получаем аккаунты
      const accountList = await getAccounts(providerInstance);
      if (accountList.length === 0) {
        throw new Error('No accounts found in Ganache. Make sure Ganache is running.');
      }
      
      // Выбираем первый аккаунт
      const firstAccount = accountList[0];
      const signerInstance = await providerInstance.getSigner(firstAccount.address);
      
      // Создаем контракт
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS, 
        CONTRACT_ABI, 
        signerInstance
      );
      
      // Получаем баланс
      const ethBalance = await providerInstance.getBalance(firstAccount.address);
      
      // Обновляем состояние
      setProvider(providerInstance);
      setSigner(signerInstance);
      setContract(contractInstance);
      setAccounts(accountList.map(acc => acc.address));
      setSelectedAccount(firstAccount.address);
      setBalance(ethers.formatEther(ethBalance));
      setIsConnected(true);
      
      console.log('Successfully connected to Ganache');
      console.log('Selected account:', firstAccount.address);
      console.log('Balance:', ethers.formatEther(ethBalance), 'ETH');
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      setError(`Connection failed: ${error.message}`);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [initProvider, getAccounts]);

  // Переключение аккаунта
  const switchAccount = useCallback(async (accountAddress) => {
    if (!provider) {
      setError('Provider not initialized');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const signerInstance = await provider.getSigner(accountAddress);
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS, 
        CONTRACT_ABI, 
        signerInstance
      );
      
      const ethBalance = await provider.getBalance(accountAddress);
      
      setSigner(signerInstance);
      setContract(contractInstance);
      setSelectedAccount(accountAddress);
      setBalance(ethers.formatEther(ethBalance));
      
      console.log('Switched to account:', accountAddress);
      return true;
    } catch (error) {
      console.error('Failed to switch account:', error);
      setError(`Failed to switch account: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Обновление баланса
  const refreshBalance = useCallback(async () => {
    if (!provider || !selectedAccount) return;
    
    try {
      const ethBalance = await provider.getBalance(selectedAccount);
      setBalance(ethers.formatEther(ethBalance));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [provider, selectedAccount]);

  // Отправка транзакции с обработкой ошибок
  const sendTransaction = useCallback(async (transactionFn, ...args) => {
    if (!contract || !selectedAccount) {
      throw new Error('Not connected');
    }
    
    try {
      console.log('Sending transaction...', transactionFn.name);
      const tx = await transactionFn(...args);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Обновляем баланс после транзакции
      await refreshBalance();
      
      return receipt;
    } catch (error) {
      console.error('Transaction failed:', error);
      
      // Детализация ошибок
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction might fail. Check parameters.');
      } else if (error.reason) {
        throw new Error(error.reason);
      } else {
        throw error;
      }
    }
  }, [contract, selectedAccount, refreshBalance]);

  // Инициализация при загрузке
  useEffect(() => {
    const init = async () => {
      try {
        await initProvider();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    init();
  }, [initProvider]);
  const getSupportedTokens = useCallback(async () => {
  if (!contract) {
    throw new Error('Contract not connected');
  }
  
  try {
    console.log('Fetching supported tokens...');
    
    // Пробуем разные варианты названия метода
    let tokens;
    

      
      try {
        // Пробуем getSupportedTokens (во множественном числе)
        tokens = await contract.supprotedTokenList();
      } catch (error2) {
        console.log('getSupportedTokens failed, trying fallback method...');
        
        // Используем fallback метод через массив
        const count = await contract.supprotedTokenList;
        tokens = [];
        
        
      }
    
    
    console.log('Supported tokens:', tokens);
    return tokens;
  } catch (error) {
    console.error('All methods failed to get supported tokens:', error);
    throw new Error(`Failed to get supported tokens: ${error.message}`);
  }
}, [contract]);
  return {
    // Состояние
    provider,
    signer,
    contract,
    accounts,
    selectedAccount,
    isConnected,
    isLoading,
    error,
    balance,
    
    // Методы
    connect,
    switchAccount,
    refreshBalance,
    sendTransaction,
    getSupportedTokens,
    // Утилиты
    clearError: () => setError(null),
    disconnect: () => {
      setIsConnected(false);
      setSelectedAccount(null);
      setContract(null);
      setSigner(null);
      setError(null);
    }
  };
};
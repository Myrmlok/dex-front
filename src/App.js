import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDirectProvider } from './hooks/useDirectProvider';
import { hashPassword } from './utils/crypto';

// Компоненты
import { Header } from './components/Header';
import { ConnectionSection } from './components/ConnectionSection';
import { AccountSelector } from './components/AccountSelector';
import { RegistrationSection } from './components/RegistrationSection';
import { BalancesSection } from './components/BalancesSection';
import { DepositSection } from './components/DepositSection';
import { WithdrawSection } from './components/WithdrawSection';
import { ExchangeSection } from './components/ExchangeSection';
import { SupportedTokensSection } from './components/SupportedTokensSection';
import { ExchangeHistorySection } from './components/ExchangeHistorySection';

import './App.css';

function App() {
  const {
    provider,
    contract,
    accounts,
    selectedAccount,
    isConnected,
    isLoading,
    error,
    balance,
    connect,
    switchAccount,
    refreshBalance,
    sendTransaction,
    clearError,
    disconnect
  } = useDirectProvider();
  
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Состояния для данных
  const [tokens, setTokens] = useState([]);
  const [balances, setBalances] = useState({});
  const [supportedTokens, setSupportedTokens] = useState(["0x5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5","0xD4Fc541236927E2EAf8F27606bD7309C1Fc2cbee"]);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');

  // Проверка регистрации
  const checkRegistration = async () => {
    if (!contract || !selectedAccount) return;
    
    try {
      console.log('Checking registration for:', selectedAccount);
      const registered = await contract.isUserRegistered(selectedAccount);
      setIsRegistered(registered);
      
      if (registered) {
        await fetchBalances();
        await fetchSupportedTokens();
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      // Если метод revert'ает при незарегистрированном пользователе,
      // это нормально - значит пользователь не зарегистрирован
      if (error.message.includes('missing revert data') || 
          error.message.includes('execution reverted')) {
        setIsRegistered(false);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  // Регистрация
  const handleRegister = async (userPassword) => {
    if (!contract || !selectedAccount) {
      alert('Please connect first');
      return;
    }
    
    try {
      setLoading(true);
      const hashedPassword ="0x"+ hashPassword(userPassword);
      console.log('Registering with hash:', hashedPassword);
      
      await sendTransaction(
        contract.register,
        hashedPassword
      );
      
      setIsRegistered(true);
      setCurrentPassword(userPassword);
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message.includes('User already registered')) {
        setIsRegistered(true);
        alert('This account is already registered');
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Депозит
  const handleDeposit = async (token, amount) => {
    if (!contract || !selectedAccount) {
      alert('Please connect first');
      return;
    }
    
    if (!currentPassword) {
      const newPassword = prompt('Please enter your password:');
      if (!newPassword) return;
      setCurrentPassword(newPassword);
    }
    
    try {
      setLoading(true);
      const hashedPassword = hashPassword(currentPassword);
      
      // Сначала проверяем, что токен поддерживается
      const isSupported = await contract.supportedTokens(token);
      if (!isSupported) {
        alert('Token not supported');
        return;
      }
      
      await sendTransaction(
        contract.depositToken,
        token,
        ethers.parseUnits(amount.toString(), 18),
        hashedPassword
      );
      
      alert('Deposit successful!');
      await fetchBalances();
    } catch (error) {
      console.error('Deposit error:', error);
      alert(`Deposit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Вывод
  const handleWithdraw = async (token, amount) => {
    if (!contract || !selectedAccount) {
      alert('Please connect first');
      return;
    }
    
    if (!currentPassword) {
      const newPassword = prompt('Please enter your password:');
      if (!newPassword) return;
      setCurrentPassword(newPassword);
    }
    
    try {
      setLoading(true);
      const hashedPassword = hashPassword(currentPassword);
      
      await sendTransaction(
        contract.withdrawToken,
        token,
        ethers.parseUnits(amount.toString(), 18),
        hashedPassword
      );
      
      alert('Withdrawal successful!');
      await fetchBalances();
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(`Withdrawal failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Обмен
  const handleExchange = async (tokenIn, tokenOut, amountIn) => {
    if (!contract || !selectedAccount) {
      alert('Please connect first');
      return;
    }
    
    if (!currentPassword) {
      const newPassword = prompt('Please enter your password:');
      if (!newPassword) return;
      setCurrentPassword(newPassword);
    }
    
    try {
      setLoading(true);
      const hashedPassword = hashPassword(currentPassword);
      
      // Сначала получаем расчет курса
      const exchangeRate = await contract.calculateExchangeRate(
        tokenIn,
        tokenOut,
        ethers.parseUnits(amountIn.toString(), 18)
      );
      
      console.log('Exchange rate:', exchangeRate.toString());
      
      await sendTransaction(
        contract.exchangeTokens,
        tokenIn,
        tokenOut,
        ethers.parseUnits(amountIn.toString(), 18),
        hashedPassword
      );
      
      alert('Exchange successful!');
      await fetchBalances();
      await fetchExchangeHistory();
    } catch (error) {
      console.error('Exchange error:', error);
      alert(`Exchange failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Получение балансов
  const fetchBalances = async () => {
    if (!contract || !selectedAccount) return;
    
    try {
      setLoading(true);
      const userTokens = await contract.getUserTokens(selectedAccount);
      const balancesObj = {};
      const tokensArray = [];
      
      for (const token of userTokens) {
        if (token !== '0x0000000000000000000000000000000000000000') {
          const balance = await contract.getUserBalance(selectedAccount, token);
          balancesObj[token] = ethers.formatUnits(balance, 18);
          tokensArray.push(token);
        }
      }
      
      setTokens(tokensArray);
      setBalances(balancesObj);
      
      // Обновляем баланс ETH
      await refreshBalance();
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получение поддерживаемых токенов
  const fetchSupportedTokens = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      
      console.log('Получение поддерживаемых токенов...');
    
    let supportedTokensAddresses = [];
    let source = 'unknown';
    await contract.FEE_PERCENT();

    // Вариант 1: Пробуем getSupportedTokenList()
    try {
      console.log('Пробуем getSupportedTokenList()...');
      const tokens = await contract.supprotedTokenList.getSupportedTokenList();
    
      // Проверяем, что это массив
      if (Array.isArray(tokens)) {
        supportedTokensAddresses = tokens;
        source = 'getSupportedTokenList';
        console.log('Токены из getSupportedTokenList():', tokens.length);
      } else {
        console.log('getSupportedTokenList() вернул не массив:', tokens);
      }
    } catch (error) {
      console.log('getSupportedTokenList() не сработал:', error.message);
    }

      console.log(tokens)
      setSupportedTokens(tokens);
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получение истории обменов
  const fetchExchangeHistory = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const historyLength = await contract.exchangeHistory.length();
      const history = [];
      
      const limit = Math.min(Number(historyLength), 10);
      
      for (let i = 0; i < limit; i++) {
        const record = await contract.exchangeHistory(i);
        history.push({
          user: record.user,
          tokenIn: record.tokenIn,
          tokenOut: record.tokenOut,
          amountIn: ethers.formatUnits(record.amountIn, 18),
          amountOut: ethers.formatUnits(record.amountOut, 18),
          timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString(),
          exchangeRate: record.exchangeRate.toString()
        });
      }
      
      setExchangeHistory(history);
    } catch (error) {
      console.error('Error fetching exchange history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик подключения
  const handleConnect = async () => {
    const connected = await connect();
    if (connected && selectedAccount) {
      await checkRegistration();
    }
  };

  // Обработчик смены аккаунта
  const handleAccountSwitch = async (account) => {
    const switched = await switchAccount(account);
    if (switched) {
      setIsRegistered(false);
      setTokens([]);
      setBalances({});
      setCurrentPassword('');
      await checkRegistration();
    }
  };

  // Отключение
  const handleDisconnect = () => {
    disconnect();
    setIsRegistered(false);
    setTokens([]);
    setBalances({});
    setCurrentPassword('');
  };

  // Загрузка данных при подключении
  useEffect(() => {
    if (isConnected && selectedAccount) {
      checkRegistration();
    }
  }, [isConnected, selectedAccount]);

  return (
    <div className="App">
      <Header
        isConnected={isConnected}
        account={selectedAccount}
        balance={balance}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        loading={isLoading}
      />
      
      {error && (
        <div className="global-error">
          <div className="error-content">
            <span className="error-text">{error}</span>
            <button onClick={clearError} className="error-close">×</button>
          </div>
        </div>
      )}
      
      <main className="app-main">
        {!isConnected ? (
          <ConnectionSection
            onConnect={handleConnect}
            error={error}
            loading={isLoading}
          />
        ) : (
          <div className="app-content">
            <AccountSelector
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelectAccount={handleAccountSwitch}
              balance={balance}
              loading={loading || isLoading}
            />
            
            {!isRegistered ? (
              <RegistrationSection
                onRegister={handleRegister}
                loading={loading}
              />
            ) : (
              <div className="content-grid">
                <div className="grid-column">
                  <BalancesSection
                    tokens={tokens}
                    balances={balances}
                    onRefresh={fetchBalances}
                    loading={loading}
                  />
                  
                  <DepositSection
                    onDeposit={handleDeposit}
                    loading={loading}
                  />
                  
                  <WithdrawSection
                    onWithdraw={handleWithdraw}
                    loading={loading}
                  />
                </div>
                
                <div className="grid-column">
                  <ExchangeSection
                    onExchange={handleExchange}
                    loading={loading}
                  />
                  
                  <SupportedTokensSection
                    tokens={supportedTokens}
                    onRefresh={fetchSupportedTokens}
                    loading={loading}
                  />
                  
                  <ExchangeHistorySection
                    history={exchangeHistory}
                    onRefresh={fetchExchangeHistory}
                    loading={loading}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Decentralized Exchange v1.0 | Ganache Local (Direct RPC)</p>
        {selectedAccount && (
          <p className="footer-account">
            Account: {selectedAccount} | Balance: {balance} ETH
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;
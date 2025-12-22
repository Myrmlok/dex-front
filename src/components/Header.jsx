import React from 'react';
import { Button } from './common/Button';

export const Header = ({ 
  isConnected, 
  account, 
  balance,
  onConnect, 
  onDisconnect,
  loading 
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Decentralized Exchange</h1>
          <p className="header-subtitle">Direct Ganache Connection</p>
        </div>
        
        <div className="header-right">
          {!isConnected ? (
            <Button
              onClick={onConnect}
              disabled={loading}
              variant="warning"
            >
              {loading ? 'Connecting...' : 'Connect to Ganache'}
            </Button>
          ) : (
            <div className="connected-info">
              <div className="account-info">
                <span className="account-label">Account:</span>
                <span className="account-address">{account}</span>
              </div>
              <div className="balance-info">
                <span className="balance-label">Balance:</span>
                <span className="balance-amount">{balance} ETH</span>
              </div>
              <Button
                onClick={onDisconnect}
                variant="secondary"
                className="disconnect-btn"
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
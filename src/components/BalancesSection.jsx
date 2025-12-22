import React from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

export const BalancesSection = ({ tokens, balances, onRefresh, loading }) => {
  return (
    <Card title="Your Balances">
      <div className="section-header">
        <h4>Token Balances</h4>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="secondary"
          className="refresh-btn"
        >
          Refresh
        </Button>
      </div>
      
      {tokens.length > 0 ? (
        <div className="balances-list">
          {tokens.map((token, index) => (
            <div key={index} className="balance-item">
              <div className="token-info">
                <span className="token-label">Token:</span>
                <span className="token-address">{token}</span>
              </div>
              <div className="balance-info">
                <span className="balance-label">Balance:</span>
                <span className="balance-amount">{balances[token] || '0'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No tokens found. Deposit some tokens to get started.</p>
      )}
    </Card>
  );
};
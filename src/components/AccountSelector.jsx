import React from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

export const AccountSelector = ({ 
  accounts, 
  selectedAccount, 
  onSelectAccount, 
  balance,
  loading 
}) => {
  return (
    <Card title={"Account:"+selectedAccount}>
      <div className="account-selector">
        <div className="balance-display">
          <span className="balance-label"></span>
          <span className="balance-amount">{balance} ETH</span>
        </div>
        
      </div>
    </Card>
  );
};
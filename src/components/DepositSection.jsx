import React, { useState } from 'react';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Loader } from './common/Loader';

export const DepositSection = ({ onDeposit, loading }) => {
  const [depositData, setDepositData] = useState({
    token: '',
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onDeposit(depositData.token, depositData.amount);
  };

  return (
    <Card title="Deposit Tokens">
      {loading ? (
        <Loader text="Processing deposit..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Token Address (0x...)"
            value={depositData.token}
            onChange={(e) => setDepositData({...depositData, token: e.target.value})}
            required
            disabled={loading}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={depositData.amount}
            onChange={(e) => setDepositData({...depositData, amount: e.target.value})}
            required
            min="0"
            step="0.000001"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
          >
            Deposit
          </Button>
        </form>
      )}
    </Card>
  );
};
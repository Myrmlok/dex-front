import React, { useState } from 'react';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Loader } from './common/Loader';

export const WithdrawSection = ({ onWithdraw, loading }) => {
  const [withdrawData, setWithdrawData] = useState({
    token: '',
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onWithdraw(withdrawData.token, withdrawData.amount);
  };

  return (
    <Card title="Withdraw Tokens">
      {loading ? (
        <Loader text="Processing withdrawal..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Token Address (0x...)"
            value={withdrawData.token}
            onChange={(e) => setWithdrawData({...withdrawData, token: e.target.value})}
            required
            disabled={loading}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={withdrawData.amount}
            onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
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
            Withdraw
          </Button>
        </form>
      )}
    </Card>
  );
};
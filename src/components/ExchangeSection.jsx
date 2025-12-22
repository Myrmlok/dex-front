import React, { useState } from 'react';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Loader } from './common/Loader';

export const ExchangeSection = ({ onExchange, loading }) => {
  const [exchangeData, setExchangeData] = useState({
    tokenIn: '',
    tokenOut: '',
    amountIn: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onExchange(exchangeData.tokenIn, exchangeData.tokenOut, exchangeData.amountIn);
  };

  return (
    <Card title="Exchange Tokens">
      {loading ? (
        <Loader text="Processing exchange..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Token In Address"
            value={exchangeData.tokenIn}
            onChange={(e) => setExchangeData({...exchangeData, tokenIn: e.target.value})}
            required
            disabled={loading}
          />
          <Input
            type="text"
            placeholder="Token Out Address"
            value={exchangeData.tokenOut}
            onChange={(e) => setExchangeData({...exchangeData, tokenOut: e.target.value})}
            required
            disabled={loading}
          />
          <Input
            type="number"
            placeholder="Amount In"
            value={exchangeData.amountIn}
            onChange={(e) => setExchangeData({...exchangeData, amountIn: e.target.value})}
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
            Exchange
          </Button>
        </form>
      )}
    </Card>
  );
};
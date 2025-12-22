import React, { useState } from 'react';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { Loader } from './common/Loader';

export const RegistrationSection = ({ onRegister, loading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(password);
  };

  return (
    <Card title="Register Account">
      <p className="info-text">
        You need to register before using the exchange. 
        Your password will be hashed locally before sending.
      </p>
      
      {loading ? (
        <Loader text="Registering..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !password.trim()}
            variant="primary"
          >
            Register
          </Button>
        </form>
      )}
    </Card>
  );
};
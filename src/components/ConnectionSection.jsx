import React from 'react';
import { Button } from './common/Button';
import { Card } from './common/Card';

export const ConnectionSection = ({ onConnect, error, loading }) => {
  return (
    <div className="connection-section">
      <Card>
        <h2>Connect to Ganache</h2>
        <div className="connection-info">
          <p className="info-text">
            This app connects directly to your local Ganache instance.
          </p>
          
          <div className="requirements">
            <h4>Requirements:</h4>
            <ul>
              <li>Ganache must be running on <code>http://127.0.0.1:8545</code></li>
              <li>Contract must be deployed to Ganache</li>
              <li>At least one account should be available</li>
            </ul>
          </div>
          
          <div className="connection-steps">
            <h4>Setup Steps:</h4>
            <ol>
              <li>Start Ganache: <code>ganache-cli --port 8545</code></li>
              <li>Deploy the contract to Ganache</li>
              <li>Click the Connect button below</li>
            </ol>
          </div>
        </div>
        
        <Button
          onClick={onConnect}
          disabled={loading}
          variant="warning"
          className="connect-btn"
        >
          {loading ? 'Connecting...' : 'Connect to Ganache'}
        </Button>
        
        {error && (
          <div className="error-message">
            <h4>Connection Error:</h4>
            <p>{error}</p>
            <p className="error-hint">
              Make sure Ganache is running and accessible at http://127.0.0.1:8545
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
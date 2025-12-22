import React from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

export const SupportedTokensSection = ({ tokens, onRefresh, loading }) => {
  return (
    <Card title="Supported Tokens">
      <div className="section-header">
        <h4>Available Tokens</h4>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="secondary"
          className="refresh-btn"
        >
          Load Tokens
        </Button>
      </div>
      
      {tokens.length > 0 ? (
        <div className="tokens-list">
          {tokens.map((token, index) => (
            <div key={index} className="token-item">
              <div className="token-info">
                <span className="token-index">{index + 1}.</span>
                <span className="token-address">{token}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No supported tokens loaded. Click the button above.</p>
      )}
    </Card>
  );
};
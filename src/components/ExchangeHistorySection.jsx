import React from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

export const ExchangeHistorySection = ({ history, onRefresh, loading }) => {
  return (
    <Card title="Exchange History">
      <div className="section-header">
        <h4>Recent Exchanges</h4>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="secondary"
          className="refresh-btn"
        >
          Load History
        </Button>
      </div>
      
      {history.length > 0 ? (
        <div className="history-list">
          {history.map((record, index) => (
            <div key={index} className="history-item">
              <div className="history-header">
                <span className="history-index">#{index + 1}</span>
                <span className="history-time">{record.timestamp}</span>
              </div>
              <div className="history-details">
                <div className="history-direction">
                  <span className="from-amount">{record.amountIn}</span>
                  <span className="from-token">{record.tokenIn}</span>
                  <span className="arrow">→</span>
                  <span className="to-amount">{record.amountOut}</span>
                  <span className="to-token">{record.tokenOut}</span>
                </div>
                <div className="history-rate">
                  <span>Rate:</span>
                  <span className="rate-value">{record.exchangeRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No exchange history yet.</p>
      )}
    </Card>
  );
};
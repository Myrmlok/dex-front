import React from 'react';
import './common.css';

export const Loader = ({ text = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loader loader-${size}`}>
      <div className="spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};
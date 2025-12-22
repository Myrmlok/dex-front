import React from 'react';
import './common.css';

export const Card = ({ children, className = '', title }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
};
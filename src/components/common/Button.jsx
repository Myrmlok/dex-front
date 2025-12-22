import React from 'react';
import './common.css';

export const Button = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant} ${className}`}
    >
      {children}
    </button>
  );
};
import React from 'react';
import './common.css';

export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  min,
  step,
  className = ''
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      min={min}
      step={step}
      className={`input ${className}`}
    />
  );
};
import CryptoJS from 'crypto-js';

export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

export const bytes32ToHex = (bytes32) => {
  return '0x' + bytes32;
};
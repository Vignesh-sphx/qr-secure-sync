
/**
 * Storage utilities for local transaction handling
 */
import { Transaction, StoredTransaction } from '../types';
import { encryptData, decryptData } from './crypto';

const STORAGE_KEY = 'qr_secure_sync_transactions';
const SECRET_KEY = 'demo_secret_key'; // In a real app, this would be securely generated/stored

// Save a transaction to local storage
export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  
  // Encrypt transaction data for secure storage
  const encryptedData = encryptData(transaction, SECRET_KEY);
  
  const storedTransaction: StoredTransaction = {
    ...transaction,
    encryptedData
  };
  
  transactions.push(storedTransaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

// Get all transactions from local storage
export const getTransactions = (): StoredTransaction[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    return [];
  }
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Failed to parse stored transactions', error);
    return [];
  }
};

// Get a specific transaction by ID
export const getTransactionById = (id: string): Transaction | null => {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return null;
  }
  
  // Decrypt the transaction data
  try {
    return decryptData(transaction.encryptedData, SECRET_KEY);
  } catch (error) {
    console.error(`Failed to decrypt transaction ${id}`, error);
    return null;
  }
};

// Update a transaction's status
export const updateTransactionStatus = (id: string, status: Transaction['status']): boolean => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index === -1) {
    return false;
  }
  
  // Get the decrypted transaction
  const transaction = decryptData(transactions[index].encryptedData, SECRET_KEY);
  
  // Update the status
  transaction.status = status;
  
  // Re-encrypt the updated transaction
  transactions[index].status = status;
  transactions[index].encryptedData = encryptData(transaction, SECRET_KEY);
  
  // Save back to storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  
  return true;
};

// Clear all transactions (for testing)
export const clearTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

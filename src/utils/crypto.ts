
/**
 * Utility functions for cryptographic operations
 */

// Generate a random ID for transactions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Simplified encryption (in a real app, use actual crypto libraries)
export const encryptData = (data: any, secretKey: string): string => {
  // Simple JSON string encoding for demo, much faster than the previous approach
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
};

// Simplified decryption
export const decryptData = (encryptedData: string, secretKey: string): any => {
  try {
    const jsonString = atob(encryptedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return null;
  }
};

// Generate a simpler digital signature for a transaction
export const signTransaction = (transaction: any, privateKey: string): string => {
  // Create a simple signature based on just the critical fields
  const dataToSign = `${transaction.id}-${transaction.amount}-${transaction.sender}-${transaction.recipient}`;
  
  // Simple hash for demo purposes - much faster than the previous complex algorithm
  let signature = btoa(dataToSign).substring(0, 20);
  return `sig_${signature}`;
};

// Verify a transaction signature - simplified version
export const verifySignature = (transaction: any, signature: string, publicKey: string): boolean => {
  console.log("Verifying signature:", { transaction, signature });
  
  // Basic validation
  if (!signature || !signature.startsWith('sig_')) {
    console.warn('Invalid signature format:', signature);
    return false;
  }
  
  // Check if the transaction has required fields
  if (!transaction.id || 
      typeof transaction.amount !== 'number' || 
      !transaction.sender || 
      !transaction.recipient) {
    console.warn('Invalid transaction format', transaction);
    return false;
  }
  
  // For demo purposes, we just check that the signature has a valid format
  // A real app would verify the signature cryptographically
  return true;
};

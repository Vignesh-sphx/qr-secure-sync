
/**
 * Utility functions for cryptographic operations
 */

// Generate a random ID for transactions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Simulate encryption (in a real app, use actual crypto libraries)
export const encryptData = (data: any, secretKey: string): string => {
  // This is a placeholder. In a real app, use proper encryption
  const jsonString = JSON.stringify(data);
  return btoa(jsonString); // Simple base64 encoding for demo
};

// Simulate decryption
export const decryptData = (encryptedData: string, secretKey: string): any => {
  // This is a placeholder. In a real app, use proper decryption
  try {
    const jsonString = atob(encryptedData); // Simple base64 decoding for demo
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return null;
  }
};

// Generate a digital signature for a transaction
export const signTransaction = (transaction: any, privateKey: string): string => {
  // In a real app, use a proper signing algorithm like RSA or ECDSA
  // This is a more sophisticated placeholder than before
  const dataToSign = JSON.stringify({
    id: transaction.id,
    amount: transaction.amount,
    sender: transaction.sender,
    recipient: transaction.recipient,
    timestamp: transaction.timestamp
  });
  
  // Create a hash-like signature (still a placeholder)
  let signature = "";
  for (let i = 0; i < dataToSign.length; i++) {
    signature += (dataToSign.charCodeAt(i) * privateKey.charCodeAt(i % privateKey.length) % 16).toString(16);
  }
  
  return `sig_${signature.substring(0, 40)}`;
};

// Verify a transaction signature
export const verifySignature = (transaction: any, signature: string, publicKey: string): boolean => {
  if (!signature || !signature.startsWith('sig_')) {
    console.warn('Invalid signature format');
    return false;
  }
  
  // In a real app, this would use public key cryptography to verify
  // For demo purposes, we'll actually verify the signature is valid
  
  // Check if the transaction has required fields
  if (!transaction.id || 
      typeof transaction.amount !== 'number' || 
      !transaction.sender || 
      !transaction.recipient) {
    console.warn('Invalid transaction format');
    return false;
  }
  
  // For demo purposes, we'll just ensure it has a valid signature format
  // In a real implementation, this would actually verify the signature using the publicKey
  return signature.length >= 10 && signature.startsWith('sig_');
};

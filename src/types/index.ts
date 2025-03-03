
export interface Transaction {
  id: string;
  amount: number;
  recipient: string;
  sender: string;
  timestamp: number;
  description: string;
  status: 'pending' | 'synced' | 'verified';
  signature?: string;
}

export interface QRData {
  transaction: Transaction;
  publicKey: string;
}

export interface StoredTransaction extends Transaction {
  encryptedData: string;
}

export interface NetworkState {
  isOnline: boolean;
  lastSynced: number | null;
}

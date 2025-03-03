
import React from 'react';
import { motion } from 'framer-motion';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/layout/Header';

const Scan = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
          <p className="text-muted-foreground">
            Scan a QR code to securely receive a transaction
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <QRScanner />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 max-w-2xl mx-auto text-center"
        >
          <h3 className="text-lg font-medium mb-4">About QR Code Scanning</h3>
          <p className="text-muted-foreground text-sm mb-4">
            When you scan a QR code, the transaction data is verified using the sender's digital 
            signature. This ensures that the transaction hasn't been tampered with and comes from 
            a legitimate source.
          </p>
          <p className="text-muted-foreground text-sm">
            The transaction is securely stored locally and will be synchronized with 
            the blockchain when your device is online, preventing double-spending.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Scan;

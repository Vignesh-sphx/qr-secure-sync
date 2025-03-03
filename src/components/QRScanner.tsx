import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrReader } from 'react-qr-reader';
import { QRData, Transaction } from '../types';
import { saveTransaction } from '../utils/storage';
import { syncTransactionToBlockchain } from '../utils/blockchain';
import { verifySignature } from '../utils/crypto';
import { getNetworkState } from '../utils/network';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { Loader2, Check, AlertCircle, Camera, QrCode } from 'lucide-react';

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'verifying' | 'storing' | 'syncing' | 'complete' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { updateCredits } = useCredits();
  
  const handleScan = (data: string | null) => {
    if (data) {
      try {
        // Parse the QR code data
        const parsedData: QRData = JSON.parse(data);
        setScannedData(parsedData);
        setScanning(false);
      } catch (error) {
        console.error('Error parsing QR code data:', error);
        setErrorMessage('Invalid QR code format. Please try again.');
        setProcessingStatus('error');
        setScanning(false);
      }
    }
  };
  
  const handleError = (err: Error) => {
    console.error('QR Scanner error:', err);
    setErrorMessage('Failed to access camera. Please check your permissions and try again.');
    setProcessingStatus('error');
    setCameraPermission(false);
    setScanning(false);
    
    toast({
      title: "Camera Error",
      description: "Failed to access your camera. Please check your camera permissions.",
      variant: "destructive"
    });
  };
  
  const startScanning = async () => {
    setScanning(true);
    setProcessingStatus('idle');
    setErrorMessage(null);
    
    try {
      // Check if browser supports getUserMedia
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Clean up stream when done
        stream.getTracks().forEach(track => track.stop());
        setCameraPermission(true);
      } else {
        throw new Error('Camera not supported on this device or browser');
      }
    } catch (err) {
      handleError(err as Error);
    }
  };
  
  const handleUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, this would process the image and scan for QR codes
    // For this demo, we'll use a fallback simulation if file upload is used
    simulateScan();
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  // Kept as a fallback for testing when camera is not available
  const simulateScan = () => {
    setScanning(true);
    
    // Simulate a delay for scanning
    setTimeout(() => {
      // Create a fake transaction for demo purposes
      const fakeTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 15),
        amount: Math.random() * 100,
        recipient: "wallet_" + Math.random().toString(36).substring(2, 10),
        sender: "wallet_" + Math.random().toString(36).substring(2, 10),
        timestamp: Date.now(),
        description: "Demo transaction",
        status: 'pending',
        signature: "sig_" + Math.random().toString(36).substring(2, 15)
      };
      
      const fakeQRData: QRData = {
        transaction: fakeTransaction,
        publicKey: "pk_" + Math.random().toString(36).substring(2, 15)
      };
      
      setScannedData(fakeQRData);
      setScanning(false);
    }, 2000);
  };
  
  const processTransaction = async () => {
    if (!scannedData) return;
    
    try {
      // Verify the signature
      setProcessingStatus('verifying');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      const isValid = verifySignature(
        scannedData.transaction, 
        scannedData.transaction.signature || '', 
        scannedData.publicKey
      );
      
      if (!isValid) {
        setProcessingStatus('error');
        setErrorMessage('Invalid signature. Transaction may be tampered with.');
        return;
      }
      
      // Store locally
      setProcessingStatus('storing');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      saveTransaction(scannedData.transaction);
      
      // Update user's credits based on the transaction
      updateCredits(scannedData.transaction);
      
      // Check if online and sync to blockchain
      const { isOnline } = getNetworkState();
      if (isOnline) {
        setProcessingStatus('syncing');
        await syncTransactionToBlockchain(scannedData.transaction);
      }
      
      setProcessingStatus('complete');
      toast({
        title: "Transaction Processed",
        description: `${scannedData.transaction.amount.toFixed(2)} credits received. ${isOnline 
          ? "Transaction has been verified and synced." 
          : "Transaction will sync when online."}`,
      });
      
    } catch (error) {
      console.error('Error processing transaction:', error);
      setProcessingStatus('error');
      setErrorMessage('An error occurred while processing the transaction.');
      
      toast({
        title: "Error",
        description: "Failed to process the transaction. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetScanner = () => {
    setScannedData(null);
    setProcessingStatus('idle');
    setErrorMessage(null);
  };
  
  useEffect(() => {
    if (scannedData && processingStatus === 'idle') {
      processTransaction();
    }
  }, [scannedData]);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!scannedData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-border/50">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="w-full max-w-xs aspect-square bg-muted/30 rounded-lg mb-6 relative overflow-hidden">
                {scanning ? (
                  <div className="absolute inset-0">
                    <QrReader
                      constraints={{
                        facingMode: 'environment'
                      }}
                      onResult={(result, error) => {
                        if (result) {
                          handleScan(result.getText());
                        }
                        if (error && error?.name !== 'NotFoundException') {
                          console.error('QR scan error:', error);
                        }
                      }}
                      containerStyle={{ width: '100%', height: '100%' }}
                      videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      scanDelay={500}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary/70 rounded-lg"></div>
                    </div>
                  </div>
                ) : cameraPermission === false ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                    <p className="text-center text-sm px-4">Camera access denied. Please check your browser settings.</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground opacity-20" />
                  </div>
                )}
                
                {/* Scan effect */}
                {scanning && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                      ease: "linear"
                    }}
                    className="absolute left-0 right-0 h-0.5 bg-primary z-10"
                  />
                )}
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-1">Scan a QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Scan a QR code to receive a secure transaction
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                onClick={startScanning}
                className="w-full"
                disabled={scanning}
                variant="default"
              >
                <Camera className="mr-2 h-4 w-4" />
                {scanning ? 'Scanning...' : 'Scan QR Code'}
              </Button>
              
              <Button
                onClick={handleUpload}
                className="w-full"
                disabled={scanning}
                variant="outline"
              >
                Upload Image
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white shadow-lg border-border/50">
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center">
                {processingStatus === 'error' ? (
                  <div className="rounded-full bg-red-100 p-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                ) : processingStatus === 'complete' ? (
                  <div className="rounded-full bg-green-100 p-3 mb-4">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                ) : (
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                )}
                
                <h3 className="text-lg font-medium mb-1">
                  {processingStatus === 'error' ? 'Processing Failed' :
                   processingStatus === 'complete' ? 'Transaction Processed' :
                   'Processing Transaction...'}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {processingStatus === 'error' ? errorMessage :
                   processingStatus === 'verifying' ? 'Verifying transaction signature...' :
                   processingStatus === 'storing' ? 'Storing transaction securely...' :
                   processingStatus === 'syncing' ? 'Syncing to blockchain...' :
                   processingStatus === 'complete' ? 'Transaction has been processed successfully' :
                   'Please wait while we process the transaction'}
                </p>
                
                <div className="w-full bg-muted/30 rounded-md p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-sm font-medium">
                      {scannedData.transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">From:</span>
                    <span className="text-sm font-mono">
                      {scannedData.transaction.sender.substring(0, 6)}...
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">To:</span>
                    <span className="text-sm font-mono">
                      {scannedData.transaction.recipient.substring(0, 6)}...
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={resetScanner} 
                className="w-full"
                variant={processingStatus === 'complete' || processingStatus === 'error' ? 'default' : 'outline'}
                disabled={!['complete', 'error'].includes(processingStatus)}
              >
                {processingStatus === 'complete' || processingStatus === 'error' ? 'Scan Another' : 'Processing...'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default QRScanner;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Transaction, QRData } from '../types';
import { generateId, signTransaction } from '../utils/crypto';
import { saveTransaction } from '../utils/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter } from './ui/card';
import { toast } from './ui/use-toast';

const QRGenerator: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const handleGenerate = () => {
    if (!amount || !recipient) {
      toast({
        title: "Missing information",
        description: "Please enter an amount and recipient.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate amount is a number
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Create a fake sender (in a real app, this would be the user's wallet)
    const sender = "wallet_" + Math.random().toString(36).substring(2, 10);
    const publicKey = "pk_" + Math.random().toString(36).substring(2, 15);
    
    // Create a transaction object
    const transaction: Transaction = {
      id: generateId(),
      amount: amountValue,
      recipient,
      sender,
      timestamp: Date.now(),
      description,
      status: 'pending'
    };
    
    // In a real app, we would use the user's private key
    const fakePrivateKey = "sk_" + Math.random().toString(36).substring(2, 15);
    
    // Sign the transaction
    const signature = signTransaction(transaction, fakePrivateKey);
    transaction.signature = signature;
    
    // Create the QR data
    const newQrData: QRData = {
      transaction,
      publicKey
    };
    
    // Save to local storage
    saveTransaction(transaction);
    
    // Set the QR data
    setTimeout(() => {
      setQrData(newQrData);
      setIsGenerating(false);
      
      toast({
        title: "QR Code Generated",
        description: "Transaction has been saved and is ready to share.",
      });
    }, 1000);
  };
  
  const handleReset = () => {
    setQrData(null);
    setAmount('');
    setRecipient('');
    setDescription('');
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {!qrData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-border/50">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    className="border-border/60 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    placeholder="Recipient address or name"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="border-border/60 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this transaction for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none border-border/60 focus:border-primary"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-6"
        >
          <Card className="bg-white shadow-lg p-6 w-full">
            <CardContent className="flex flex-col items-center pt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Transaction ID: {qrData.transaction.id.substring(0, 8)}...
              </div>
              
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QRCodeSVG 
                  value={JSON.stringify(qrData)} 
                  size={200}
                  level="H"
                  includeMargin
                  className="mx-auto"
                />
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-lg font-medium">
                  {qrData.transaction.amount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  To: {qrData.transaction.recipient}
                </div>
                {qrData.transaction.description && (
                  <div className="mt-2 text-sm">
                    {qrData.transaction.description}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleReset} className="w-full">
                Generate Another
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-xs text-muted-foreground text-center max-w-xs">
            This QR code contains a signed transaction. The recipient can scan it to receive the transaction details securely.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QRGenerator;

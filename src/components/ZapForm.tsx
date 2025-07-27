import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Zap, Copy, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import QRCode from 'qrcode';
import { bech32 } from 'bech32';

interface WebLNProvider {
  enable: () => Promise<void>;
  sendPayment: (invoice: string) => Promise<{ preimage: string }>;
}

declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}

interface ZapFormProps {
  zapAddress: string;
  recipientName?: string;
  trigger?: React.ReactNode;
}

export function ZapForm({ 
  zapAddress, 
  recipientName = 'Project', 
  trigger 
}: ZapFormProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentRequested, setPaymentRequested] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const { toast } = useToast();

  // Compact suggested amounts in sats
  const suggestedAmounts = [1000, 5000, 21000, 100000];

  // Reset form when dialog closes
  const resetForm = useCallback(() => {
    setAmount('');
    setMessage('');
    setInvoice('');
    setQrCodeUrl('');
    setPaymentRequested(false);
    setPaymentCompleted(false);
    setIsGeneratingInvoice(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Auto-close after payment completion
  useEffect(() => {
    if (paymentCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentCompleted]);

  const handleAmountSelect = (sats: number) => {
    setAmount(sats.toString());
  };

  const handleCopyInvoice = async () => {
    if (invoice) {
      try {
        await navigator.clipboard.writeText(invoice);
        toast({
          title: "Copied!",
          description: "Invoice copied to clipboard",
        });
      } catch {
        toast({
          title: "Copy Failed", 
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
      }
    }
  };

  const decodeLnurl = (lnurl: string): string => {
    try {
      const { words } = bech32.decode(lnurl, 2000);
      const data = bech32.fromWords(words);
      return new TextDecoder().decode(new Uint8Array(data));
    } catch {
      throw new Error('Invalid LNURL format');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingInvoice(true);
    
    try {
      let lnurlEndpoint: string;
      
      if (zapAddress.toLowerCase().startsWith('lnurl1')) {
        lnurlEndpoint = decodeLnurl(zapAddress);
      } else {
        const [username, domain] = zapAddress.split('@');
        if (!username || !domain) {
          throw new Error('Invalid Lightning Address format');
        }
        lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`;
      }

      const lnurlResponse = await fetch(lnurlEndpoint);
      if (!lnurlResponse.ok) {
        throw new Error('Failed to fetch Lightning Address info');
      }

      const lnurlData = await lnurlResponse.json();
      
      const amountMsat = parseInt(amount) * 1000;
      if (amountMsat < lnurlData.minSendable || amountMsat > lnurlData.maxSendable) {
        throw new Error(`Amount must be between ${lnurlData.minSendable / 1000} and ${lnurlData.maxSendable / 1000} sats`);
      }

      const invoiceUrl = new URL(lnurlData.callback);
      invoiceUrl.searchParams.set('amount', amountMsat.toString());
      if (message) {
        invoiceUrl.searchParams.set('comment', message);
      }

      const invoiceResponse = await fetch(invoiceUrl.toString());
      if (!invoiceResponse.ok) {
        throw new Error('Failed to generate Lightning invoice');
      }

      const invoiceData = await invoiceResponse.json();
      
      if (invoiceData.status === 'ERROR') {
        throw new Error(invoiceData.reason || 'Invoice generation failed');
      }

      if (!invoiceData.pr) {
        throw new Error('No payment request received');
      }

      setInvoice(invoiceData.pr);
      setPaymentRequested(true);
      
      // Generate compact QR code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(invoiceData.pr.toUpperCase(), {
          width: 180,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
      }
      
      toast({
        title: "Invoice Ready!",
        description: `${amount} sats zap generated`,
      });
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate invoice",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleOpenInWallet = async () => {
    if (!invoice) return;

    try {
      // Try WebLN first
      if (typeof window !== 'undefined' && window.webln) {
        try {
          await window.webln.enable();
          const response = await window.webln.sendPayment(invoice);
          
          // If we get here, payment was successful
          if (response && response.preimage) {
            setPaymentCompleted(true);
            toast({
              title: "Zap Sent! ⚡",
              description: "Payment completed successfully",
            });
            return;
          }
        } catch (weblnError) {
          console.log('WebLN failed or cancelled:', weblnError);
          
          // Check if it was a user cancellation vs actual error
          if (weblnError instanceof Error && weblnError.message.includes('User rejected')) {
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user",
              variant: "destructive"
            });
            return;
          }
        }
      }

      // Fallback to Lightning URL
      const lightningUrl = `lightning:${invoice}`;
      window.open(lightningUrl, '_blank');
      
      // Show manual confirmation option
      toast({
        title: "Wallet Opened",
        description: "Complete payment, then click 'I completed the payment'",
      });
      
    } catch (error) {
      console.error('Failed to open wallet:', error);
      toast({
        title: "Wallet Error",
        description: "Please copy invoice manually",
        variant: "destructive"
      });
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-sm p-4" showCloseButton={false}>
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="truncate">Zap {recipientName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {paymentCompleted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div className="font-medium text-green-600">Zap Sent! ⚡</div>
            <div className="text-sm text-muted-foreground">Closing automatically...</div>
          </div>
        ) : !paymentRequested ? (
          <>
            {/* Amount Selection - Compact */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount (sats)</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {suggestedAmounts.map((sats) => (
                  <Button
                    key={sats}
                    variant={amount === sats.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAmountSelect(sats)}
                    className="text-xs h-8"
                  >
                    {sats.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="text-sm h-8"
              />
            </div>

            {/* Message - Compact */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message</Label>
              <Input
                placeholder="Great work! ⚡"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
                className="text-sm h-8"
              />
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice || !amount}
              size="sm"
              className="w-full h-9"
            >
              {isGeneratingInvoice ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Zap
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Payment Invoice - Compact */}
            <div className="space-y-3">
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {parseInt(amount).toLocaleString()} sats ⚡
                </Badge>
              </div>

              {/* Compact QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center p-2 bg-white rounded border">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-32 h-32"
                  />
                </div>
              )}
              
              {/* Action Buttons - Compact */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInvoice}
                    className="text-xs h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleOpenInWallet}
                    className="text-xs h-8"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Pay
                  </Button>
                </div>
                
                {/* Manual confirmation button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPaymentCompleted(true);
                    toast({
                      title: "Payment Confirmed",
                      description: "Thank you for your zap! ⚡",
                    });
                  }}
                  className="w-full text-xs h-7 text-muted-foreground"
                >
                  ✓ I completed the payment
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Scan QR or click Pay to open wallet
              </div>
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return dialogContent;
}

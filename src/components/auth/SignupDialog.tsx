// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import React, { useState } from 'react';
import { Download, Key, Shield, CheckCircle, Copy, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { toast } from '@/hooks/useToast.ts';
import { useLoginActions } from '@/hooks/useLoginActions';
import { generateSecretKey, nip19 } from 'nostr-tools';

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'welcome' | 'generate' | 'download' | 'verify' | 'done'>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [nsec, setNsec] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const login = useLoginActions();

  // Generate a proper nsec key using nostr-tools
  const generateKey = () => {
    setIsLoading(true);
    
    try {
      // Generate a new secret key
      const sk = generateSecretKey();
      
      // Convert to nsec format
      setNsec(nip19.nsecEncode(sk));
      setStep('download');
    } catch (error) {
      console.error('Failed to generate key:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(nsec);
      setHasCopied(true);
      toast({
        title: 'Copied!',
        description: 'Private key copied to clipboard',
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please copy the key manually',
        variant: 'destructive',
      });
    }
  };

  const downloadKey = () => {
    // Create a blob with the key text
    const blob = new Blob([nsec], { type: 'text/plain' });
    const url = globalThis.URL.createObjectURL(blob);

    // Create a temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nostr-private-key.txt';
    document.body.appendChild(a);
    a.click();

    // Clean up
    globalThis.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setHasDownloaded(true);
    toast({
      title: 'Key Downloaded',
      description: 'Your private key has been saved safely',
    });
  };

  const finishSignup = () => {
    login.nsec(nsec);
    setStep('done');
    
    setTimeout(() => {
      onClose();
      toast({
        title: 'Welcome to Angor Hub!',
        description: 'Your account has been created successfully',
      });
    }, 1500);
  };

  const resetDialog = () => {
    setStep('welcome');
    setNsec('');
    setShowKey(false);
    setHasDownloaded(false);
    setHasCopied(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetDialog();
        onClose();
      }
    }}>
      <DialogContent className='w-[95vw] max-w-sm mx-auto p-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background max-h-[95vh] overflow-y-auto'>
        {/* Header */}
        <DialogHeader className='px-4 pt-4 pb-2 relative'>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
            {step === 'welcome' && <Shield className="w-4 h-4 text-primary-foreground" />}
            {step === 'generate' && <Key className="w-4 h-4 text-primary-foreground" />}
            {step === 'download' && <Download className="w-4 h-4 text-primary-foreground" />}
            {step === 'verify' && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
            {step === 'done' && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
          </div>
          <DialogTitle className='text-base font-bold text-center text-primary'>
            {step === 'welcome' && 'Create Your Identity'}
            {step === 'generate' && 'Generating Your Key'}
            {step === 'download' && 'Secure Your Key'}
            {step === 'verify' && 'Almost Ready'}
            {step === 'done' && 'Account Created!'}
          </DialogTitle>
          <DialogDescription className='text-center text-muted-foreground mt-1 text-xs leading-relaxed'>
            {step === 'welcome' && 'Create a decentralized identity with your own private key'}
            {step === 'generate' && 'We\'re creating your unique cryptographic identity'}
            {step === 'download' && 'Your key is your password - keep it safe and private'}
            {step === 'verify' && 'Confirm you\'ve secured your private key'}
            {step === 'done' && 'Welcome to the decentralized future!'}
          </DialogDescription>
        </DialogHeader>

        <div className='px-4 py-3 space-y-4'>
          
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className='text-center space-y-4'>
              <div className='space-y-3 p-4 rounded-lg bg-secondary/30 border border-border'>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto">
                      <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xs text-muted-foreground">Your Keys</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-xs text-muted-foreground">Your Data</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-xs text-muted-foreground">Your Choice</div>
                  </div>
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed px-2'>
                  Unlike traditional accounts, you'll own your identity completely. No company can lock you out or control your data.
                </p>
              </div>

              <Button
                className='w-full rounded-lg py-3 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm'
                onClick={() => setStep('generate')}
              >
                Create My Identity
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Generate Step */}
          {step === 'generate' && (
            <div className='text-center space-y-4'>
              <div className='p-6 rounded-lg bg-secondary/50 border border-border'>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Key className='w-6 h-6 text-primary-foreground' />
                </div>
                <h3 className="font-semibold text-sm mb-2 text-foreground">Generate Cryptographic Key</h3>
                <p className='text-xs text-muted-foreground leading-relaxed mb-4'>
                  We'll create a unique private key that serves as your digital identity and password.
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span>256-bit cryptographic security</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span>Generated locally on your device</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span>Never stored on our servers</span>
                  </div>
                </div>
              </div>

              <Button
                className='w-full rounded-lg py-3 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm'
                onClick={generateKey}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate My Key'
                )}
              </Button>
            </div>
          )}

          {/* Download Step */}
          {step === 'download' && (
            <div className='space-y-4'>
              <div className='space-y-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'>
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold text-sm">Your Private Key</span>
                </div>
                <p className='text-xs text-amber-700 dark:text-amber-300 leading-relaxed'>
                  This is your only way to access your account. Treat it like a password and keep it secure.
                </p>
              </div>

              <div className='space-y-3'>
                <div className='relative p-3 rounded-lg border bg-secondary/50 overflow-hidden'>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Private Key (nsec)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                      className="h-6 px-2 text-xs"
                    >
                      {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                  <code className='text-xs break-all font-mono leading-relaxed'>
                    {showKey ? nsec : '•'.repeat(nsec.length)}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant='outline'
                    size="sm"
                    className='h-9 text-xs'
                    onClick={copyToClipboard}
                    disabled={hasCopied}
                  >
                    <Copy className='w-3 h-3 mr-1' />
                    {hasCopied ? 'Copied!' : 'Copy'}
                  </Button>

                  <Button
                    variant='outline'
                    size="sm"
                    className='h-9 text-xs'
                    onClick={downloadKey}
                  >
                    <Download className='w-3 h-3 mr-1' />
                    Download
                  </Button>
                </div>
              </div>

              <div className='space-y-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
                <h4 className='font-semibold text-xs text-red-800 dark:text-red-200'>Security Checklist:</h4>
                <div className='space-y-1 text-xs text-red-700 dark:text-red-300'>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full" />
                    <span>Save this key in a secure location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full" />
                    <span>Never share it with anyone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full" />
                    <span>If lost, your account cannot be recovered</span>
                  </div>
                </div>
              </div>

              <Button
                className='w-full rounded-lg py-3 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm'
                onClick={() => setStep('verify')}
                disabled={!hasDownloaded && !hasCopied}
              >
                I've Secured My Key
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <div className='space-y-4'>
              <div className='text-center space-y-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'>
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className='w-5 h-5 text-white' />
                </div>
                <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">Ready to Continue</h3>
                <p className='text-xs text-green-700 dark:text-green-300 leading-relaxed px-2'>
                  Your private key has been generated and secured. You're ready to start using Angor Hub!
                </p>
              </div>

              <div className='space-y-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
                <h4 className='font-semibold text-xs text-blue-800 dark:text-blue-200'>Remember:</h4>
                <div className='space-y-1 text-xs text-blue-700 dark:text-blue-300'>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span>Use your private key to log in next time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span>Keep multiple secure backups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span>Your identity works across all Nostr apps</span>
                  </div>
                </div>
              </div>

              <Button
                className='w-full rounded-lg py-3 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm'
                onClick={finishSignup}
              >
                Complete Account Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <div className='flex flex-col items-center justify-center py-6 space-y-4'>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-sm">Setting up your account...</h3>
                <p className="text-xs text-muted-foreground">You'll be redirected momentarily</p>
              </div>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className='px-4 pb-4 pt-2 border-t border-border'>
          <p className='text-xs text-muted-foreground text-center leading-relaxed'>
            By creating an account, you join the decentralized web where you own your data and identity.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;

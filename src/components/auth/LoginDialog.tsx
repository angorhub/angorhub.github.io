// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import React, { useRef, useState } from 'react';
import { Shield, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useLoginActions } from '@/hooks/useLoginActions';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup?: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nsec, setNsec] = useState('');
  const [bunkerUri, setBunkerUri] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const login = useLoginActions();

  const handleExtensionLogin = () => {
    setIsLoading(true);
    try {
      if (!('nostr' in window)) {
        throw new Error('Nostr extension not found. Please install a NIP-07 extension.');
      }
      login.extension();
      onLogin();
      onClose();
    } catch (error) {
      console.error('Extension login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyLogin = () => {
    if (!nsec.trim()) return;
    setIsLoading(true);
    
    try {
      login.nsec(nsec);
      onLogin();
      onClose();
    } catch (error) {
      console.error('Nsec login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBunkerLogin = () => {
    if (!bunkerUri.trim() || !bunkerUri.startsWith('bunker://')) return;
    setIsLoading(true);
    
    try {
      login.bunker(bunkerUri);
      onLogin();
      onClose();
    } catch (error) {
      console.error('Bunker login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNsec(content.trim());
    };
    reader.readAsText(file);
  };

  const handleSignupClick = () => {
    if (onSignup) {
      onSignup();
    }
    onClose();
  };
  return (    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] max-w-sm mx-auto p-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='px-3 sm:px-4 pt-3 sm:pt-4 pb-2 relative'>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <DialogTitle className='text-base sm:text-lg font-bold text-center text-primary'>
            Welcome to Angor Hub
          </DialogTitle>
          <DialogDescription className='text-center text-muted-foreground mt-1 text-xs'>
            Connect with your Nostr identity
          </DialogDescription>
        </DialogHeader>

        <div className='px-3 sm:px-4 py-2 sm:py-3 space-y-3'>          <Tabs defaultValue={'nostr' in window ? 'extension' : 'key'} className='w-full'>
            <TabsList className='grid w-full grid-cols-3 mb-2 sm:mb-3 bg-muted p-0.5 rounded-lg h-7 sm:h-8'>
              <TabsTrigger 
                value='extension' 
                className='rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 px-1'
              >
                Extension
              </TabsTrigger>
              <TabsTrigger 
                value='key' 
                className='rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 px-1'
              >
                Private Key
              </TabsTrigger>
              <TabsTrigger 
                value='bunker' 
                className='rounded-md text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-200 px-1'
              >
                Bunker
              </TabsTrigger>
            </TabsList>            <TabsContent value='extension' className='space-y-2 sm:space-y-3'>
              <div className='text-center p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border'>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Shield className='w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground' />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm mb-1 text-foreground">Browser Extension</h3>
                <p className='text-xs text-muted-foreground mb-2 sm:mb-3 leading-relaxed'>
                  Secure one-click authentication using your Nostr browser extension.
                </p>
                <Button
                  className='w-full rounded-lg py-2 h-8 sm:h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-xs sm:text-sm'
                  onClick={handleExtensionLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs">Connecting...</span>
                    </div>
                  ) : (
                    'Connect with Extension'
                  )}
                </Button>
                {!('nostr' in window) && (
                  <p className='text-xs text-amber-600 dark:text-amber-400 mt-2'>
                    No extension detected. Please install a Nostr extension like nos2x or Alby.
                  </p>
                )}
              </div>
            </TabsContent>            
            <TabsContent value='key' className='space-y-3 sm:space-y-4 mt-3 sm:mt-4'>
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border'>
                <div className="text-center mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Shield className='w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground' />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">Private Key Login</h3>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Enter your nsec private key to securely access your account
                  </p>
                </div>

                <div className='space-y-2 sm:space-y-3'>
                  <div className='space-y-1'>
                    <label htmlFor='nsec' className='text-xs font-medium text-foreground'>
                      Nostr Private Key (nsec)
                    </label>
                    <Input
                      id='nsec'
                      type="password"
                      value={nsec}
                      onChange={(e) => setNsec(e.target.value)}
                      className='rounded-lg focus-visible:ring-primary focus-visible:border-primary h-8 sm:h-9 text-xs sm:text-sm'
                      placeholder='nsec1...'
                    />
                  </div>

                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <span className='w-full border-t border-border' />
                    </div>
                    <div className='relative flex justify-center text-xs uppercase'>
                      <span className='bg-background px-2 text-muted-foreground'>Or</span>
                    </div>
                  </div>

                  <div className='text-center'>
                    <input
                      type='file'
                      accept='.txt,.json'
                      className='hidden'
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      placeholder="Upload your nsec key file"
                      title="Upload your nsec key file"
                    />
                    <Button
                      variant='outline'
                      className='w-full rounded-lg border-2 border-dashed h-8 sm:h-9 transition-all duration-200 text-xs sm:text-sm'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className='w-3 h-3 mr-2' />
                      Upload Key File
                    </Button>
                  </div>

                  <Button
                    className='w-full rounded-lg py-2 h-8 sm:h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-xs sm:text-sm'
                    onClick={handleKeyLogin}
                    disabled={isLoading || !nsec.trim()}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-xs">Verifying...</span>
                      </div>
                    ) : (
                      'Access Account'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>            <TabsContent value='bunker' className='space-y-3 sm:space-y-4 mt-3 sm:mt-4'>
              <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border'>
                <div className="text-center mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Shield className='w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground' />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">Remote Signer</h3>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Connect using a remote signing service for enhanced security
                  </p>
                </div>

                <div className='space-y-2 sm:space-y-3'>
                  <div className='space-y-1'>
                    <label htmlFor='bunkerUri' className='text-xs font-medium text-foreground'>
                      Bunker Connection URI
                    </label>
                    <Input
                      id='bunkerUri'
                      value={bunkerUri}
                      onChange={(e) => setBunkerUri(e.target.value)}
                      className='rounded-lg focus-visible:ring-primary focus-visible:border-primary h-8 sm:h-9 text-xs sm:text-sm'
                      placeholder='bunker://...'
                    />
                    {bunkerUri && !bunkerUri.startsWith('bunker://') && (
                      <div className='flex items-center gap-2 text-destructive text-xs mt-1'>
                        <div className="w-1 h-1 bg-destructive rounded-full" />
                        URI must start with "bunker://"
                      </div>
                    )}
                  </div>

                  <Button
                    className='w-full rounded-lg py-2 h-8 sm:h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-xs sm:text-sm'
                    onClick={handleBunkerLogin}
                    disabled={isLoading || !bunkerUri.trim() || !bunkerUri.startsWith('bunker://')}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-xs">Connecting...</span>
                      </div>
                    ) : (
                      'Connect to Remote Signer'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent></Tabs>          <div className='text-center pt-3 sm:pt-4 border-t border-border'>
            <div className="space-y-2">
              <p className='text-xs text-muted-foreground'>
                New to Nostr?{' '}
                <button
                  onClick={handleSignupClick}
                  className='text-primary hover:text-primary/80 font-semibold hover:underline transition-colors duration-200'
                >
                  Create your identity
                </button>
              </p>
              <p className='text-xs text-muted-foreground leading-relaxed px-2'>
                Your keys, your identity, your data. Welcome to the decentralized future.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;

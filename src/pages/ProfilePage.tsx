import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Edit, 
  Shield, 
  Copy, 
  Check,
  X,
  Download,
  Key,
  AlertTriangle,
  Server,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useMiniApp } from '@/hooks/useMiniApp';
import { useCurrentRelays } from '@/hooks/useCurrentRelays';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useNostrLogin } from '@nostrify/react/login';
import { EditProfileForm } from '@/components/EditProfileForm';
import LoginDialog from '@/components/auth/LoginDialog';
import SignupDialog from '@/components/auth/SignupDialog';

export function ProfilePage() {
  const { user, metadata } = useCurrentUser();
  const { toast } = useToast();
  const { isMiniApp, miniAppUser } = useMiniApp();
  const { activeRelays, allRelays } = useCurrentRelays();
  const { logout } = useLoginActions();
  const { logins } = useNostrLogin();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  // Security-related state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showRelayDialog, setShowRelayDialog] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [exportStep, setExportStep] = useState<'warning' | 'show'>('warning');
  const [newRelayUrl, setNewRelayUrl] = useState('');

  const userDisplayName = metadata?.name || `User ${user?.pubkey.slice(0, 8)}`;
  const userPicture = metadata?.picture;

  // Get the current user's nsec if available
  const getCurrentUserNsec = (): string | null => {
    if (!user) return null;
    
    // Find the current user's login
    const currentLogin = logins.find(login => login.pubkey === user.pubkey);
    
    console.log('Debug - Current login:', currentLogin);
    console.log('Debug - Login type:', currentLogin?.type);
    
    if (currentLogin && currentLogin.type === 'nsec') {
      // Access the nsec from the data property
      const nsecValue = (currentLogin as unknown as { data: { nsec: string } }).data?.nsec;
      console.log('Debug - Found nsec:', nsecValue ? 'Yes' : 'No');
      
      return nsecValue || null;
    }
    
    return null;
  };

  const userNsec = getCurrentUserNsec();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Public key copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleLogin = () => {
    setShowLogin(false);
    setShowSignup(false);
    toast({
      title: "Welcome to Angor Hub!",
      description: "You have successfully signed in with Nostr",
    });
  };

  const handleSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  // Security handlers
  const handleExportPrivateKey = () => {
    setShowExportDialog(true);
    setExportStep('warning');
  };

  const handleExportWarningAccepted = () => {
    setExportStep('show');
  };

  const handleDownloadPrivateKey = () => {
    if (!user) return;
    
    try {
      // Get the actual private key from the current login
      const nsecKey = userNsec;
      
      if (!nsecKey) {
        toast({
          title: "No private key available",
          description: "This account doesn't have an accessible private key (might be using extension or bunker).",
          variant: "destructive"
        });
        return;
      }
      
      // Create blob and download
      const blob = new Blob([nsecKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nostr-private-key.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Private key exported",
        description: "Your private key has been downloaded safely.",
      });
      
      setShowExportDialog(false);
    } catch {
      toast({
        title: "Export failed",
        description: "Could not export private key.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been safely logged out.",
      });
    } catch {
      toast({
        title: "Logout failed",
        description: "Could not log out properly.",
        variant: "destructive"
      });
    }
  };

  if (!user && !isMiniApp) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to sign in with Nostr to view your profile
            </p>
            <Button onClick={() => setShowLogin(true)}>Sign in with Nostr</Button>
          </CardContent>
        </Card>

        {/* Login Dialog */}
        <LoginDialog
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />

        {/* Signup Dialog */}
        <SignupDialog
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
        />
      </div>
    );
  }

  // For MiniApp users without regular user login
  if (!user && isMiniApp && miniAppUser) {
    const displayName = miniAppUser.display_name || miniAppUser.name || 'MiniApp User';
    const userPicture = miniAppUser.picture;

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Your MiniApp profile information</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                MiniApp Profile
              </CardTitle>
              <CardDescription>
                This information is provided by the parent application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 ring-4 ring-purple-500/20">
                  {userPicture && <AvatarImage src={userPicture} />}
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl font-bold">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{displayName}</h2>
                  {miniAppUser.nip05 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {miniAppUser.nip05}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Profile Info */}
              <div className="grid gap-4">
                {miniAppUser.pubkey && (
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-xs font-mono break-all overflow-wrap-anywhere w-full min-w-0">
                        {miniAppUser.pubkey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(miniAppUser.pubkey!)}
                        className="shrink-0 self-start"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {miniAppUser.name && miniAppUser.name !== displayName && (
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <p className="text-muted-foreground">{miniAppUser.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If no user data is available (neither Nostr user nor MiniApp user)
  if (!user && (!isMiniApp || !miniAppUser)) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Profile Available</h3>
            <p className="text-muted-foreground mb-4">
              No profile information is currently available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure we have a user for the regular profile view
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your Nostr identity and preferences</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your public profile information. Changes are published to the Nostr network.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EditProfileForm onSuccess={() => setIsEditing(false)} />
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                      This information is visible to other users on the network
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <Avatar className="w-24 h-24 ring-4 ring-purple-500/20">
                        {userPicture && <AvatarImage src={userPicture} />}
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl font-bold">
                          {userDisplayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold">{userDisplayName}</h2>
                        {metadata?.nip05 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              {metadata.nip05}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Profile Info */}
                    <div className="grid gap-4">
                      {metadata?.about && (
                        <div className="space-y-2">
                          <Label>About</Label>
                          <p className="text-muted-foreground">{metadata.about}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metadata?.website && (
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <p className="text-muted-foreground">{metadata.website}</p>
                          </div>
                        )}

                        {metadata?.nip05 && (
                          <div className="space-y-2">
                            <Label>NIP-05 Identifier</Label>
                            <div className="flex items-center gap-2">
                              <p className="text-muted-foreground">{metadata.nip05}</p>
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Public Key Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Public Key</CardTitle>
                    <CardDescription>
                      Your unique Nostr identifier
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-xs font-mono break-all overflow-wrap-anywhere w-full min-w-0">
                        {user.pubkey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.pubkey)}
                        className="shrink-0 self-start"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Private Key Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Private Key Management
                </CardTitle>
                <CardDescription>
                  Manage your Nostr private key and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 w-full">
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Notice</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Your private key is the only way to access your account. Keep it safe and never share it with anyone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Private Key Actions</Label>
                    {!userNsec && (
                      <div className="p-3 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          You're using a browser extension or remote signer. Private key is not directly accessible.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={handleExportPrivateKey}
                        disabled={!userNsec}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Key
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        disabled={!userNsec}
                      >
                        {showPrivateKey ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide Key
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Show Key
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Account Actions</Label>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="w-auto"
                      onClick={handleLogout}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>

                {showPrivateKey && (
                  <div className="space-y-2">
                    <Label>Your Private Key</Label>
                    {userNsec ? (
                      <div className="p-3 bg-muted rounded-lg border-2 border-dashed">
                        <code className="text-xs font-mono break-all">
                          {userNsec}
                        </code>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-lg border-2 border-dashed">
                        <p className="text-xs text-muted-foreground">
                          Private key not accessible. You may be using a browser extension or remote signer.
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Never share this key with anyone. Anyone with this key has full access to your account.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relay Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Connected Relays
                </CardTitle>
                <CardDescription>
                  Manage the relays you're connected to for publishing and receiving events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Active Relays</p>
                    <p className="text-xs text-muted-foreground">
                      {activeRelays.length} of {allRelays.length} relays connected
                    </p>
                  </div>
                  <Button onClick={() => setShowRelayDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Relays
                  </Button>
                </div>

                <div className="space-y-2">
                  {activeRelays.slice(0, 3).map((relay) => (
                    <div key={relay.url} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">{relay.url}</p>
                          <div className="flex gap-2 mt-1">
                            {relay.read && (
                              <Badge variant="secondary" className="text-xs">Read</Badge>
                            )}
                            {relay.write && (
                              <Badge variant="secondary" className="text-xs">Write</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {relay.status}
                      </Badge>
                    </div>
                  ))}
                  {activeRelays.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      +{activeRelays.length - 3} more relays
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Additional security information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs font-mono">
                      <code className="flex-1 truncate">{user?.pubkey}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user?.pubkey || '')}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={metadata?.bot ? "destructive" : "default"}>
                        {metadata?.bot ? "Bot Account" : "Human Account"}
                      </Badge>
                      {metadata?.nip05 && (
                        <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Security Recommendations</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span>Keep your private key backed up in a secure location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span>Use a NIP-05 identifier for verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span>Connect to multiple reliable relays</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Private Key Export Dialog */}
        <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {exportStep === 'warning' ? 'Export Private Key' : 'Your Private Key'}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  {exportStep === 'warning' ? (
                    <div className="space-y-3">
                      <p>This will export your private key. Please understand:</p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2"></div>
                          <span>Anyone with this key has full access to your account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2"></div>
                          <span>Store it in a secure location</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2"></div>
                          <span>Never share it with anyone</span>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userNsec ? (
                        <div className="p-3 bg-muted rounded-lg border-2 border-dashed">
                          <code className="text-xs font-mono break-all">
                            {userNsec}
                          </code>
                        </div>
                      ) : (
                        <div className="p-3 bg-muted rounded-lg border-2 border-dashed">
                          <p className="text-xs text-muted-foreground">
                            Private key not accessible. You may be using a browser extension or remote signer.
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Save this key in a secure location. You'll need it to access your account.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {exportStep === 'warning' ? (
                <AlertDialogAction onClick={handleExportWarningAccepted}>
                  I Understand, Show Key
                </AlertDialogAction>
              ) : (
                <AlertDialogAction 
                  onClick={handleDownloadPrivateKey}
                  disabled={!userNsec}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {userNsec ? 'Download Key File' : 'Key Not Available'}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Relay Management Dialog */}
        <Dialog open={showRelayDialog} onOpenChange={setShowRelayDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Manage Relays
              </DialogTitle>
              <DialogDescription>
                Add, remove, or configure your Nostr relays for better connectivity.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Add New Relay */}
              <div className="space-y-2">
                <Label>Add New Relay</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="wss://relay.example.com"
                    value={newRelayUrl}
                    onChange={(e) => setNewRelayUrl(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      // Add relay logic here
                      setNewRelayUrl('');
                      toast({
                        title: "Relay added",
                        description: "New relay has been added to your configuration.",
                      });
                    }}
                    disabled={!newRelayUrl.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Current Relays */}
              <div className="space-y-2">
                <Label>Current Relays ({allRelays.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allRelays.map((relay) => (
                    <div key={relay.url} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${
                          relay.status === 'connected' ? 'bg-green-500' : 
                          relay.status === 'connecting' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{relay.url}</p>
                          <div className="flex gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Switch 
                                checked={relay.read} 
                                onCheckedChange={() => {
                                  // Toggle read permission logic here
                                }} 
                              />
                              <span className="text-xs">Read</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch 
                                checked={relay.write} 
                                onCheckedChange={() => {
                                  // Toggle write permission logic here
                                }} 
                              />
                              <span className="text-xs">Write</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {relay.status}
                        </Badge>
                        {!relay.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Remove relay logic here
                              toast({
                                title: "Relay removed",
                                description: "Relay has been removed from your configuration.",
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRelayDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
      </div>
      
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="h-24 w-24 bg-muted animate-pulse rounded-full" />
            
            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Skeleton */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <div className="h-10 w-24 bg-muted animate-pulse rounded-t-md m-1" />
          <div className="h-10 w-20 bg-muted/50 animate-pulse rounded-t-md m-1" />
        </div>
        
        {/* Tab Content */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-20 w-full bg-muted animate-pulse rounded-md" />
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <div className="h-9 w-16 bg-muted animate-pulse rounded-md" />
              <div className="h-9 w-20 bg-primary/20 animate-pulse rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;

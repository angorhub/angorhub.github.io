import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Edit, 
  Shield, 
  Copy, 
  Check,
  X
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useMiniApp } from '@/hooks/useMiniApp';
import { EditProfileForm } from '@/components/EditProfileForm';
import LoginDialog from '@/components/auth/LoginDialog';
import SignupDialog from '@/components/auth/SignupDialog';

export function ProfilePage() {
  const { user, metadata } = useCurrentUser();
  const { toast } = useToast();
  const { isMiniApp, miniAppUser } = useMiniApp();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const userDisplayName = metadata?.name || `User ${user?.pubkey.slice(0, 8)}`;
  const userPicture = metadata?.picture;

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
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your Nostr keys and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Private Key Management</Label>
                  <p className="text-sm text-muted-foreground">
                    Your private key is securely stored and never transmitted. 
                    Always keep a backup in a safe place.
                  </p>
                  <Button variant="outline">
                    Export Private Key
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Connected Relays</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage the relays you're connected to for publishing and receiving events.
                  </p>
                  <Button variant="outline">
                    Manage Relays
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

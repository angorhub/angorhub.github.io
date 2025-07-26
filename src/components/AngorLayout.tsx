import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Settings,
  LogOut,
  User,
  Shield,
  Home,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useMiniApp } from '@/hooks/useMiniApp';
import LoginDialog from '@/components/auth/LoginDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/useToast';
import { useAppContext } from '@/hooks/useAppContext';
import { ThemeLoadingOverlay } from '@/components/ThemeLoading';

interface AngorLayoutProps {
  children: React.ReactNode;
}

export function AngorLayout({ children }: AngorLayoutProps) {
  const navigate = useNavigate();
  const { user, metadata } = useCurrentUser();
  const { logout } = useLoginActions();
  const { toast } = useToast();
  const { loading } = useAppContext();
  const { isMiniApp, miniAppUser } = useMiniApp();
  
  // Temporary debug
  console.log('Debug: isMiniApp =', isMiniApp, 'miniAppUser =', miniAppUser);
  
  const [showLogin, setShowLogin] = useState(false);

  // Close mobile menu on escape key
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (err) {
      toast({
        title: "Error signing out",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
      console.error('Logout error:', err);
    }
  };

  // Use MiniApp user data if available, otherwise use regular user data
  const userDisplayName = isMiniApp 
    ? (miniAppUser?.display_name || miniAppUser?.name || 'MiniApp User')
    : (metadata?.name || `User ${user?.pubkey.slice(0, 8)}`);
  const userPicture = isMiniApp ? miniAppUser?.picture : metadata?.picture;
  const userNip05 = isMiniApp ? miniAppUser?.nip05 : metadata?.nip05;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="w-5 h-5 mr-2" />
                Angor Hub
              </Button>
 
            </div>
            
            <div className="flex items-center gap-4">

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground hover:text-foreground"
              >
              <Settings className="w-5 h-5" />
              </Button>
              <ThemeToggle />
              
              {/* User auth section - different behavior for MiniApp vs Standalone */}
              {isMiniApp ? (
                // MiniApp mode: Show user info without sign out
                <div className="flex items-center gap-2">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Avatar className="w-8 h-8">
                          {userPicture ? (
                            <AvatarImage src={userPicture} alt={userDisplayName} />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {userDisplayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{userDisplayName}</p>
                          {userNip05 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {userNip05}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                // Standalone mode: Regular auth flow
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Avatar className="w-8 h-8">
                          {userPicture && <AvatarImage src={userPicture} />}
                          <AvatarFallback className="text-xs">
                            {userDisplayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{userDisplayName}</p>
                          {userNip05 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {userNip05}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                  >
                    Sign in
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>

      {/* Login Dialog - Only show when not in MiniApp mode */}
      {!isMiniApp && (
        <LoginDialog 
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={() => {
            setShowLogin(false);
            toast({
              title: "Welcome to Angor Hub!",
              description: "You have successfully signed in with Nostr",
            });
          }}
        />
      )}
      
      {/* Global Loading Overlay with fade-out support */}
      <ThemeLoadingOverlay 
        text={loading.message || 'Loading...'} 
        isVisible={loading.isLoading}
      />
    </div>
  );
}

export default AngorLayout;

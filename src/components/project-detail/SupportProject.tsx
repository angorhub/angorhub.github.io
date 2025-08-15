import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZapForm } from '@/components/ZapForm';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import { 
  Bitcoin,
  AlertCircle,
  Zap,
  ExternalLink,
  RefreshCw,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import type { NostrProfile } from '@/types/angor';

export function SupportProjectSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="space-y-2 pt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectStats {
  status?: string;
}

interface SupportProjectProps {
  stats?: ProjectStats;
  network: string;
  projectId: string;
  isMiniApp: boolean;
  profile?: NostrProfile;
  projectNostrPubKey?: string; // Add project's nostr public key
}

export function SupportProject({
  stats,
  network,
  projectId,
  isMiniApp,
  profile,
  projectNostrPubKey
}: SupportProjectProps) {
  const isActive = stats?.status === 'active' || !stats?.status;
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  
  // Check if current user is the project owner
  const isProjectOwner = Boolean(user && projectNostrPubKey && user.pubkey === projectNostrPubKey);

  // If project owner is logged in, show management section instead of investment
  if (isProjectOwner) {
    return (
      <div className="xl:col-span-1">
        <div className="sticky top-4 sm:top-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Manage Project</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                You are the owner of this project. You can manage all project details.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Management Button */}
              <Button 
                size="lg"
                className="w-full"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Project
              </Button>

              {/* Project Owner Features */}
              <div className="space-y-4 pt-4 border-t">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Management Features
                </div>
                
                <div className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Project Metadata</div>
                    <div className="text-xs text-muted-foreground">
                      Update project name, description, images and basic information
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5">
                    <ExternalLink className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Links & Social</div>
                    <div className="text-xs text-muted-foreground">
                      Manage social media links and project websites
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Media Gallery</div>
                    <div className="text-xs text-muted-foreground">
                      Upload and organize project images and videos
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Team & FAQ</div>
                    <div className="text-xs text-muted-foreground">
                      Manage team members and frequently asked questions
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:col-span-1">
      <div className="sticky top-4 sm:top-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Bitcoin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Invest with Angor</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Decentralized Bitcoin crowdfunding with time-locked milestones
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {isActive ? (
              <>
                {/* Investment Button */}
                <Button 
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    const baseUrl = network === 'mainnet' ? 'https://beta.angor.io' : 'https://test.angor.io';
                    const investUrl = `${baseUrl}/view/${projectId}`;
                    window.open(investUrl, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 ml-2" />
                  Invest Now
                </Button>

                {/* Donation Section */}
                {!isMiniApp && profile?.lud16 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-center">
                      Financial Support
                    </div>
                    <ZapForm
                      zapAddress={profile.lud16}
                      recipientName={profile.name || profile.display_name || 'Project'}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="w-full"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Send Zap
                        </Button>
                      }
                    />
                  </div>
                )}

                {/* Angor Protocol Features */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Angor Protocol Benefits
                  </div>
                  
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="mt-0.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Time-locked Milestones</div>
                      <div className="text-xs text-muted-foreground">
                        Funds released automatically through Bitcoin time-lock contracts
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="mt-0.5">
                      <RefreshCw className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Investor Recovery</div>
                      <div className="text-xs text-muted-foreground">
                        Unspent funds can be recovered at any point via 2-of-2 multisig
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="mt-0.5">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Non-custodial</div>
                      <div className="text-xs text-muted-foreground">
                        Fully decentralized with no middleman or backend servers
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="mt-0.5">
                      <Eye className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Full Transparency</div>
                      <div className="text-xs text-muted-foreground">
                        Built on Bitcoin & Nostr for complete transparency
                      </div>
                    </div>
                  </div>
                  
                  {!isMiniApp && profile?.lud16 && (
                    <div className="flex items-start space-x-3 text-sm">
                      <div className="mt-0.5">
                        <Zap className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium mb-1">Lightning Support</div>
                        <div className="text-xs text-muted-foreground">
                          Direct zaps available via Lightning Network
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <div className="font-medium mb-1">Investment Closed</div>
                  <div className="text-sm text-muted-foreground">
                    This project is no longer accepting investments
                  </div>
                </div>
                
                {/* Zap option for closed projects */}
                {!isMiniApp && profile?.lud16 && (
                  <div className="space-y-3 pt-4">
                    <div className="text-sm font-medium">
                      Financial Support
                    </div>
                    <ZapForm
                      zapAddress={profile.lud16}
                      recipientName={profile.name || profile.display_name || 'Project'}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="w-full"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Send Zap
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

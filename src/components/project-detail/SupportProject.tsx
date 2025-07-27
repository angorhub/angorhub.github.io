import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZapForm } from '@/components/ZapForm';
import { 
  Bitcoin,
  CheckCircle,
  AlertCircle,
  Zap,
  ExternalLink
} from 'lucide-react';
import type { NostrProfile } from '@/types/angor';

export function SupportProjectSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="space-y-2 pt-2">
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
}

export function SupportProject({
  stats,
  network,
  projectId,
  isMiniApp,
  profile
}: SupportProjectProps) {
  return (
    <div className="xl:col-span-1">
      <div className="sticky top-4 sm:top-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <span>Support Project</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats?.status === 'active' || !stats?.status) ? (
              <>
                {/* Regular Invest Button */}
                <Button 
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    const baseUrl = network === 'mainnet' ? 'https://beta.angor.io' : 'https://test.angor.io';
                    const investUrl = `${baseUrl}/view/${projectId}`;
                    window.open(investUrl, '_blank');
                  }}
                >
                  <Bitcoin className="h-5 w-5 mr-2" />
                  Invest Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                {/* Zap Button - Only show if NOT in MiniApp */}
                {!isMiniApp && profile?.lud16 && (
                  <ZapForm
                    zapAddress={profile.lud16}
                    recipientName={profile.name || profile.display_name || 'Project'}
                    trigger={
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Send Zap
                      </Button>
                    }
                  />
                )}

                <div className="text-xs sm:text-sm text-muted-foreground space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span>Milestone-based releases</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span>Refund protection</span>
                  </div>
                  {!isMiniApp && profile?.lud16 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                      <span>Lightning zaps available</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <div className="font-medium mb-2">Investment Closed</div>
                <div className="text-sm text-muted-foreground mb-4">
                  This project is no longer accepting investments
                </div>
                {/* Still show zap option if available and not in MiniApp */}
                {!isMiniApp && profile?.lud16 && (
                  <ZapForm
                    zapAddress={profile.lud16}
                    recipientName={profile.name || profile.display_name || 'Project'}
                    trigger={
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Send Zap
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

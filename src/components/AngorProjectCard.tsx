import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Target, Bitcoin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '@/contexts/NetworkContext';
import { useSettings } from '@/hooks/useSettings';
import { formatNumber, formatBitcoinAmount } from '@/lib/formatCurrency';
import { useNostrProjectByEventId, useProjectMetadata } from '@/services/nostrService';
import { useAngorProjectStats, useAngorProject } from '@/hooks/useAngorProjects';
import type { AngorProject } from '@/types/angor';

interface AngorProjectCardProps {
  project: AngorProject;
}

export function AngorProjectCard({ project }: AngorProjectCardProps) {
  const navigate = useNavigate();
  const { network } = useNetwork();
  const { settings } = useSettings();
  
  // Fetch detailed project info from Nostr - try both event IDs
  const eventId = project.nostrEventId || project.trxId;
  const { data: nostrProjectData } = useNostrProjectByEventId(eventId);
  const { data: projectMetadata } = useProjectMetadata(nostrProjectData?.nostrPubKey);
  
  // Fetch real-time stats from indexer
  const { data: indexerStats } = useAngorProjectStats(project.projectIdentifier);
  
  // Fetch detailed project info from indexer only if we don't have targetAmount from other sources
  const needsDetailedProject = !project.targetAmount && !project.details?.targetAmount && !(nostrProjectData?.projectDetails as Record<string, unknown>)?.targetAmount;
  const { data: detailedProject } = useAngorProject(project.projectIdentifier, { enabled: needsDetailedProject });
  
  // Use Nostr data if available, fallback to indexer data
  const projectName = nostrProjectData?.name || // From merged Nostr data (kinds 3030 + 30078)
                     (projectMetadata?.profile as Record<string, unknown>)?.name as string || 
                     (projectMetadata?.project as Record<string, unknown>)?.name as string || 
                     project.metadata?.name || 
                     `Project ${project.projectIdentifier.slice(0, 8)}...`;
                     
  const projectDescription = nostrProjectData?.about || // From merged Nostr data (kinds 3030 + 30078)
                           (projectMetadata?.profile as Record<string, unknown>)?.about as string || 
                           (projectMetadata?.project as Record<string, unknown>)?.about as string || 
                           project.metadata?.about || 
                           project.details?.description || 
                           'No description available.';
                           
  const projectPicture = (projectMetadata?.profile as Record<string, unknown>)?.picture as string || 
                        (projectMetadata?.media as Record<string, unknown>)?.picture as string ||
                        project.metadata?.picture;

  // Get amounts from multiple sources with prioritization
  const targetAmount = indexerStats?.targetAmount ||
                      detailedProject?.targetAmount ||
                      project.targetAmount ||
                      project.details?.targetAmount ||
                      (nostrProjectData?.projectDetails as Record<string, unknown>)?.targetAmount as number ||
                      0;

  const amountInvested = indexerStats?.amountInvested ||
                        detailedProject?.amountInvested ||
                        project.amountInvested ||
                        0;

  const investorCount = indexerStats?.investorCount ||
                       detailedProject?.investorCount ||
                       project.investorCount ||
                       0;

  const currentTargetAmount = targetAmount || 0;
  const currentAmountInvested = amountInvested || 0;
  const currentInvestorCount = investorCount || 0;

  // Calculate funding progress
  const fundingProgress = currentTargetAmount > 0 
    ? Math.min((currentAmountInvested / currentTargetAmount) * 100, 100) 
    : 0;
  
  // Determine project status and color
  const getStatusInfo = () => {
    const status = indexerStats?.status || 'active';
    
    switch (status) {
      case 'completed':
        return { color: 'bg-green-500', text: 'Completed' };
      case 'expired':
        return { color: 'bg-red-500', text: 'Expired' };
      case 'upcoming':
        return { color: 'bg-yellow-500', text: 'Upcoming' };
      default:
        return { color: 'bg-blue-500', text: 'Active' };
    }
  };

  const { color: statusColor, text: statusText } = getStatusInfo();

  // Format Bitcoin amounts for display with network awareness
  const formatBTCWithNetwork = (sats: number | undefined, fallback = '0') => {
    if (!sats) return fallback;
    
    const formatted = formatBitcoinAmount(sats, { 
      network, 
      currency: settings.defaultCurrency,
      precision: settings.defaultCurrency === 'btc' ? 8 : 0
    });
    
    return formatted;
  };

  const handleViewProject = () => {
    navigate(`/project/${project.projectIdentifier}`);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group overflow-hidden cursor-pointer" onClick={handleViewProject}>
      <CardContent className="p-4">
        {/* Header with Avatar and Title */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage 
              src={projectPicture} 
              alt={projectName}
              className="object-cover"
            />
            <AvatarFallback className="text-sm font-semibold bg-orange-100 text-orange-700">
              {projectName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight group-hover:text-orange-600 transition-colors mb-1 line-clamp-1">
              {projectName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {projectDescription}
            </p>
          </div>
          
          <Badge className={`text-white ${statusColor} border-none text-xs flex-shrink-0`}>
            {statusText}
          </Badge>
        </div>

        {/* Funding Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-semibold text-orange-600">
              {fundingProgress > 0 ? `${Math.round(fundingProgress)}%` : '0%'}
            </span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{formatNumber(currentInvestorCount || 0)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Bitcoin className="w-4 h-4" />
            <span>{formatBTCWithNetwork(currentAmountInvested, '0')}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{formatBTCWithNetwork(currentTargetAmount, 'TBD')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton component for loading state
export function AngorProjectCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            {/* Header skeleton */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-muted animate-pulse rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-full" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
              <div className="h-5 w-16 bg-muted animate-pulse rounded flex-shrink-0" />
            </div>

            {/* Progress skeleton */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <div className="h-4 bg-muted animate-pulse rounded w-16" />
                <div className="h-4 bg-muted animate-pulse rounded w-8" />
              </div>
              <div className="h-2 bg-muted animate-pulse rounded w-full" />
            </div>

            {/* Stats skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
              <div className="h-4 bg-muted animate-pulse rounded w-16" />
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

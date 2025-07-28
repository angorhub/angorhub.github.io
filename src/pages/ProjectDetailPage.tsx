import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectComments } from '@/components/ProjectComments';
import { 
  ProjectHeader, 
  ProjectHeaderSkeleton,
  ProjectMediaSlider,
  ProjectMediaSliderSkeleton,
  SupportProject, 
  SupportProjectSkeleton,
  FundingProgress,
  FundingProgressSkeleton,
  ProjectStages,
  ProjectStagesSkeleton,
  OverviewTab,
  OverviewTabSkeleton,
  UpdatesTab,
  FAQTab,
  InvestorsTab,
  TeamTab 
} from '@/components/project-detail';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useNostr } from '@/hooks/useNostr';
import { useMiniApp } from '@/hooks/useMiniApp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nip19 } from 'nostr-tools';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAngorProject, useAngorProjectStats, useAngorProjectInvestments } from '@/hooks/useAngorData';
import { useProjectMetadata, useNostrAdditionalData, useProjectUpdates, useNostrProjectByEventId } from '@/services/nostrService';
import { useIndexerProject } from '@/hooks/useIndexerProject';
import { useDenyList } from '@/services/denyService';
import { useNetwork } from '@/contexts/NetworkContext';
import { useSettings } from '@/hooks/useSettings';
import { useFavorites } from '@/hooks/useFavorites';
import { formatBitcoinAmount } from '@/lib/formatCurrency';
import { useAuthor } from '@/hooks/useAuthor';
import type { 
  NostrProfile, 
  ProjectMetadata, 
  ProjectMedia
} from '@/types/angor';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper function for formatting amounts
const formatAmount = (amount: number | undefined) => {
  if (!amount || amount === 0) return '0';
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

// Safe date formatting function
const safeFormatDistanceToNow = (timestamp: number | undefined) => {
  if (!timestamp || timestamp <= 0) return 'Unknown time';
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return 'Invalid date';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * TeamMemberProfile Component
 * Displays team member information with enhanced pubkey conversion
 */
function TeamMemberProfile({ pubkey, index }: { pubkey: string; index: number }) {
  // Convert npub to hex if needed
  const hexPubkey = (() => {
    try {
      if (pubkey.startsWith('npub')) {
        const decoded = nip19.decode(pubkey);
        if (decoded.type === 'npub') {
          return decoded.data;
        }
      }
      return pubkey; // Already hex format
    } catch {
      return pubkey; // Return original if conversion fails
    }
  })();
  
  const author = useAuthor(hexPubkey);
  const metadata = author.data?.metadata;
  const isLoading = author.isLoading;
  const hasError = author.isError;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 p-3 border rounded-lg">
        <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-muted animate-pulse rounded w-32" />
          <div className="h-3 bg-muted animate-pulse rounded w-24" />
        </div>
      </div>
    );
  }

  const displayName = metadata?.display_name || metadata?.name || `Team Member ${index + 1}`;
  
  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={metadata?.picture} alt={displayName} />
        <AvatarFallback className="text-sm">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{displayName}</div>
        {metadata?.name && metadata?.display_name !== metadata?.name && (
          <div className="text-xs text-muted-foreground">@{metadata.name}</div>
        )}
        {metadata?.about && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {metadata.about}
          </div>
        )}
        {hasError && (
          <div className="text-xs text-yellow-600 mt-1">
            Profile data unavailable
          </div>
        )}
        <div className="text-xs text-muted-foreground/50 font-mono mt-1">
          {pubkey.startsWith('npub') ? `${pubkey.slice(0, 12)}...` : `${pubkey.slice(0, 16)}...`}
        </div>
      </div>
    </div>
  );
}

/**
 * Main ProjectDetailPage Component
 * Displays detailed information about a specific project
 */
export function ProjectDetailPage() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // User and Nostr hooks
  const { user } = useCurrentUser();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const { nostr } = useNostr();
  const { isMiniApp } = useMiniApp();
  const queryClient = useQueryClient();

  // Network and settings
  const { network } = useNetwork();
  const { settings } = useSettings();
  const denyService = useDenyList();

  // Favorites functionality
  const { isFavorite, toggleFavorite } = useFavorites();

  // Comments section ref for scrolling
  const commentsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Core project data
  const { data: project, isLoading: projectLoading } = useAngorProject(projectId);
  const { data: stats, isLoading: statsLoading } = useAngorProjectStats(projectId);
  const { data: investments, isLoading: investmentsLoading } = useAngorProjectInvestments(projectId);
  const { data: indexerProject } = useIndexerProject(projectId);
  
  // Nostr-related data
  const eventId = indexerProject?.nostrEventId || project?.nostrEventId;
  const { data: nostrProjectData } = useNostrProjectByEventId(eventId);
  const nostrPubKey = nostrProjectData?.nostrPubKey || project?.nostrPubKey || indexerProject?.nostrPubKey;
  
  // Additional project metadata
  const { data: projectMetadata } = useProjectMetadata(nostrPubKey);
  const { data: additionalData } = useNostrAdditionalData(nostrPubKey);
  const { data: updates } = useProjectUpdates(projectId);

  // Extract profile data
  const profile = projectMetadata?.profile as NostrProfile | undefined;
  const projectData = projectMetadata?.project as ProjectMetadata | undefined;
  const mediaData = projectMetadata?.media as ProjectMedia | undefined;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Bitcoin formatting function
  const formatBTC = (sats: number | undefined) => {
    if (!sats) return `0.00000000 ${network === 'testnet' ? 'TBTC' : 'BTC'}`;
    return formatBitcoinAmount(sats, { 
      network, 
      currency: settings.defaultCurrency,
      precision: 8
    });
  };
  
  // Fetch likes for this project using Nostr
  const { data: projectLikes, refetch: refetchLikes } = useQuery({
    queryKey: ['projectLikes', nostrPubKey],
    queryFn: async () => {
      if (!nostrPubKey) return { likes: [], count: 0, userHasLiked: false };
      
      try {
        const signal = AbortSignal.timeout(5000);
        const events = await nostr.query([
          {
            kinds: [7], // Reaction events
            '#p': [nostrPubKey], // Reactions to this pubkey
            limit: 1000
          }
        ], { signal });

        // Process likes (content: "+") vs unlikes (content: "-")
        const likeMap = new Map();
        
        events.forEach(event => {
          const userId = event.pubkey;
          const isLike = event.content === '+';
          const isUnlike = event.content === '-';
          
          if (isLike || isUnlike) {
            const existingReaction = likeMap.get(userId);
            if (!existingReaction || event.created_at > existingReaction.created_at) {
              likeMap.set(userId, {
                isLike,
                created_at: event.created_at,
                eventId: event.id
              });
            }
          }
        });

        // Count only users who have active likes (not unlikes)
        const activeLikes = Array.from(likeMap.values()).filter(reaction => reaction.isLike);
        const userHasLiked = user ? likeMap.get(user.pubkey)?.isLike || false : false;

        return {
          likes: activeLikes,
          count: activeLikes.length,
          userHasLiked
        };
      } catch {
        return { likes: [], count: 0, userHasLiked: false };
      }
    },
    enabled: !!nostrPubKey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Like mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: async ({ isCurrentlyLiked }: { isCurrentlyLiked: boolean }) => {
      if (!user) {
        throw new Error("Login Required");
      }

      if (!nostrPubKey) {
        throw new Error("Project Nostr public key not found");
      }

      // Publish the like/unlike event
      return new Promise<void>((resolve) => {
        publishEvent({
          kind: 7,
          content: isCurrentlyLiked ? "-" : "+", // Toggle like/unlike
          created_at: Math.floor(Date.now() / 1000),
          tags: [["p", nostrPubKey]]
        });
        
        // Simulate async operation
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    onMutate: async ({ isCurrentlyLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projectLikes', nostrPubKey] });
      
      // Snapshot the previous value
      const previousLikes = queryClient.getQueryData(['projectLikes', nostrPubKey]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['projectLikes', nostrPubKey], (old: { likes: unknown[]; count: number; userHasLiked: boolean } | undefined) => {
        if (!old) return { likes: [], count: 0, userHasLiked: false };
        
        const newCount = isCurrentlyLiked ? old.count - 1 : old.count + 1;
        return {
          ...old,
          count: Math.max(0, newCount), // Ensure count doesn't go negative
          userHasLiked: !isCurrentlyLiked
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousLikes };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLikes) {
        queryClient.setQueryData(['projectLikes', nostrPubKey], context.previousLikes);
      }
      
      toast({
        title: "Like Failed",
        description: "Could not send like. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (_data, { isCurrentlyLiked }) => {
      toast({
        title: isCurrentlyLiked ? "Unliked" : "Liked!",
        description: isCurrentlyLiked ? "You unliked this project" : "You liked this project",
      });
      
      // Refetch after a delay to sync with server
      setTimeout(() => {
        refetchLikes();
      }, 2000);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      // This is commented out to avoid immediate refetch that would override optimistic update
      // queryClient.invalidateQueries({ queryKey: ['projectLikes', nostrPubKey] });
    },
  });

  // Handle like functionality
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login with your Nostr account to like this project",
        variant: "destructive"
      });
      return;
    }

    if (!nostrPubKey) {
      toast({
        title: "Cannot Like",
        description: "Project Nostr public key not found",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlyLiked = projectLikes?.userHasLiked || false;
    likeMutation.mutate({ isCurrentlyLiked });
  };

  // Handle share functionality
  const handleShare = async (platform: 'copy' | 'twitter' | 'facebook' | 'telegram') => {
    const projectUrl = window.location.href;
    const projectTitle = projectData?.name || profile?.name || 'Angor Project';
    const projectDescription = projectData?.about || profile?.about || 'Check out this amazing project on Angor!';

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(projectUrl);
          toast({
            title: "Link Copied!",
            description: "Project link copied to clipboard",
          });
        } catch {
          toast({
            title: "Copy Failed",
            description: "Could not copy link to clipboard",
            variant: "destructive"
          });
        }
        break;

      case 'twitter':
        {
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${projectTitle} - ${projectDescription}`)}&url=${encodeURIComponent(projectUrl)}&hashtags=Angor,Bitcoin,Crowdfunding`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
        }
        break;

      case 'facebook':
        {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
          window.open(facebookUrl, '_blank', 'width=600,height=400');
        }
        break;

      case 'telegram':
        {
          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(projectUrl)}&text=${encodeURIComponent(`${projectTitle} - ${projectDescription}`)}`;
          window.open(telegramUrl, '_blank', 'width=600,height=400');
        }
        break;
    }
  };

  // Handle scroll to comments
  const handleScrollToComments = () => {
    commentsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (projectId) {
      const projectName = projectData?.name || profile?.name || additionalData?.project?.projectIdentifier || project?.projectIdentifier || 'Unnamed Project';
      const projectPicture = projectData?.picture || profile?.picture;
      const projectDescription = projectData?.about || profile?.about;
      toggleFavorite(projectId, projectName, projectPicture, projectDescription);
    }
  };
  
  // ============================================================================
  // EFFECTS
  // ============================================================================

  // If project is denied, redirect to home or show error
  useEffect(() => {
    if (projectId && denyService.isDenied(projectId)) {
      navigate('/', { replace: true });
      return;
    }
  }, [projectId, denyService, navigate]);

  // ============================================================================
  // COMPONENT RENDER
  // ============================================================================

  // Don't render anything if project is denied
  if (projectId && denyService.isDenied(projectId)) {
    return null;
  }

  const isLoading = projectLoading || statsLoading || investmentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
          {/* Back Button Skeleton */}
          <div className="h-10 w-32 bg-muted animate-pulse rounded hidden lg:flex" />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Header Skeleton */}
              <ProjectHeaderSkeleton />

              {/* Media Slider Skeleton */}
              <ProjectMediaSliderSkeleton />

              {/* Funding Progress Skeleton */}
              <FundingProgressSkeleton />

              {/* Project Stages Skeleton */}
              <ProjectStagesSkeleton />
            </div>

            {/* Right Column - Sidebar */}
            <div className="xl:col-span-1">
              <SupportProjectSkeleton />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            {/* Mobile: Horizontal scroll skeleton */}
            <div className="overflow-x-auto sm:hidden">
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-max min-w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-muted-foreground/10 animate-pulse rounded" />
                ))}
              </div>
            </div>
            
            {/* Desktop: Grid skeleton */}
            <div className="hidden sm:grid grid-cols-5 gap-2 p-1 bg-muted rounded-lg">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted-foreground/10 animate-pulse rounded" />
              ))}
            </div>
            
            {/* Tab Content Skeleton - Default to Overview */}
            <OverviewTabSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Only require project data - stats and investments are optional
  if (!project) {
    return <ProjectNotFound />;
  }

  // Safe data extraction with fallbacks from all sources
  // Get target amount from any available source (prioritize indexer, then stats, then additional data, then Nostr data)
  const targetAmount = indexerProject?.targetAmount || 
                      indexerProject?.details?.targetAmount ||
                      stats?.targetAmount || 
                      additionalData?.project?.targetAmount || 
                      project?.details?.targetAmount || 
                      0;
  const amountInvested = indexerProject?.amountInvested || stats?.amountInvested || 0;
  const investorCount = indexerProject?.investorCount || stats?.investorCount || 0;

  // Calculate completion percentage manually if stats don't provide it or if it's incorrect
  const calculatedPercentage = targetAmount > 0 ? (amountInvested / targetAmount) * 100 : 0;
  const completionPercentage = Math.min(
    stats?.completionPercentage && stats.completionPercentage > 0 
      ? stats.completionPercentage 
      : calculatedPercentage, 
    100
  );
  
  const timeRemaining = (project?.details?.expiryDate || additionalData?.project?.expiryDate)
    ? safeFormatDistanceToNow(project?.details?.expiryDate || additionalData?.project?.expiryDate)
    : 'No deadline';

  const statusColor = {
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    expired: 'bg-red-500',
    upcoming: 'bg-yellow-500',
  }[stats?.status || 'active'];

  // Extract media items from project data
  const extractMediaItems = () => {
    const mediaItems: Array<{ type: 'image' | 'video' | 'youtube'; url: string; thumbnail?: string; alt?: string }> = [];
    
    // Helper function to detect YouTube URLs
    const isYouTubeUrl = (url: string) => {
      return /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)/.test(url);
    };
    
    // From project media data
    if (mediaData) {
      if (mediaData.images) {
        mediaData.images.forEach(imageUrl => {
          mediaItems.push({ type: 'image', url: imageUrl, alt: 'Project image' });
        });
      }
      if (mediaData.videos) {
        mediaData.videos.forEach(videoUrl => {
          const type = isYouTubeUrl(videoUrl) ? 'youtube' : 'video';
          mediaItems.push({ type, url: videoUrl, alt: 'Project video' });
        });
      }
    }
    
    // From project gallery/media in additional data
    if (additionalData?.media) {
      const media = additionalData.media as unknown[];
      if (Array.isArray(media)) {
        media.forEach(item => {
          if (typeof item === 'string') {
            // Check if it's YouTube first
            if (isYouTubeUrl(item)) {
              mediaItems.push({ 
                type: 'youtube', 
                url: item, 
                alt: 'Project YouTube video' 
              });
            } else {
              // Determine type by URL extension
              const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(item);
              mediaItems.push({ 
                type: isVideo ? 'video' : 'image', 
                url: item, 
                alt: `Project ${isVideo ? 'video' : 'image'}` 
              });
            }
          } else if (item && typeof item === 'object') {
            const mediaItem = item as Record<string, unknown>;
            const url = (mediaItem.url || mediaItem.src || '') as string;
            
            // Check if object URL is YouTube
            if (isYouTubeUrl(url)) {
              mediaItems.push({ 
                type: 'youtube', 
                url, 
                thumbnail: mediaItem.thumbnail as string,
                alt: (mediaItem.alt || mediaItem.description || 'Project YouTube video') as string
              });
            } else {
              mediaItems.push({ 
                type: (mediaItem.type as 'image' | 'video') || 'image', 
                url, 
                thumbnail: mediaItem.thumbnail as string,
                alt: (mediaItem.alt || mediaItem.description || 'Project media') as string
              });
            }
          }
        });
      }
    }
    
    return mediaItems;
  };

  const mediaItems = extractMediaItems();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Back Button - Desktop Only */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 hidden lg:flex"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Discover</span>
        </Button>

        {/* Project Header - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Info - Stacked on mobile */}
          <div className="xl:col-span-2 space-y-6">
            {/* Title and Status */}
            <ProjectHeader
              projectData={projectData}
              profile={profile}
              additionalData={additionalData}
              project={project}
              stats={stats || undefined}
              projectLikes={projectLikes}
              isLiking={likeMutation.isPending}
              statusColor={statusColor}
              onLike={handleLike}
              onShare={handleShare}
              onScrollToComments={handleScrollToComments}
              isFavorite={projectId ? isFavorite(projectId) : false}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Media Slider - Show if media exists */}
            {mediaItems.length > 0 && (
              <ProjectMediaSlider media={mediaItems} />
            )}

            {/* Funding Progress - Enhanced Mobile Layout */}
            <FundingProgress
              completionPercentage={completionPercentage}
              formatBTC={formatBTC}
              formatAmount={formatAmount}
              amountInvested={amountInvested}
              targetAmount={targetAmount}
              investorCount={investorCount}
              timeRemaining={timeRemaining}
            />

            {/* Project Stages - Standalone Component */}
            <ProjectStages
              additionalData={additionalData as { project?: { stages?: Array<{ releaseDate?: number; amountToRelease: number; }>; targetAmount?: number; } } | undefined}
              formatBTC={formatBTC}
            />

        {/* Project Details Tabs - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Horizontal scroll tabs */}
          <div className="overflow-x-auto mb-6 sm:mb-8 sm:hidden">
            <TabsList className="flex w-max min-w-full h-12 gap-1 p-1">
              <TabsTrigger value="overview" className="text-xs px-3 py-2 whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="updates" className="text-xs px-3 py-2 whitespace-nowrap">Updates</TabsTrigger>
              <TabsTrigger value="faq" className="text-xs px-3 py-2 whitespace-nowrap">FAQ</TabsTrigger>
              <TabsTrigger value="investors" className="text-xs px-3 py-2 whitespace-nowrap">Investors</TabsTrigger>
              <TabsTrigger value="team" className="text-xs px-3 py-2 whitespace-nowrap">Team</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout */}
          <TabsList className="hidden sm:grid w-full grid-cols-5 mb-6 sm:mb-8 h-12 sm:h-14">
            <TabsTrigger value="overview" className="text-sm sm:text-base px-4 py-3">Overview</TabsTrigger>
            <TabsTrigger value="updates" className="text-sm sm:text-base px-4 py-3">Updates</TabsTrigger>
            <TabsTrigger value="faq" className="text-sm sm:text-base px-4 py-3">FAQ</TabsTrigger>
            <TabsTrigger value="investors" className="text-sm sm:text-base px-4 py-3">Investors</TabsTrigger>
            <TabsTrigger value="team" className="text-sm sm:text-base px-4 py-3">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              additionalData={additionalData}
              projectData={projectData}
              profile={profile}
              project={project}
              indexerProject={indexerProject || undefined}
              nostrProjectData={nostrProjectData || undefined}
              stats={stats || undefined}
              mediaData={mediaData}
              formatBTC={formatBTC}
            />
          </TabsContent>

          <TabsContent value="updates">
            <UpdatesTab updates={updates} />
          </TabsContent>

          <TabsContent value="faq">
            <FAQTab additionalData={{
              faq: (() => {
                // Handle different FAQ data structures
                if (Array.isArray(additionalData?.faq)) {
                  return additionalData.faq;
                }
                if (additionalData?.faq && typeof additionalData.faq === 'object' && 'questions' in additionalData.faq) {
                  return (additionalData.faq as { questions: { question: string; answer: string; }[] }).questions;
                }
                return [];
              })()
            }} />
          </TabsContent>

          <TabsContent value="investors">
            <InvestorsTab 
              investments={investments} 
              formatBTC={formatBTC} 
            />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab 
              additionalData={{
                members: (() => {
                  if (additionalData?.members && typeof additionalData.members === 'object') {
                    const members = additionalData.members as { team?: { pubkey: string; name?: string; role?: string; bio?: string; picture?: string; }[]; pubkeys?: string[]; };
                    return {
                      pubkeys: members.pubkeys || members.team?.map(m => m.pubkey) || [],
                      team: members.team?.map(m => ({
                        ...m,
                        role: m.role || 'Team Member'
                      })) || []
                    };
                  }
                  return { pubkeys: [], team: [] };
                })()
              }}
              TeamMemberProfile={TeamMemberProfile}
            />
          </TabsContent>
        </Tabs>

        {/* Project Comments Section */}
        <div ref={commentsRef} className="mt-8">
          <ProjectComments 
            projectId={projectId || ''} 
            nostrPubKey={nostrPubKey} 
          />
        </div>

          </div>

          {/* Investment/Zap Actions Sidebar - Responsive */}
          <SupportProject
            stats={stats || undefined}
            network={network}
            projectId={projectId || ''}
            isMiniApp={isMiniApp}
            profile={profile}
          />
        </div>


      </div>
    </div>
  );
}

function ProjectNotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Discover
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

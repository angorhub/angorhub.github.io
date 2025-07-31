import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RichContent } from '@/components/ui/RichContent';
import { Heart, MessageCircle, Star } from 'lucide-react';
import { ProjectShare } from './ProjectShare';
import type { NostrProfile, ProjectMetadata, AngorProject } from '@/types/angor';

export function ProjectHeaderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Banner Skeleton - 820×312px aspect ratio */}
      <div className="w-full aspect-[82/31] bg-muted animate-pulse rounded-xl" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          {/* Status Badge Skeleton */}
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          
          {/* Title Skeleton */}
          <div className="h-8 sm:h-10 w-3/4 bg-muted animate-pulse rounded" />
          
          {/* Creator Info Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
          
          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="hidden sm:flex space-x-4">
          <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
      
      {/* Mobile Action Buttons Skeleton */}
      <div className="flex sm:hidden space-x-3 pt-2">
        <div className="h-10 w-16 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  );
}

interface AdditionalData {
  project?: {
    projectIdentifier?: string;
    about?: string;
  };
}

interface ProjectLikes {
  userHasLiked: boolean;
  count: number;
}

interface ProjectStats {
  status?: string;
}

interface ProjectHeaderProps {
  projectData?: ProjectMetadata;
  profile?: NostrProfile;
  additionalData?: AdditionalData;
  project?: AngorProject;
  stats?: ProjectStats;
  projectLikes?: ProjectLikes;
  isLiking: boolean;
  statusColor: string;
  onLike: () => void;
  onShare: (platform: 'copy' | 'twitter' | 'facebook' | 'telegram') => void;
  onScrollToComments?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ProjectHeader({
  projectData,
  profile,
  additionalData,
  project,
  stats,
  projectLikes,
  isLiking,
  statusColor,
  onLike,
  onShare,
  onScrollToComments,
  isFavorite,
  onToggleFavorite
}: ProjectHeaderProps) {
  // Debug: Log available image sources
  console.log('ProjectHeader Debug:', {
    'projectData?.picture': projectData?.picture,
    'project?.metadata?.banner': project?.metadata?.banner,
    'project?.metadata?.picture': project?.metadata?.picture,
    'profile?.banner': profile?.banner,
    'profile?.picture': profile?.picture
  });

  return (
    <div className="space-y-6">
      {/* Compact Project Banner - 820×312px aspect ratio (2.63:1) */}
      <div className="relative w-full aspect-[82/31] rounded-xl overflow-hidden shadow-lg">
        {(projectData?.picture || project?.metadata?.banner || project?.metadata?.picture || profile?.banner || profile?.picture) ? (
          <>
            <img 
              src={projectData?.picture || project?.metadata?.banner || project?.metadata?.picture || profile?.banner || profile?.picture || ''} 
              alt={projectData?.name || project?.metadata?.name || profile?.name || 'Project banner'}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Banner image failed to load:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.banner-fallback')?.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </>
        ) : (
          /* Fallback gradient banner */
          <div className="banner-fallback w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-white text-center">

            </div>
          </div>
        )}
      </div>

      {/* Project Header Content */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap">
            <Badge variant="secondary" className={`${statusColor} text-white`}>
              {(stats?.status || 'ACTIVE').toUpperCase()}
            </Badge>
            {/* Mobile Share/Like Actions */}
            <div className="flex items-center gap-1 sm:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLike}
                disabled={isLiking}
                className={`h-10 px-2 ${
                  projectLikes?.userHasLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'hover:text-red-500'
                }`}
              >
                <Heart 
                  className={`h-4 w-4 mr-1 ${
                    projectLikes?.userHasLiked ? 'fill-current' : ''
                  } ${
                    isLiking ? 'animate-heartbeat' : ''
                  }`}
                />
                <span className="font-medium text-xs">
                  {projectLikes?.count || 0}
                </span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleFavorite}
                className={`h-10 px-2 ${
                  isFavorite 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'hover:text-yellow-500'
                }`}
              >
                <Star 
                  className={`h-4 w-4 ${
                    isFavorite ? 'fill-current' : ''
                  }`}
                />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onScrollToComments}
                className="h-10 px-2"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <ProjectShare onShare={onShare} variant="mobile" />
            </div>
          </div>


        </div>
        
        {/* Desktop Share/Like Actions */}
        <div className="hidden sm:flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLike}
            disabled={isLiking}
            className={`h-10 px-2 ${
              projectLikes?.userHasLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'hover:text-red-500'
            }`}
          >
            <Heart 
              className={`h-4 w-4 mr-1 ${
                projectLikes?.userHasLiked ? 'fill-current' : ''
              } ${
                isLiking ? 'animate-heartbeat' : ''
              }`}
            />
            <span className="font-medium text-xs">
              {projectLikes?.count || 0}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleFavorite}
            className={`h-10 px-2 ${
              isFavorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'hover:text-yellow-500'
            }`}
          >
            <Star 
              className={`h-4 w-4 ${
                isFavorite ? 'fill-current' : ''
              }`}
            />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onScrollToComments}
            className="h-10 px-2"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          <ProjectShare onShare={onShare} variant="desktop" />
        </div>
      </div>

      {/* Creator Info */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-muted">
          <AvatarImage src={profile?.picture} />
          <AvatarFallback className="text-lg font-semibold">
            {(profile?.display_name || profile?.name)?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-base sm:text-lg">
            {profile?.display_name || profile?.name || 'Anonymous Creator'}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-base sm:text-lg text-muted-foreground leading-relaxed">
        <RichContent 
          content={(projectData?.about?.trim() || profile?.about?.trim() || 'No description available')} 
          className="text-base sm:text-lg text-muted-foreground leading-relaxed"
        />
      </div>
    </div>
  );
}

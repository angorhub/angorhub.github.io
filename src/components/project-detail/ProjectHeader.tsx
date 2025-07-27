import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';
import { ProjectShare } from './ProjectShare';
import type { NostrProfile, ProjectMetadata } from '@/types/angor';

export function ProjectHeaderSkeleton() {
  return (
    <div className="space-y-4">
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
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
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
        <div className="hidden sm:flex space-x-2">
          <div className="h-10 w-16 bg-muted animate-pulse rounded" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      {/* Mobile Action Buttons Skeleton */}
      <div className="flex sm:hidden space-x-2 pt-2">
        <div className="h-10 w-16 bg-muted animate-pulse rounded flex-1" />
        <div className="h-10 w-10 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

interface ProjectLikes {
  count: number;
  userHasLiked: boolean;
}

interface AdditionalData {
  project?: {
    projectIdentifier?: string;
  };
}

interface ProjectStats {
  status?: string;
}

interface Project {
  projectIdentifier?: string;
}

interface ProjectHeaderProps {
  projectData?: ProjectMetadata;
  profile?: NostrProfile;
  additionalData?: AdditionalData;
  project?: Project;
  stats?: ProjectStats;
  projectLikes?: ProjectLikes;
  isLiking: boolean;
  statusColor: string;
  onLike: () => void;
  onShare: (platform: 'copy' | 'twitter' | 'facebook' | 'telegram') => void;
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
  onShare
}: ProjectHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className={`${statusColor} text-white`}>
              {(stats?.status || 'ACTIVE').toUpperCase()}
            </Badge>
            {/* Mobile Share/Like Actions */}
            <div className="flex items-center space-x-2 sm:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLike}
                disabled={isLiking}
                className={`${projectLikes?.userHasLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
              >
                <Heart 
                  className={`h-6 w-6 ${projectLikes?.userHasLiked ? 'fill-current' : ''}`}
                />
                <span className="text-sm font-medium ml-1">
                  {projectLikes?.count || 0}
                </span>
              </Button>
              
              <ProjectShare onShare={onShare} variant="mobile" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            {projectData?.name || profile?.name || additionalData?.project?.projectIdentifier || project?.projectIdentifier || 'Unnamed Project'}
          </h1>
        </div>
        
        {/* Desktop Share/Like Actions */}
        <div className="hidden sm:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLike}
            disabled={isLiking}
            className={`${projectLikes?.userHasLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
          >
            <Heart 
              className={`h-8 w-8 transition-all duration-200 ${
                projectLikes?.userHasLiked ? 'fill-current' : ''
              } ${
                isLiking ? 'animate-heartbeat' : ''
              }`}
            />
            <span className="text-sm font-medium">
              {projectLikes?.count || 0}
            </span>
          </Button>
          
          <ProjectShare onShare={onShare} variant="desktop" />
        </div>
      </div>

      {/* Creator Info */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={projectData?.picture || profile?.picture} />
          <AvatarFallback>
            {(projectData?.name || profile?.name)?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm sm:text-base">
            {profile?.display_name || profile?.name || 'Anonymous Creator'}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Project Creator
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
        {projectData?.about || profile?.about || 'No description available'}
      </p>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProjectBannerProps {
  bannerImage?: string;
  onBackClick: () => void;
  showMobileBackButton?: boolean;
}

export function ProjectBannerSkeleton() {
  return (
    <div className="relative h-48 sm:h-64 lg:h-80 w-full bg-muted/50 animate-pulse">
      {/* Mobile Back Button Skeleton */}
      <div className="absolute top-4 left-4 lg:hidden">
        <div className="h-8 w-16 bg-white/20 backdrop-blur-sm rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ProjectBanner({ 
  bannerImage, 
  onBackClick, 
  showMobileBackButton = true 
}: ProjectBannerProps) {
  if (!bannerImage) {
    return null;
  }

  return (
    <div className="relative h-48 sm:h-64 lg:h-80 w-full">
      <img 
        src={bannerImage}
        alt="Project banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Mobile Back Button Overlay */}
      {showMobileBackButton && (
        <div className="absolute top-4 left-4 lg:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBackClick}
            className="backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { 
  ProjectMedia,
  NostrMediaItem
} from '@/types/angor';

export function ProjectMediaGallerySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Type-safe helper to check if media has gallery
const hasGallery = (media: unknown): media is ProjectMedia & { gallery: NonNullable<ProjectMedia['gallery']> } => {
  return media != null && 
         typeof media === 'object' && 
         'gallery' in media && 
         Array.isArray((media as ProjectMedia).gallery) && 
         (media as ProjectMedia).gallery!.length > 0;
};

interface AdditionalData {
  media?: NostrMediaItem[] | ProjectMedia;
}

interface ProjectMediaGalleryProps {
  additionalData?: AdditionalData;
  mediaData?: ProjectMedia;
}

export function ProjectMediaGallery({
  additionalData,
  mediaData
}: ProjectMediaGalleryProps) {
  // Get gallery items from either source with type safety
  const getGalleryItems = () => {
    if (hasGallery(mediaData)) {
      return mediaData.gallery;
    }
    if (additionalData?.media && hasGallery(additionalData.media)) {
      return (additionalData.media as ProjectMedia).gallery;
    }
    return [];
  };

  // Don't render if no media available
  const hasMediaArray = additionalData?.media && Array.isArray(additionalData.media) && additionalData.media.length > 0;
  const hasGalleryItems = hasGallery(mediaData) || hasGallery(additionalData?.media);
  
  if (!hasMediaArray && !hasGalleryItems) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Media Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display media from Kind 30078 (additionalData.media array) */}
        {hasMediaArray ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {(additionalData!.media as NostrMediaItem[]).map((item: NostrMediaItem, index: number) => (
              <div key={index} className="bg-muted rounded-lg overflow-hidden">
                {item?.type === 'video' && item?.url ? (
                  <div className="aspect-video">
                    {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                      <iframe
                        src={item.url.replace('youtu.be/', 'youtube.com/embed/').replace('watch?v=', 'embed/')}
                        title={`Video ${index + 1}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video 
                        src={item.url} 
                        controls 
                        className="w-full h-full object-cover"
                        title={`Video ${index + 1}`}
                      />
                    )}
                  </div>
                ) : item?.type === 'image' && item?.url ? (
                  <div className="aspect-square">
                    <img 
                      src={item.url} 
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-muted-foreground font-medium">
                        {item?.type || 'Media'}
                      </div>
                      {item?.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Media
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {/* Display traditional gallery media */}
        {hasGalleryItems && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {getGalleryItems()?.map((item, index) => (
              <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-center p-4">
                  {item?.caption || `Media ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

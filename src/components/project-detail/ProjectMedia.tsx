import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface ProjectMediaSliderProps {
  media: MediaItem[];
  className?: string;
}

export function ProjectMediaSliderSkeleton() {
  return (
    <div className="w-full mb-8">
      <div className="relative aspect-video bg-muted animate-pulse rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded-full animate-pulse" />
        </div>
        
        {/* Navigation buttons skeleton */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <div className="w-10 h-10 bg-muted-foreground/20 rounded-full animate-pulse" />
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="w-10 h-10 bg-muted-foreground/20 rounded-full animate-pulse" />
        </div>
        
        {/* Indicators skeleton */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-muted-foreground/20 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectMediaSlider({ media, className = "" }: ProjectMediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!media || media.length === 0) {
    return null;
  }

  const currentMedia = media[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`w-full mb-8 ${className}`}>
      <div className="relative group">
        {/* Main Media Display */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt || `Project media ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : currentMedia.type === 'youtube' ? (
            // YouTube iframe
            (() => {
              const getYouTubeVideoId = (url: string) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return match && match[2].length === 11 ? match[2] : null;
              };
              
              const videoId = getYouTubeVideoId(currentMedia.url);
              
              if (videoId) {
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allowFullScreen
                    title={currentMedia.alt || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                );
              } else {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Invalid YouTube URL</p>
                  </div>
                );
              }
            })()
          ) : (
            // Regular video
            <video
              ref={videoRef}
              src={currentMedia.url}
              poster={currentMedia.thumbnail}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              loop
              playsInline
            />
          )}

          {/* Video Controls Overlay - Only for regular videos, not YouTube */}
          {currentMedia.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Media Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge 
              variant="secondary" 
              className="bg-black/50 backdrop-blur-sm text-white border-0 capitalize"
            >
              {currentMedia.type}
            </Badge>
          </div>

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Slide Counter */}
          {media.length > 1 && (
            <div className="absolute top-4 right-4">
              <Badge 
                variant="secondary" 
                className="bg-black/50 backdrop-blur-sm text-white border-0"
              >
                {currentIndex + 1} / {media.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Slide Indicators */}
        {media.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary scale-110'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail Navigation for Mobile */}
        {media.length > 1 && (
          <div className="flex md:hidden mt-4 space-x-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-primary scale-110'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'youtube' ? (
                  // YouTube thumbnail
                  (() => {
                    const getYouTubeVideoId = (url: string) => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                      const match = url.match(regExp);
                      return match && match[2].length === 11 ? match[2] : null;
                    };
                    
                    const videoId = getYouTubeVideoId(item.url);
                    
                    if (videoId) {
                      return (
                        <div className="relative w-full h-full">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt={`YouTube thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-3 w-3 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Play className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    }
                  })()
                ) : (
                  // Regular video
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

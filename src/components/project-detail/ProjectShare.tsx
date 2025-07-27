import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Share2,
  Copy,
  Twitter,
  Facebook,
  MessageCircle
} from 'lucide-react';

interface ProjectShareProps {
  onShare: (platform: 'copy' | 'twitter' | 'facebook' | 'telegram') => void;
  variant?: 'mobile' | 'desktop';
}

export function ProjectShare({ onShare, variant = 'desktop' }: ProjectShareProps) {
  const isMobile = variant === 'mobile';
  const iconSize = isMobile ? 'h-6 w-6' : 'h-8 w-8';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={isMobile ? undefined : "w-48"}>
        <DropdownMenuItem onClick={() => onShare('copy')}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        {!isMobile && (
          <>
            <DropdownMenuItem onClick={() => onShare('facebook')}>
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare('telegram')}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on Telegram
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

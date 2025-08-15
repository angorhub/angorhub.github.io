import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ExternalLink, 
  Twitter, 
  Github, 
  MessageCircle, 
  Linkedin, 
  Youtube, 
  Facebook, 
  Instagram,
  Globe,
  Link2
} from 'lucide-react';
import type { ProjectLink } from '@/types/angor';

interface ProjectLinksProps {
  links?: ProjectLink[];
}

// Icon mapping for different link types
const getIconForLinkType = (type: ProjectLink['type']) => {
  const iconProps = { size: 16, className: "shrink-0" };
  
  switch (type) {
    case 'twitter':
      return <Twitter {...iconProps} />;
    case 'github':
      return <Github {...iconProps} />;
    case 'telegram':
      return <MessageCircle {...iconProps} />;
    case 'discord':
      return <MessageCircle {...iconProps} />;
    case 'linkedin':
      return <Linkedin {...iconProps} />;
    case 'youtube':
      return <Youtube {...iconProps} />;
    case 'facebook':
      return <Facebook {...iconProps} />;
    case 'instagram':
      return <Instagram {...iconProps} />;
    case 'mastodon':
      return <MessageCircle {...iconProps} />;
    case 'website':
      return <Globe {...iconProps} />;
    default:
      return <Link2 {...iconProps} />;
  }
};

// Display name mapping for different link types
const getDisplayNameForLinkType = (type: ProjectLink['type']) => {
  switch (type) {
    case 'twitter':
      return 'Twitter / X';
    case 'github':
      return 'GitHub';
    case 'telegram':
      return 'Telegram';
    case 'discord':
      return 'Discord';
    case 'linkedin':
      return 'LinkedIn';
    case 'youtube':
      return 'YouTube';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'mastodon':
      return 'Mastodon';
    case 'website':
      return 'Website';
    default:
      return 'Link';
  }
};

// Color variants for different link types
const getColorForLinkType = (type: ProjectLink['type']): string => {
  switch (type) {
    case 'twitter':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'github':
      return 'bg-gray-800 hover:bg-gray-900 text-white';
    case 'telegram':
      return 'bg-blue-400 hover:bg-blue-500 text-white';
    case 'discord':
      return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    case 'linkedin':
      return 'bg-blue-700 hover:bg-blue-800 text-white';
    case 'youtube':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'facebook':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'instagram':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white';
    case 'mastodon':
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    case 'website':
      return 'bg-green-600 hover:bg-green-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

export function ProjectLinks({ links }: ProjectLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  // Group links by type for better organization
  const socialMediaTypes = ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'mastodon'];
  const communicationTypes = ['telegram', 'discord'];
  const developerTypes = ['github'];
  const websiteTypes = ['website'];
  
  const socialLinks = links.filter(link => socialMediaTypes.includes(link.type || 'other'));
  const communicationLinks = links.filter(link => communicationTypes.includes(link.type || 'other'));
  const developerLinks = links.filter(link => developerTypes.includes(link.type || 'other'));
  const websiteLinks = links.filter(link => websiteTypes.includes(link.type || 'other'));
  const otherLinks = links.filter(link => 
    ![...socialMediaTypes, ...communicationTypes, ...developerTypes, ...websiteTypes].includes(link.type || 'other')
  );

  const LinkButton = ({ link }: { link: ProjectLink }) => (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={`${getColorForLinkType(link.type)} border-0 transition-all duration-200 hover:scale-105`}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm"
        title={link.description || link.title || link.url}
      >
        {getIconForLinkType(link.type)}
        <span className="truncate max-w-[120px]">
          {link.title || getDisplayNameForLinkType(link.type)}
        </span>
        <ExternalLink size={12} className="opacity-75" />
      </a>
    </Button>
  );

  const LinkSection = ({ title, links: sectionLinks, variant = "default" }: { 
    title: string; 
    links: ProjectLink[]; 
    variant?: "default" | "badge" 
  }) => {
    if (sectionLinks.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {sectionLinks.map((link, index) => (
            variant === "badge" ? (
              <Badge
                key={index}
                variant="secondary"
                className="hover:bg-accent cursor-pointer transition-colors"
                asChild
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                  title={link.description || link.title || link.url}
                >
                  {getIconForLinkType(link.type)}
                  <span className="text-xs truncate max-w-[100px]">
                    {link.title || getDisplayNameForLinkType(link.type)}
                  </span>
                  <ExternalLink size={10} className="opacity-75" />
                </a>
              </Badge>
            ) : (
              <LinkButton key={index} link={link} />
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Project Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Website Links - Most prominent */}
        <LinkSection title="Website" links={websiteLinks} />
        
        {/* Social Media Links */}
        <LinkSection title="Social Media" links={socialLinks} />
        
        {/* Communication Links */}
        <LinkSection title="Community" links={communicationLinks} />
        
        {/* Developer Links */}
        <LinkSection title="Development" links={developerLinks} />
        
        {/* Other Links - Use badges for miscellaneous links */}
        <LinkSection title="Other Resources" links={otherLinks} variant="badge" />
        
        {/* Show all links in a compact view if there are many */}
        {links.length > 8 && (
          <div className="pt-2 border-t">
            <details className="group">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                View all links ({links.length})
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm transition-colors"
                    title={link.description || link.title || link.url}
                  >
                    {getIconForLinkType(link.type)}
                    <span className="truncate flex-1">
                      {link.title || link.url}
                    </span>
                    <ExternalLink size={12} className="opacity-50" />
                  </a>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectLinksCompact({ links }: ProjectLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  // Show only the most important links in compact view
  const priorityLinks = links.slice(0, 4);

  return (
    <div className="flex flex-wrap gap-2">
      {priorityLinks.map((link, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2 text-xs"
        >
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5"
            title={link.description || link.title || link.url}
          >
            {getIconForLinkType(link.type)}
            <span className="truncate max-w-[80px]">
              {link.title || getDisplayNameForLinkType(link.type)}
            </span>
          </a>
        </Button>
      ))}
      {links.length > 4 && (
        <Badge variant="outline" className="h-8 px-2 text-xs">
          +{links.length - 4} more
        </Badge>
      )}
    </div>
  );
}

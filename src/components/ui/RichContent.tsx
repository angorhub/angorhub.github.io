import { ExternalLink, Play } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { nip19 } from 'nostr-tools';

// Helper function to convert npub to hex pubkey
function npubToHex(npub: string): string | null {
  try {
    const decoded = nip19.decode(npub);
    if (decoded.type === 'npub') {
      return decoded.data;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper function to extract pubkey from nprofile
function nprofileToHex(nprofile: string): string | null {
  try {
    const decoded = nip19.decode(nprofile);
    if (decoded.type === 'nprofile') {
      return decoded.data.pubkey;
    }
    return null;
  } catch {
    return null;
  }
}

// Component for rendering npub with user name
function NpubDisplay({ npub }: { npub: string }) {
  const hexPubkey = npubToHex(npub);
  const { data: authorData, isLoading } = useAuthor(hexPubkey || undefined);
  
  // Display name priority: display_name > name > shortened npub
  const displayName = authorData?.metadata?.display_name || 
                     authorData?.metadata?.name;
  
  const yakihonneUrl = `https://yakihonne.com/users/${npub}`;
  
  return (
    <a
      href={yakihonneUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="nostr-id"
      title={`Open ${displayName || `User ${npub.slice(4, 12)}...`} profile in Yakihonne`}
    >
      {isLoading ? (
        <span className="opacity-70">{`@${npub.slice(4, 12)}...`}</span>
      ) : displayName ? (
        `@${displayName}`
      ) : (
        `@${npub.slice(4, 12)}...`
      )}
    </a>
  );
}

// Component for rendering nprofile with user name
function NprofileDisplay({ nprofile }: { nprofile: string }) {
  const hexPubkey = nprofileToHex(nprofile);
  const { data: authorData, isLoading } = useAuthor(hexPubkey || undefined);
  
  // Display name priority: display_name > name > shortened nprofile
  const displayName = authorData?.metadata?.display_name || 
                     authorData?.metadata?.name;
  
  const yakihonneUrl = `https://yakihonne.com/users/${nprofile}`;
  
  return (
    <a
      href={yakihonneUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="nostr-id"
      title={`Open ${displayName || `User ${nprofile.slice(8, 16)}...`} profile in Yakihonne`}
    >
      {isLoading ? (
        <span className="opacity-70">{`@${nprofile.slice(8, 16)}...`}</span>
      ) : displayName ? (
        `@${displayName}`
      ) : (
        `@${nprofile.slice(8, 16)}...`
      )}
    </a>
  );
}

// Enhanced content parser for Nostr messages and text content
function parseContent(content: string) {
  const elements: Array<{ type: string; content: string; url?: string }> = [];
  
  // Regex patterns
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  const videoRegex = /\.(mp4|webm|ogg|mov)$/i;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const nostrRegex = /(npub1[a-zA-Z0-9]{58}|note1[a-zA-Z0-9]{58}|nevent1[a-zA-Z0-9]+|nprofile1[a-zA-Z0-9]+)/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  // Find all URLs first
  const urls: Array<{ url: string; start: number; end: number; type: string }> = [];
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0];
    let type = 'link';
    
    if (imageRegex.test(url)) {
      type = 'image';
    } else if (videoRegex.test(url)) {
      type = 'video';
    } else if (youtubeRegex.test(url)) {
      type = 'youtube';
    }
    
    urls.push({
      url,
      start: match.index,
      end: match.index + url.length,
      type
    });
  }
  
  // Find all Nostr IDs
  const nostrIds: Array<{ id: string; start: number; end: number; type: string }> = [];
  urlRegex.lastIndex = 0; // Reset regex
  while ((match = nostrRegex.exec(content)) !== null) {
    // Make sure this Nostr ID is not part of a URL
    const isPartOfUrl = urls.some(url => 
      match!.index >= url.start && match!.index < url.end
    );
    
    if (!isPartOfUrl) {
      const nostrId = match[0];
      let nostrType = 'nostr';
      
      // Determine the type of Nostr ID
      if (nostrId.startsWith('npub1')) {
        nostrType = 'npub';
      } else if (nostrId.startsWith('note1')) {
        nostrType = 'note';
      } else if (nostrId.startsWith('nevent1')) {
        nostrType = 'nevent';
      } else if (nostrId.startsWith('nprofile1')) {
        nostrType = 'nprofile';
      }
      
      nostrIds.push({
        id: nostrId,
        start: match.index,
        end: match.index + nostrId.length,
        type: nostrType
      });
    }
  }
  
  // Combine and sort all matches
  type UrlMatch = { matchType: 'url'; url: string; start: number; end: number; type: string };
  type NostrMatch = { matchType: 'nostr'; id: string; start: number; end: number; type: string };
  
  const allMatches: Array<UrlMatch | NostrMatch> = [
    ...urls.map(u => ({ ...u, matchType: 'url' as const })),
    ...nostrIds.map(n => ({ ...n, matchType: 'nostr' as const }))
  ].sort((a, b) => a.start - b.start);
  
  // Build elements array
  lastIndex = 0;
  for (const match of allMatches) {
    // Add text before this match
    if (match.start > lastIndex) {
      const textContent = content.slice(lastIndex, match.start);
      if (textContent.trim()) {
        elements.push({ type: 'text', content: textContent });
      }
    }
    
    // Add the match
    if (match.matchType === 'url') {
      elements.push({ type: match.type, content: match.url, url: match.url });
    } else {
      elements.push({ type: 'nostr', content: match.id, url: match.type });
    }
    
    lastIndex = match.end;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      elements.push({ type: 'text', content: textContent });
    }
  }
  
  return elements;
}

interface RichContentProps {
  content: string;
  className?: string;
}

export function RichContent({ content, className = "" }: RichContentProps) {
  const elements = parseContent(content);
  
  return (
    <div className={`rich-content ${className}`}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'text':
            return (
              <span key={index} className="whitespace-pre-wrap">
                {element.content}
              </span>
            );
            
          case 'link':
            return (
              <a
                key={index}
                href={element.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                {element.content}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
            
          case 'image':
            return (
              <div key={index} className="my-2">
                <img
                  src={element.url}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg"
                  onError={(e) => {
                    // Fallback to link if image fails to load
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<a href="${element.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:underline">${element.url} <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`;
                    }
                  }}
                />
              </div>
            );
            
          case 'video':
            return (
              <div key={index} className="my-2">
                <video
                  src={element.url}
                  controls
                  className="max-w-full h-auto rounded-lg"
                  onError={(e) => {
                    // Fallback to link if video fails to load
                    const target = e.target as HTMLVideoElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<a href="${element.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:underline">${element.url} <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z"></path></svg></a>`;
                    }
                  }}
                />
              </div>
            );
            
          case 'youtube': {
            const youtubeId = element.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
            if (youtubeId) {
              return (
                <div key={index} className="my-2">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title="YouTube video"
                    />
                  </div>
                </div>
              );
            }
            return (
              <a
                key={index}
                href={element.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Play className="h-3 w-3" />
                {element.content}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          }
            
          case 'nostr': {
            // Generate appropriate yakihonne.com URL based on Nostr ID type
            const nostrType = element.url; // We stored the type in the url field
            
            // Special handling for npub and nprofile - show user name instead of raw string
            if (nostrType === 'npub') {
              return <NpubDisplay key={index} npub={element.content} />;
            }
            
            if (nostrType === 'nprofile') {
              return <NprofileDisplay key={index} nprofile={element.content} />;
            }
            
            // For other Nostr ID types, use the existing logic
            let yakihonneUrl = '';
            
            switch (nostrType) {
              case 'note':
                yakihonneUrl = `https://yakihonne.com/notes/${element.content}`;
                break;
              case 'nevent':
                yakihonneUrl = `https://yakihonne.com/events/${element.content}`;
                break;
              default:
                yakihonneUrl = `https://yakihonne.com/nostr/${element.content}`;
            }
            
            return (
              <a
                key={index}
                href={yakihonneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nostr-id"
                title={`Open ${nostrType} in Yakihonne: ${element.content}`}
              >
                {element.content.slice(0, 16)}...
              </a>
            );
          }
            
          default:
            return <span key={index}>{element.content}</span>;
        }
      })}
    </div>
  );
}

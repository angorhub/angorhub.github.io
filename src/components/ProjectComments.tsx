import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useNostr } from '@/hooks/useNostr';
import { useAuthor } from '@/hooks/useAuthor';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, 
  Send, 
  Reply,
  MoreHorizontal,
  Trash2,
  Edit3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { NUser } from '@nostrify/react/login';

interface NostrComment {
  id: string;
  content: string;
  created_at: number;
  pubkey: string;
  tags: string[][];
  replyTo?: string;
  likes?: number;
  userHasLiked?: boolean;
}

interface ProjectCommentsProps {
  projectId: string;
  nostrPubKey?: string;
}

export function ProjectComments({ projectId, nostrPubKey }: ProjectCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const { user, metadata } = useCurrentUser();
  const { mutate: publishEvent } = useNostrPublish();
  const { nostr } = useNostr();
  const { toast } = useToast();

  // Fetch comments for this project
  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ['projectComments', projectId, nostrPubKey],
    queryFn: async () => {
      if (!nostrPubKey && !projectId) return [];
      
      try {
        const signal = AbortSignal.timeout(10000);
        const events = await nostr.query([
          {
            kinds: [1], // Text notes
            '#t': [`angor:project:${projectId}`], // Tagged with project
            limit: 100
          },
          // Also get comments tagged with the project's nostr pubkey
          ...(nostrPubKey ? [{
            kinds: [1],
            '#p': [nostrPubKey],
            limit: 100
          }] : [])
        ], { signal });

        // Process and sort comments
        const processedComments: NostrComment[] = events
          .filter(event => event.content.trim().length > 0)
          .map(event => ({
            id: event.id,
            content: event.content,
            created_at: event.created_at,
            pubkey: event.pubkey,
            tags: event.tags,
            replyTo: event.tags.find(tag => tag[0] === 'e')?.[1],
          }))
          .sort((a, b) => b.created_at - a.created_at);

        return processedComments;
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        return [];
      }
    },
    enabled: !!(projectId || nostrPubKey),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login with your Nostr account to comment",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please write something before posting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = [
        ['t', `angor:project:${projectId}`], // Tag with project
      ];

      // Add project creator reference if available
      if (nostrPubKey) {
        tags.push(['p', nostrPubKey]);
      }

      publishEvent({
        kind: 1,
        content: newComment.trim(),
        created_at: Math.floor(Date.now() / 1000),
        tags
      });

      setNewComment('');
      
      // Refetch comments after a short delay
      setTimeout(() => {
        refetch();
      }, 1000);

      toast({
        title: "Comment Posted! 💬",
        description: "Your comment has been published",
      });
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: "Comment Failed",
        description: "Could not post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to reply",
        variant: "destructive"
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please write something before replying",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = [
        ['e', commentId], // Reply to specific comment
        ['t', `angor:project:${projectId}`],
      ];

      if (nostrPubKey) {
        tags.push(['p', nostrPubKey]);
      }

      publishEvent({
        kind: 1,
        content: replyContent.trim(),
        created_at: Math.floor(Date.now() / 1000),
        tags
      });

      setReplyContent('');
      setReplyTo(null);
      
      setTimeout(() => {
        refetch();
      }, 1000);

      toast({
        title: "Reply Posted! 💬",
        description: "Your reply has been published",
      });
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast({
        title: "Reply Failed",
        description: "Could not post reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group comments by thread (main comments vs replies)
  const mainComments = comments.filter(comment => !comment.replyTo);
  const replies = comments.filter(comment => comment.replyTo);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          <span>Project Discussion</span>
          <Badge variant="secondary" className="text-xs">
            {comments.length} comments
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comment Input */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={metadata?.picture} />
              <AvatarFallback className="text-xs">
                {metadata?.display_name?.charAt(0) || metadata?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={user ? "Share your thoughts about this project..." : "Login to join the discussion"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!user || isSubmitting}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {newComment.length}/500 characters
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!user || !newComment.trim() || isSubmitting}
                  size="sm"
                  className="h-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="font-medium text-muted-foreground">No comments yet</div>
              <div className="text-sm text-muted-foreground">
                Be the first to share your thoughts!
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mainComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={replies.filter(reply => reply.replyTo === comment.id)}
                  onReply={(commentId) => setReplyTo(commentId)}
                  replyTo={replyTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={handleReply}
                  isSubmitting={isSubmitting}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Individual Comment Component
function CommentItem({ 
  comment, 
  replies, 
  onReply, 
  replyTo, 
  replyContent, 
  setReplyContent, 
  onSubmitReply, 
  isSubmitting,
  currentUser
}: {
  comment: NostrComment;
  replies: NostrComment[];
  onReply: (commentId: string) => void;
  replyTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (commentId: string) => void;
  isSubmitting: boolean;
  currentUser: NUser | undefined;
}) {
  const author = useAuthor(comment.pubkey);
  const metadata = author.data?.metadata;
  const isOwn = currentUser?.pubkey === comment.pubkey;

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={metadata?.picture} />
          <AvatarFallback className="text-xs">
            {metadata?.display_name?.charAt(0) || metadata?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {metadata?.display_name || metadata?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(comment.created_at)}
            </span>
            {isOwn && (
              <Badge variant="outline" className="text-xs h-4">
                You
              </Badge>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={comment.content} />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="h-6 px-2 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {replies.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        </div>

        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs">
                <Edit3 className="h-3 w-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-red-600">
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Reply Input */}
      {replyTo === comment.id && (
        <div className="ml-11 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
            maxLength={300}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {replyContent.length}/300 characters
            </div>
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onReply('');
                  setReplyContent('');
                }}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSubmitReply(comment.id)}
                disabled={!replyContent.trim() || isSubmitting}
                size="sm"
                className="h-7 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    Replying...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
          {replies.map((reply) => (
            <CommentReply key={reply.id} comment={reply} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}

// Reply Component
function CommentReply({ comment, currentUser }: { comment: NostrComment; currentUser: NUser | undefined }) {
  const author = useAuthor(comment.pubkey);
  const metadata = author.data?.metadata;
  const isOwn = currentUser?.pubkey === comment.pubkey;

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage src={metadata?.picture} />
        <AvatarFallback className="text-xs">
          {metadata?.display_name?.charAt(0) || metadata?.name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-xs">
            {metadata?.display_name || metadata?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(comment.created_at)}
          </span>
          {isOwn && (
            <Badge variant="outline" className="text-xs h-3 px-1">
              You
            </Badge>
          )}
        </div>
        
        <div className="prose prose-xs max-w-none">
          <MarkdownRenderer content={comment.content} />
        </div>
      </div>
    </div>
  );
}

// Skeleton Component
function CommentSkeleton() {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

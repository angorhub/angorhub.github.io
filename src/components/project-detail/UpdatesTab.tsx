import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function UpdatesTabSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface Update {
  id: string;
  content: string;
  created_at: number;
}

interface UpdatesTabProps {
  updates?: Update[];
}

// Helper function for safe date formatting
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

export function UpdatesTab({ updates }: UpdatesTabProps) {
  return (
    <div className="space-y-6">
      {updates && updates.length > 0 ? (
        updates.map((update, index) => (
          <Card key={update.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                <CardTitle className="text-lg sm:text-xl">Update #{index + 1}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {safeFormatDistanceToNow(update.created_at)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{update.content}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Updates Yet</h3>
            <p className="text-muted-foreground">
              The project creator hasn't posted any updates yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function InvestorsTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface Investment {
  investorPublicKey: string;
  timeInvested: number;
  totalAmount: number;
  isSeeder: boolean;
}

interface InvestorsTabProps {
  investments?: Investment[];
  formatBTC: (sats: number | undefined) => string;
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

export function InvestorsTab({ investments, formatBTC }: InvestorsTabProps) {
  return (
    <div className="space-y-6">
      {investments && investments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Project Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.slice(0, 10).map((investment, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {investment.investorPublicKey.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {investment.investorPublicKey.slice(0, 8)}...{investment.investorPublicKey.slice(-8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {safeFormatDistanceToNow(investment.timeInvested)}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-medium">{formatBTC(investment.totalAmount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {investment.isSeeder && <Badge variant="secondary">Seeder</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Investors Yet</h3>
            <p className="text-muted-foreground">
              Be the first to invest in this project!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

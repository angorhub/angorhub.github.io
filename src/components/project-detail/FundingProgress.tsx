import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function FundingProgressSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="h-6 sm:h-8 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface FundingProgressProps {
  completionPercentage: number;
  formatBTC: (sats: number | undefined) => string;
  formatAmount: (amount: number | undefined) => string;
  amountInvested: number;
  targetAmount: number;
  investorCount: number;
  timeRemaining: string;
}

export function FundingProgress({
  completionPercentage,
  formatBTC,
  formatAmount,
  amountInvested,
  targetAmount,
  investorCount,
  timeRemaining
}: FundingProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Funding Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3 sm:h-4" />
        </div>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {formatBTC(amountInvested)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Raised</div>
            <div className="text-xs text-muted-foreground">
              {formatAmount(amountInvested)} sats
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold">
              {formatBTC(targetAmount)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Goal</div>
            <div className="text-xs text-muted-foreground">
              {formatAmount(targetAmount)} sats
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {investorCount}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Investors</div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-orange-600 truncate">
              {timeRemaining}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Time Left</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

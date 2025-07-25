import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Users, Bitcoin } from 'lucide-react';
import type { AngorProject } from '@/types/angor';
import { useProjectsStatistics } from '@/hooks/useProjectsStatistics';
import { useNetwork } from '@/contexts/NetworkContext';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';

interface ProjectsStatisticsProps {
  projects: AngorProject[];
  isLoading?: boolean;
}

export function ProjectsStatistics({ 
  projects, 
  isLoading = false
}: ProjectsStatisticsProps) {
  
  // Get current network
  const { network } = useNetwork();
  
  // Get Bitcoin price from mempool.space
  const { data: bitcoinPrice, isLoading: priceLoading, error: priceError } = useBitcoinPrice();
  
  // Use the new hook to get comprehensive statistics
  const statistics = useProjectsStatistics({ 
    projects, 
    enabled: !isLoading 
  });

  if (isLoading || statistics.isLoading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-border shadow-sm py-0">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-3 bg-muted animate-pulse rounded w-16 sm:w-20"></div>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-5 sm:h-6 bg-muted animate-pulse rounded w-12 sm:w-16 mb-1"></div>
                <div className="h-3 bg-muted/70 animate-pulse rounded w-8 sm:w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Ultra Compact Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Projects */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200 py-0">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Projects</p>
              <Target className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-base sm:text-xl font-bold">{statistics.totalProjects}</p>
          </CardContent>
        </Card>

        {/* Total Funding */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200 py-0">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Raised</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-base sm:text-xl font-bold">
              {statistics.formatted.totalRaised} {network === 'mainnet' ? 'BTC' : 'TBTC'}
            </p>
          </CardContent>
        </Card>

        {/* Total Investors */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200 py-0">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Investors</p>
              <Users className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-base sm:text-xl font-bold">{statistics.formatted.totalInvestorsShort}</p>
          </CardContent>
        </Card>

        {/* Bitcoin Price */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200 py-0">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {network === 'mainnet' ? 'BTC Price' : 'Testnet'}
              </p>
              <Bitcoin className="h-4 w-4 text-muted-foreground/60" />
            </div>
            {network === 'testnet' ? (
              <p className="text-base sm:text-xl font-bold">TBTC</p>
            ) : priceLoading ? (
              <div className="h-5 sm:h-6 bg-muted rounded w-16 animate-pulse"></div>
            ) : priceError ? (
              <p className="text-base sm:text-xl font-bold text-red-500">Error</p>
            ) : bitcoinPrice ? (
              <p className="text-base sm:text-xl font-bold">
                ${bitcoinPrice.USD.toLocaleString()}
              </p>
            ) : (
              <p className="text-base sm:text-xl font-bold text-muted-foreground">N/A</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

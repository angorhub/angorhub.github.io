import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Activity, 
  Globe, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useIndexerTesting } from '@/hooks/useIndexerTesting';
import { IndexerTestingService } from '@/services/indexerTesting';
import { useToast } from '@/hooks/useToast';
import { useNetwork } from '@/contexts/NetworkContext';
import type { IndexerTestResult } from '@/services/indexerTesting';

interface IndexerStatusCardProps {
  className?: string;
}

export function IndexerStatusCard({ className = '' }: IndexerStatusCardProps) {
  const { network } = useNetwork();
  const { toast } = useToast();
  const {
    healthStatus,
    isLoading,
    error,
    testAllIndexers,
    testSingleIndexer,
    lastUpdate
  } = useIndexerTesting();

  const [testingIndividual, setTestingIndividual] = useState<Set<string>>(new Set());

  const handleTestSingleIndexer = async (url: string) => {
    setTestingIndividual(prev => new Set([...prev, url]));
    
    try {
      const result = await testSingleIndexer(url);
      toast({
        title: result.isOnline ? "Connection successful" : "Connection failed",
        description: result.isOnline 
          ? `Indexer responded in ${IndexerTestingService.formatResponseTime(result.responseTime)}` 
          : result.error || "Indexer is not responding",
        variant: result.isOnline ? "default" : "destructive"
      });
    } catch (err) {
      toast({
        title: "Test failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setTestingIndividual(prev => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  };

  const handleTestAllIndexers = async () => {
    try {
      await testAllIndexers();
      toast({
        title: "Indexer testing complete",
        description: "All indexers have been tested and results updated",
      });
    } catch (err) {
      toast({
        title: "Testing failed",
        description: err instanceof Error ? err.message : "Failed to test indexers",
        variant: "destructive"
      });
    }
  };

  const getHealthStatusDisplay = () => {
    if (!healthStatus) return { text: 'Unknown', color: 'bg-gray-500', icon: Globe };
    
    switch (healthStatus.overallHealth) {
      case 'healthy':
        return { text: 'Healthy', color: 'bg-green-500', icon: CheckCircle };
      case 'degraded':
        return { text: 'Degraded', color: 'bg-yellow-500', icon: AlertTriangle };
      case 'critical':
        return { text: 'Critical', color: 'bg-red-500', icon: XCircle };
      default:
        return { text: 'Unknown', color: 'bg-gray-500', icon: Globe };
    }
  };

  const renderIndexerResult = (result: IndexerTestResult) => {
    const isPrimary = healthStatus?.primaryIndexer === result.url;
    
    return (
      <div
        key={result.url}
        className={`p-4 border rounded-lg space-y-3 ${
          isPrimary ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${
                result.isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <p className="font-medium truncate text-sm">{result.url}</p>
              {isPrimary && (
                <Badge variant="default" className="text-xs">Primary</Badge>
              )}
            </div>
            
            {result.isOnline ? (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Online • {IndexerTestingService.formatResponseTime(result.responseTime)}
              </p>
            ) : (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline • {result.error || 'No response'}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestSingleIndexer(result.url)}
              disabled={testingIndividual.has(result.url)}
              className="text-xs px-2 py-1 h-7"
            >
              {testingIndividual.has(result.url) ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Activity className="w-3 h-3" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(result.url, '_blank')}
              className="text-xs px-2 py-1 h-7"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Endpoint Status */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            result.endpoints.heartbeat ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {result.endpoints.heartbeat ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Heartbeat
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            result.endpoints.stats ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {result.endpoints.stats ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Stats
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            result.endpoints.projects ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {result.endpoints.projects ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Projects
          </div>
        </div>

        {/* Last Tested */}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Tested {new Date(result.lastTested).toLocaleTimeString()}
        </p>
      </div>
    );
  };

  const healthDisplay = getHealthStatusDisplay();
  const onlineCount = healthStatus?.results.filter(r => r.isOnline).length || 0;
  const totalCount = healthStatus?.results.length || 0;
  const healthPercentage = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            <div>
              <CardTitle className="text-lg">Indexer Status</CardTitle>
              <CardDescription>
                Network: {network} • {onlineCount}/{totalCount} online
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${healthDisplay.color}`}>
              <healthDisplay.icon className="w-3 h-3" />
              {healthDisplay.text}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestAllIndexers}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Health Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Health</span>
            <span>{Math.round(healthPercentage)}%</span>
          </div>
          <Progress 
            value={healthPercentage} 
            className={`h-2 ${
              healthPercentage === 100 ? '[&>div]:bg-green-500' :
              healthPercentage > 50 ? '[&>div]:bg-yellow-500' :
              '[&>div]:bg-red-500'
            }`}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Testing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && !healthStatus && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Testing indexers...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {healthStatus && (
          <>
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Indexer Details</h4>
                {lastUpdate && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                {healthStatus.results.map(renderIndexerResult)}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!healthStatus && !isLoading && !error && (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Test Results</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run a test to check indexer health and connectivity
            </p>
            <Button onClick={handleTestAllIndexers}>
              <Activity className="w-4 h-4 mr-2" />
              Test All Indexers
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

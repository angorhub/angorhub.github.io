import { useState, useEffect, useCallback } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { useIndexer } from '@/contexts/IndexerContext';
import { IndexerTestingService } from '@/services/indexerTesting';
import type { IndexerHealthStatus, IndexerTestResult } from '@/services/indexerTesting';

interface UseIndexerTestingReturn {
  healthStatus: IndexerHealthStatus | null;
  isLoading: boolean;
  error: string | null;
  testAllIndexers: () => Promise<void>;
  testSingleIndexer: (url: string) => Promise<IndexerTestResult>;
  testPrimaryIndexer: () => Promise<IndexerTestResult>;
  refreshStatus: () => Promise<void>;
  lastUpdate: number | null;
}

export function useIndexerTesting(): UseIndexerTestingReturn {
  const { network } = useNetwork();
  const { indexers } = useIndexer();
  
  const [healthStatus, setHealthStatus] = useState<IndexerHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  // Load cached results on mount and network change
  useEffect(() => {
    const loadCachedResults = () => {
      const cached = IndexerTestingService.getCachedResults(network);
      if (cached) {
        setHealthStatus(cached);
        setLastUpdate(cached.lastUpdated);
      }
    };

    loadCachedResults();
  }, [network]);

  // Test all indexers for current network
  const testAllIndexers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const indexerUrls = indexers[network].map(indexer => indexer.url);
      const status = await IndexerTestingService.testAndCacheIndexers(network, indexerUrls);
      
      setHealthStatus(status);
      setLastUpdate(status.lastUpdated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test indexers';
      setError(errorMessage);
      console.error('Indexer testing failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [network, indexers]);

  // Test a single indexer
  const testSingleIndexer = useCallback(async (url: string): Promise<IndexerTestResult> => {
    try {
      const result = await IndexerTestingService.testSingleIndexer(url);
      
      // Update the result in current health status if available
      if (healthStatus) {
        const updatedResults = healthStatus.results.map(existing => 
          existing.url === result.url ? result : existing
        );
        
        // If this is a new indexer, add it
        if (!updatedResults.find(r => r.url === result.url)) {
          updatedResults.push(result);
        }
        
        const updatedStatus: IndexerHealthStatus = {
          ...healthStatus,
          results: updatedResults,
          lastUpdated: Date.now()
        };
        
        setHealthStatus(updatedStatus);
        IndexerTestingService.cacheResults(updatedStatus);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test indexer';
      throw new Error(errorMessage);
    }
  }, [healthStatus]);

  // Test just the primary indexer
  const testPrimaryIndexer = useCallback(async (): Promise<IndexerTestResult> => {
    return IndexerTestingService.testPrimaryIndexer(network);
  }, [network]);

  // Refresh status (force refresh)
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const indexerUrls = indexers[network].map(indexer => indexer.url);
      const status = await IndexerTestingService.testAndCacheIndexers(network, indexerUrls);
      
      setHealthStatus(status);
      setLastUpdate(status.lastUpdated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh indexer status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [network, indexers]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && healthStatus) {
        const timeSinceLastUpdate = Date.now() - healthStatus.lastUpdated;
        // Auto refresh if more than 5 minutes old
        if (timeSinceLastUpdate > 5 * 60 * 1000) {
          refreshStatus();
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [refreshStatus, isLoading, healthStatus]);

  return {
    healthStatus,
    isLoading,
    error,
    testAllIndexers,
    testSingleIndexer,
    testPrimaryIndexer,
    refreshStatus,
    lastUpdate
  };
}

import { getPrimaryIndexerUrl, ANGOR_INDEXER_CONFIG } from '@/types/angor';
import type { NetworkType } from '@/contexts/NetworkContext';

export interface IndexerTestResult {
  url: string;
  isOnline: boolean;
  responseTime: number;
  status: number | null;
  error?: string;
  endpoints: {
    heartbeat: boolean;
    stats: boolean;
    projects: boolean;
  };
  lastTested: number;
}

export interface IndexerHealthStatus {
  network: NetworkType;
  results: IndexerTestResult[];
  primaryIndexer: string;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  lastUpdated: number;
}

export class IndexerTestingService {
  private static readonly TIMEOUT_MS = 10000; // 10 seconds
  private static readonly TEST_ENDPOINTS = [
    { path: 'api/stats/heartbeat', name: 'heartbeat' },
    { path: 'api/stats', name: 'stats' },
    { path: 'api/query/Angor/projects?limit=1', name: 'projects' }
  ];

  /**
   * Test a single indexer endpoint
   */
  static async testIndexerEndpoint(
    url: string, 
    endpoint: string, 
    timeoutMs: number = IndexerTestingService.TIMEOUT_MS
  ): Promise<{ success: boolean; responseTime: number; status: number | null; error?: string }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(`${url}${endpoint}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        success: response.ok,
        responseTime,
        status: response.status,
        error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : undefined
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            responseTime,
            status: null,
            error: `Timeout after ${timeoutMs}ms`
          };
        }
        return {
          success: false,
          responseTime,
          status: null,
          error: error.message
        };
      }
      
      return {
        success: false,
        responseTime,
        status: null,
        error: 'Unknown error occurred'
      };
    }
  }

  /**
   * Comprehensive test of a single indexer
   */
  static async testSingleIndexer(url: string): Promise<IndexerTestResult> {
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    const testResults = await Promise.all(
      IndexerTestingService.TEST_ENDPOINTS.map(endpoint =>
        IndexerTestingService.testIndexerEndpoint(normalizedUrl, endpoint.path)
      )
    );

    const endpointResults = {
      heartbeat: testResults[0].success,
      stats: testResults[1].success,
      projects: testResults[2].success
    };

    const isOnline = testResults.some(result => result.success);
    const avgResponseTime = testResults
      .filter(result => result.success)
      .reduce((sum, result) => sum + result.responseTime, 0) / 
      (testResults.filter(result => result.success).length || 1);

    const firstSuccessfulResult = testResults.find(result => result.success);
    const firstFailedResult = testResults.find(result => !result.success);

    return {
      url: normalizedUrl,
      isOnline,
      responseTime: Math.round(avgResponseTime),
      status: firstSuccessfulResult?.status || firstFailedResult?.status || null,
      error: isOnline ? undefined : (firstFailedResult?.error || 'All endpoints failed'),
      endpoints: endpointResults,
      lastTested: Date.now()
    };
  }

  /**
   * Test all indexers for a specific network
   */
  static async testAllIndexers(
    network: NetworkType,
    customIndexers?: string[]
  ): Promise<IndexerHealthStatus> {
    const indexerUrls = customIndexers || 
      ANGOR_INDEXER_CONFIG[network].map(indexer => indexer.url);

    console.log(`🔍 Testing ${indexerUrls.length} indexers for ${network}...`);

    const testPromises = indexerUrls.map(url => 
      IndexerTestingService.testSingleIndexer(url)
    );

    const results = await Promise.all(testPromises);
    const primaryIndexer = getPrimaryIndexerUrl(network);
    
    // Calculate overall health
    const onlineCount = results.filter(result => result.isOnline).length;
    const totalCount = results.length;
    
    let overallHealth: 'healthy' | 'degraded' | 'critical';
    if (onlineCount === totalCount) {
      overallHealth = 'healthy';
    } else if (onlineCount > 0) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'critical';
    }

    const status: IndexerHealthStatus = {
      network,
      results,
      primaryIndexer,
      overallHealth,
      lastUpdated: Date.now()
    };

    console.log(`✅ Indexer testing complete for ${network}:`, {
      online: onlineCount,
      total: totalCount,
      health: overallHealth
    });

    return status;
  }

  /**
   * Test just the primary indexer for quick health check
   */
  static async testPrimaryIndexer(network: NetworkType): Promise<IndexerTestResult> {
    const primaryUrl = getPrimaryIndexerUrl(network);
    return IndexerTestingService.testSingleIndexer(primaryUrl);
  }

  /**
   * Get cached test results from localStorage
   */
  static getCachedResults(network: NetworkType): IndexerHealthStatus | null {
    try {
      const cached = localStorage.getItem(`indexer-health-${network}`);
      if (cached) {
        const data = JSON.parse(cached) as IndexerHealthStatus;
        // Check if cache is less than 5 minutes old
        if (Date.now() - data.lastUpdated < 5 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached indexer results:', error);
    }
    return null;
  }

  /**
   * Cache test results to localStorage
   */
  static cacheResults(status: IndexerHealthStatus): void {
    try {
      localStorage.setItem(
        `indexer-health-${status.network}`, 
        JSON.stringify(status)
      );
    } catch (error) {
      console.warn('Failed to cache indexer results:', error);
    }
  }

  /**
   * Test indexers and cache results
   */
  static async testAndCacheIndexers(
    network: NetworkType,
    customIndexers?: string[]
  ): Promise<IndexerHealthStatus> {
    const status = await IndexerTestingService.testAllIndexers(network, customIndexers);
    IndexerTestingService.cacheResults(status);
    return status;
  }

  /**
   * Get health status with fallback to cache
   */
  static async getHealthStatus(
    network: NetworkType,
    forceRefresh: boolean = false
  ): Promise<IndexerHealthStatus> {
    if (!forceRefresh) {
      const cached = IndexerTestingService.getCachedResults(network);
      if (cached) {
        return cached;
      }
    }

    return IndexerTestingService.testAndCacheIndexers(network);
  }

  /**
   * Format response time for display
   */
  static formatResponseTime(responseTime: number): string {
    if (responseTime < 1000) {
      return `${responseTime}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(1)}s`;
    }
  }

  /**
   * Get health color for UI display
   */
  static getHealthColor(health: 'healthy' | 'degraded' | 'critical'): string {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Get status icon for indexer result
   */
  static getStatusIcon(result: IndexerTestResult): string {
    if (result.isOnline) {
      if (result.responseTime < 1000) return '🟢'; // Fast
      if (result.responseTime < 3000) return '🟡'; // Slow
      return '🟠'; // Very slow but working
    }
    return '🔴'; // Offline
  }
}

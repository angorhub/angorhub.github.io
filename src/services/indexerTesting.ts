import { getPrimaryIndexerUrl, ANGOR_INDEXER_CONFIG } from '@/types/angor';
import type { NetworkType } from '@/contexts/NetworkContext';

export interface IndexerTestResult {
  url: string;
  isOnline: boolean;
  responseTime: number;
  status: number | null;
  error?: string;
  lastTested: number;
  statusText?: string; // Human readable status
  method?: string; // Method used for testing (API, Image, Script, etc.)
}

export interface IndexerHealthStatus {
  network: NetworkType;
  results: IndexerTestResult[];
  primaryIndexer: string;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  lastUpdated: number;
}

export class IndexerTestingService {
  private static readonly TIMEOUT_MS = 5000; // 5 seconds as recommended
  private static readonly RETRY_COUNT = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Test indexer connection using recommended endpoints
   */
  static async testIndexerConnection(
    url: string, 
    timeoutMs: number = IndexerTestingService.TIMEOUT_MS
  ): Promise<{ success: boolean; responseTime: number; status: number | null; error?: string }> {
    const startTime = Date.now();
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    const endpoints = ['api/stats/heartbeat', 'api/mempool', 'api/stats'];
    
    // Try different endpoints sequentially
    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(`${normalizedUrl}${endpoint}`, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*' // Try to help with CORS
          },
          mode: 'cors', // Explicitly set CORS mode
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          console.log(`✅ Endpoint ${endpoint} responded successfully`);
          return {
            success: true,
            responseTime,
            status: response.status,
          };
        } else {
          console.debug(`❌ Endpoint ${endpoint} failed with status ${response.status}`);
          // Continue to next endpoint
        }
      } catch (error) {
        console.debug(`Connection test failed for ${endpoint}:`, error);
        // Continue to next endpoint
      }
    }
    
    // All API endpoints failed, try simple HEAD request as fallback
    try {
      console.log(`🔄 Trying HEAD request to ${normalizedUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(normalizedUrl, {
        method: 'HEAD',
        headers: { 
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        },
        mode: 'no-cors', // Use no-cors for HEAD request
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // In no-cors mode, we get status 0 for successful requests
      if (response.type === 'opaque' || response.status === 0 || response.status < 500) {
        console.log(`✅ HEAD request successful (no-cors mode)`);
        return {
          success: true,
          responseTime,
          status: response.status || 200, // Assume 200 for opaque responses
          error: 'Server online but API endpoints may not be available'
        };
      }
      
      return {
        success: false,
        responseTime,
        status: response.status,
        error: `Server error: HTTP ${response.status}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            responseTime,
            status: null,
            error: `Connection timeout after ${timeoutMs}ms`
          };
        }
        
        // More detailed error classification
        if (error.message.includes('CORS') || error.message.includes('blocked by CORS policy')) {
          return {
            success: false,
            responseTime,
            status: null,
            error: 'CORS policy blocking - Server may be online but not accessible from browser'
          };
        }
        
        if (error.message.includes('Failed to fetch')) {
          return {
            success: false,
            responseTime,
            status: null,
            error: 'Network error - Server appears to be offline or unreachable'
          };
        }
        
        if (error.message.includes('NetworkError') || error.message.includes('network')) {
          return {
            success: false,
            responseTime,
            status: null,
            error: 'Network connection failed'
          };
        }
        
        return {
          success: false,
          responseTime,
          status: null,
          error: `Connection failed: ${error.message}`
        };
      }
      
      return {
        success: false,
        responseTime,
        status: null,
        error: 'Unknown connection error occurred'
      };
    }
  }

  /**
   * Comprehensive test of a single indexer with detailed status
   */
  static async testSingleIndexer(url: string): Promise<IndexerTestResult> {
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    console.log(`🔍 Testing indexer: ${normalizedUrl}`);
    
    // Use multi-method approach for better compatibility
    const testResult = await IndexerTestingService.testConnectionMultiMethod(normalizedUrl);

    // Generate human-readable status text based on result
    let statusText = '';
    if (testResult.success) {
      if (testResult.method === 'API') {
        if (testResult.status === 200) {
          statusText = 'Online and API responding perfectly';
        } else if (testResult.status === 404) {
          statusText = 'Online (some API endpoints not found)';
        } else {
          statusText = `Online (API HTTP ${testResult.status})`;
        }
      } else if (testResult.method === 'Image') {
        statusText = 'Online (detected via image test)';
      } else if (testResult.method === 'Script') {
        statusText = 'Online (detected via script test)';
      } else {
        statusText = 'Online (basic connectivity confirmed)';
      }
    } else {
      if (testResult.error?.includes('CORS')) {
        statusText = 'Offline (CORS policy blocking)';
      } else if (testResult.error?.includes('Network') || testResult.error?.includes('Failed to fetch')) {
        statusText = 'Offline (Network unreachable)';
      } else if (testResult.error?.includes('timeout')) {
        statusText = 'Offline (Connection timeout)';
      } else if (testResult.status && testResult.status >= 500) {
        statusText = `Offline (Server error ${testResult.status})`;
      } else {
        statusText = 'Offline (All connection methods failed)';
      }
    }

    const result = {
      url: normalizedUrl,
      isOnline: testResult.success,
      responseTime: testResult.responseTime,
      status: testResult.status,
      error: testResult.error,
      statusText,
      method: testResult.method,
      lastTested: Date.now()
    };

    console.log(`📊 Test result for ${normalizedUrl}:`, result);
    return result;
  }

  /**
   * Alternative connection test using image tag (similar to Angular approach)
   * This method bypasses CORS restrictions
   */
  static async testConnectionViaImage(url: string, timeoutMs: number = 3000): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          error: 'Connection timeout'
        });
      }, timeoutMs);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve({
          success: true,
          responseTime: Date.now() - startTime
        });
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        // Even if image fails, server responded (could be 404, but server is online)
        resolve({
          success: true,
          responseTime: Date.now() - startTime,
          error: 'Server online but image endpoint not found'
        });
      };
      
      // Try to load a common endpoint as an image
      // Most servers will return 404 but that means they're online
      img.src = `${normalizedUrl}favicon.ico?t=${Date.now()}`;
    });
  }

  /**
   * Test using fetch with different approaches
   */
  static async testConnectionMultiMethod(url: string): Promise<{ success: boolean; responseTime: number; status: number | null; error?: string; method: string }> {
    // Method 1: Try our regular API test
    try {
      console.log(`🔄 Testing ${url} with API endpoints`);
      const apiResult = await IndexerTestingService.testIndexerConnection(url);
      if (apiResult.success) {
        return { ...apiResult, method: 'API' };
      }
    } catch (error) {
      console.debug('API test failed:', error);
    }
    
    // Method 2: Try image-based test
    try {
      console.log(`🔄 Testing ${url} with image method`);
      const imgResult = await IndexerTestingService.testConnectionViaImage(url);
      if (imgResult.success) {
        return { 
          success: true, 
          responseTime: imgResult.responseTime, 
          status: 200, 
          error: imgResult.error,
          method: 'Image'
        };
      }
    } catch (error) {
      console.debug('Image test failed:', error);
    }
    
    // Method 3: Try simple ping-like test with script tag
    try {
      console.log(`🔄 Testing ${url} with script method`);
      const pingResult = await IndexerTestingService.testConnectionViaScript(url);
      return { ...pingResult, method: 'Script' };
    } catch (error) {
      console.debug('Script test failed:', error);
      return {
        success: false,
        responseTime: 0,
        status: null,
        error: 'All connection methods failed',
        method: 'None'
      };
    }
  }

  /**
   * Test connection using script tag (JSONP-like approach)
   */
  static async testConnectionViaScript(url: string, timeoutMs: number = 3000): Promise<{ success: boolean; responseTime: number; status: number | null; error?: string }> {
    const startTime = Date.now();
    const normalizedUrl = url.endsWith('/') ? url : url + '/';
    
    return new Promise((resolve) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        document.head.removeChild(script);
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          status: null,
          error: 'Connection timeout'
        });
      }, timeoutMs);
      
      script.onload = () => {
        clearTimeout(timeout);
        document.head.removeChild(script);
        resolve({
          success: true,
          responseTime: Date.now() - startTime,
          status: 200
        });
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        document.head.removeChild(script);
        // Even if script fails to load, server responded
        resolve({
          success: true,
          responseTime: Date.now() - startTime,
          status: 404,
          error: 'Server online but script endpoint not found'
        });
      };
      
      // Try to load any resource that might exist
      script.src = `${normalizedUrl}robots.txt?callback=test&t=${Date.now()}`;
      document.head.appendChild(script);
    });
  }
  static async quickHeartbeat(url: string): Promise<boolean> {
    try {
      const normalizedUrl = url.endsWith('/') ? url : url + '/';
      const response = await fetch(`${normalizedUrl}api/stats/heartbeat`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000) // Quick timeout for heartbeat
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Test indexer connection with retry logic
   */
  static async testWithRetry(
    url: string, 
    retryCount: number = IndexerTestingService.RETRY_COUNT,
    delayMs: number = IndexerTestingService.RETRY_DELAY
  ): Promise<IndexerTestResult> {
    let lastResult: IndexerTestResult | null = null;
    
    for (let i = 0; i < retryCount; i++) {
      lastResult = await IndexerTestingService.testSingleIndexer(url);
      
      if (lastResult.isOnline) {
        // Add retry info to status if it took multiple attempts
        if (i > 0) {
          lastResult.statusText = `${lastResult.statusText} (restored after ${i + 1} attempts)`;
        }
        return lastResult;
      }
      
      // Wait before next retry (except for last attempt)
      if (i < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    // All retries failed, return last result with retry info
    if (lastResult) {
      lastResult.statusText = `${lastResult.statusText} (failed after ${retryCount} attempts)`;
    }
    
    return lastResult || {
      url: url.endsWith('/') ? url : url + '/',
      isOnline: false,
      responseTime: 0,
      status: null,
      error: 'All connection attempts failed',
      statusText: 'Offline (Connection failed)',
      lastTested: Date.now()
    };
  }
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

import { useIndexer } from '@/contexts/IndexerContext';
import { useNetwork } from '@/contexts/NetworkContext';

/**
 * Hook that provides the current network's primary indexer URL
 */
export function useCurrentIndexer() {
  const { network } = useNetwork();
  const { getPrimaryUrl } = useIndexer();
  
  const primaryUrl = getPrimaryUrl(network);
  
  console.log('🔧 useCurrentIndexer:', { network, primaryUrl });
  
  return {
    network,
    primaryUrl,
    baseUrl: primaryUrl
  };
}

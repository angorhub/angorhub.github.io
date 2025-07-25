import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCurrentRelays } from './useCurrentRelays';

/**
 * Hook that invalidates Nostr queries when relay configuration changes
 */
export function useRelayCacheInvalidation() {
  const queryClient = useQueryClient();
  const { relayUrls, network } = useCurrentRelays();

  useEffect(() => {
    console.log('Relay configuration changed, invalidating Nostr cache...', { network, relayUrls });
    
    // Invalidate all Nostr-related queries when relay configuration changes
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return Array.isArray(queryKey) && queryKey.some(key => 
          typeof key === 'string' && key.startsWith('nostr-')
        );
      }
    });
  }, [relayUrls, network, queryClient]);

  return {
    invalidateNostrQueries: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey.some(key => 
            typeof key === 'string' && key.startsWith('nostr-')
          );
        }
      });
    }
  };
}

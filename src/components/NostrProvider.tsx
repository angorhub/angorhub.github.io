import React, { useEffect, useRef } from 'react';
import { NPool, NRelay1, type NostrEvent } from '@nostrify/nostrify';
import { NostrContext } from '@nostrify/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentRelays } from '@/hooks/useCurrentRelays';

interface NostrProviderProps {
  children: React.ReactNode;
}

const NostrProvider: React.FC<NostrProviderProps> = (props) => {
  const { children } = props;
  const { readableUrls, writableUrls, network } = useCurrentRelays();
  const queryClient = useQueryClient();

  // Create NPool instance only once
  const pool = useRef<NPool | undefined>(undefined);

  // Use refs so the pool always has the latest data
  const readableRelays = useRef<string[]>(readableUrls);
  const writableRelays = useRef<string[]>(writableUrls);

  // Update refs when relays change
  useEffect(() => {
    readableRelays.current = readableUrls;
    writableRelays.current = writableUrls;
    
      readable: readableUrls,
      writable: writableUrls
    });
    
    // Reset queries when relay configuration changes
    queryClient.resetQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return Array.isArray(queryKey) && queryKey.some(key => 
          typeof key === 'string' && key.startsWith('nostr-')
        );
      }
    });
  }, [readableUrls, writableUrls, network, queryClient]);

  // Initialize NPool only once
  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        return new NRelay1(url);
      },
      reqRouter(filters) {
        // Use all readable relays for data fetching
        const activeReadableRelays = new Set<string>(readableRelays.current);
        
        if (activeReadableRelays.size === 0) {
          console.warn('âš ï¸ NostrProvider: No readable relays available, using fallback');
          // Fallback to at least one relay if none are configured
          activeReadableRelays.add('wss://relay.angor.io');
        }
        
        
        // Return the same filters for all relays to aggregate data
        const relayMap = new Map();
        for (const relay of activeReadableRelays) {
          relayMap.set(relay, filters);
        }
        
        return relayMap;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      eventRouter(_event: NostrEvent) {
        // Publish to writable relays
        const activeWritableRelays = new Set<string>(writableRelays.current);

        if (activeWritableRelays.size === 0) {
          console.warn('âš ï¸ NostrProvider: No writable relays available, using fallback');
          // Fallback to at least one relay if none are configured
          activeWritableRelays.add('wss://relay.angor.io');
        }


        return [...activeWritableRelays];
      },
    });
  }

  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
};

export default NostrProvider;

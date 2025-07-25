import { useRelay } from '@/contexts/RelayContext';
import { useNetwork } from '@/contexts/NetworkContext';

/**
 * Hook that provides the current network's relay configuration
 */
export function useCurrentRelays() {
  const { network } = useNetwork();
  const { relays } = useRelay();
  
  // Get relays for current network
  const networkRelays = relays[network];
  
  // Get active (connected) relays
  const activeRelays = networkRelays.filter(relay => 
    relay.status === 'connected' && (relay.read || relay.write)
  );
  
  // Get readable relays
  const readableRelays = networkRelays.filter(relay => 
    relay.status === 'connected' && relay.read
  );
  
  // Get writable relays
  const writableRelays = networkRelays.filter(relay => 
    relay.status === 'connected' && relay.write
  );
  
  const result = {
    network,
    allRelays: networkRelays,
    activeRelays,
    readableRelays,
    writableRelays,
    relayUrls: activeRelays.map(relay => relay.url),
    readableUrls: readableRelays.map(relay => relay.url),
    writableUrls: writableRelays.map(relay => relay.url),
  };
  
  
  return result;
}

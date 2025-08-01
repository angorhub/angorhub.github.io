import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { BrowserRouter } from 'react-router-dom';
import { NostrLoginProvider } from '@nostrify/react/login';
import NostrProvider from '@/components/NostrProvider';
import { AppProvider } from '@/components/AppProvider';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { IndexerProvider } from '@/contexts/IndexerContext';
import { RelayProvider } from '@/contexts/RelayContext';
import { SearchProvider } from '@/contexts/SearchContext';
import type { AppConfig } from '@/contexts/AppContext';

interface TestAppProps {
  children: React.ReactNode;
}

export function TestApp({ children }: TestAppProps) {
  const head = createHead();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const defaultConfig: AppConfig = {
    theme: 'light',
    relayUrl: 'wss://relay.nostr.band',
    customRelays: [],
  };

  return (
    <UnheadProvider head={head}>
      <NetworkProvider>
        <IndexerProvider>
          <RelayProvider>
            <SearchProvider>
              <AppProvider storageKey='test-app-config' defaultConfig={defaultConfig}>
                <QueryClientProvider client={queryClient}>
                  <NostrLoginProvider storageKey='test-login'>
                    <NostrProvider>
                      <BrowserRouter>
                        {children}
                      </BrowserRouter>
                    </NostrProvider>
                  </NostrLoginProvider>
                </QueryClientProvider>
              </AppProvider>
            </SearchProvider>
          </RelayProvider>
        </IndexerProvider>
      </NetworkProvider>
    </UnheadProvider>
  );
}

export default TestApp;
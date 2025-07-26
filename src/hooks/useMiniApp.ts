import { useEffect, useState } from 'react';
import SWHandler from 'smart-widget-handler';

interface MiniAppUser {
  name?: string;
  display_name?: string;
  nip05?: string;
  picture?: string;
  pubkey?: string;
}

export default function useIsMiniApp(): boolean {
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    SWHandler.client.ready();

    const listener = SWHandler.client.listen((data) => {
      if (data.kind) {
        setIsMiniApp(true);
      }
    });

    return () => {
      listener.close();
    };
  }, []);

  return isMiniApp;
}

export function useMiniApp() {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [miniAppUser, setMiniAppUser] = useState<MiniAppUser | null>(null);

  useEffect(() => {
    SWHandler.client.ready();

    const listener = SWHandler.client.listen((data) => {
      console.log('Received message from parent:', data);
      
      if (data.kind) {
        setIsMiniApp(true);
        
        // Handle user metadata - based on your working code structure
        if (data.kind === 'user-metadata') {
          const dataAny = data as unknown as Record<string, unknown>;
          
          // Check for data.data.user structure (like in your working code)
          if (dataAny.data && typeof dataAny.data === 'object') {
            const dataObj = dataAny.data as Record<string, unknown>;
            if (dataObj.user && typeof dataObj.user === 'object') {
              const user = dataObj.user as Record<string, unknown>;
              console.log('Setting user data:', user);
              
              setMiniAppUser({
                name: user.name as string,
                display_name: user.display_name as string,
                nip05: user.nip05 as string,
                picture: user.picture as string,
                pubkey: user.pubkey as string
              });
            }
          }
        } else {
          // If it's not user-metadata but we detected MiniApp, set a default user
          setMiniAppUser({
            name: 'MiniApp User',
            display_name: 'MiniApp User',
            nip05: undefined,
            picture: undefined,
            pubkey: undefined
          });
        }
      }
    });

    return () => {
      listener.close();
    };
  }, []); // Don't include miniAppUser in dependencies to avoid infinite loops

  return {
    isMiniApp,
    isLoading: false,
    isStandalone: !isMiniApp,
    miniAppUser,
    sendMessageToParent: () => {
      console.warn('sendMessageToParent is deprecated. Use SWHandler directly.');
    }
  };
}

export function isRunningInsideMiniApp(): boolean {
  try {
    return !!SWHandler?.client;
  } catch {
    return false;
  }
}

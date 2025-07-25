import { useQuery } from '@tanstack/react-query';

// CORS proxy URLs - try multiple proxies for reliability
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
];

// API URLs
const DENY_LIST_URL = 'https://lists.blockcore.net/deny/angor.json';
const DENY_LIST_PROXY_URL = '/api/deny/angor.json'; // Vite proxy URL

interface DenyListService {
  isDenied: (projectIdentifier: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

function useDenyList(): DenyListService {
  const { data: denyList = [], isLoading, error } = useQuery({
    queryKey: ['denyList'],
    queryFn: async (): Promise<string[]> => {
      // Hardcoded fallback list based on the actual deny list
      const fallbackDenyList = [
        'angor1qfs3835r3r8leha9ksnrf8jadvtyzwuzu7huqk9',
        'angor1q748m7hqu5d7h58zyxvl6gvz4hhaptg5kez6r7f', 
        'angor1q2a5m2zcwpmkh49z05pg6gd9cxm4dhx3ywfclem'
      ];

      try {
        
        // Try proxy URL first (for development)
        let response;
        try {
          response = await fetch(DENY_LIST_PROXY_URL, { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
          }
        } catch (proxyError) {
          console.warn('âŒ Proxy URL failed, trying direct fetch...', proxyError);
          
          // Try direct fetch
          try {
            response = await fetch(DENY_LIST_URL, { 
              mode: 'cors',
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            
            if (response.ok) {
            }
          } catch (corsError) {
            console.warn('âŒ Direct fetch failed due to CORS, trying proxies...', corsError);
            
            // Try CORS proxies one by one
            for (const proxy of CORS_PROXIES) {
              try {
                response = await fetch(proxy + encodeURIComponent(DENY_LIST_URL), {
                  cache: 'no-store',
                  headers: {
                    'Cache-Control': 'no-cache'
                  }
                });
                if (response.ok) {
                  break;
                }
              } catch (proxyError) {
                console.warn(`âŒ Proxy ${proxy} failed:`, proxyError);
                continue;
              }
            }
          }
        }
        
        if (!response || !response.ok) {
          console.warn('âŒ Failed to fetch deny list from all sources, using fallback list');
          return fallbackDenyList;
        }
        
        const list = await response.json();
        
        if (!Array.isArray(list)) {
          console.error('âŒ Deny list format is incorrect, using fallback list');
          return fallbackDenyList;
        }
        
        
        // Log each denied project ID separately for clarity
        list.forEach((projectId, index) => {
        });
        
        return list;
        
      } catch (error) {
        console.error('âŒ Error loading deny list, using fallback list:', error);
        fallbackDenyList.forEach((projectId, index) => {
        });
        return fallbackDenyList;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const isDenied = (projectIdentifier: string): boolean => {
    if (!projectIdentifier || !denyList.length) {
      return false;
    }
    
    // Special test for the specific project ID
    const testProjectId = 'angor1q2a5m2zcwpmkh49z05pg6gd9cxm4dhx3ywfclem';
    if (projectIdentifier === testProjectId) {
      
      // Check each item individually for debugging
      denyList.forEach((deniedId, index) => {
        const matches = deniedId === projectIdentifier;
      });
    }
    
    const denied = denyList.includes(projectIdentifier);
    if (denied) {
      console.warn(`ðŸš« Project ${projectIdentifier} is denied and will be filtered out`);
    }
    
    return denied;
  };

  return {
    isDenied,
    isLoading,
    error: error as Error | null,
  };
}

function filterDeniedProjects<T extends { projectIdentifier?: string }>(
  projects: T[],
  denyService: DenyListService
): T[] {
  if (!projects.length) {
    return projects;
  }

  if (denyService.isLoading) {
    return projects;
  }

  const filtered = projects.filter(project => {
    if (!project.projectIdentifier) {
      return true;
    }
    
    // Extra logging for our specific test project
    const testProjectId = 'angor1q2a5m2zcwpmkh49z05pg6gd9cxm4dhx3ywfclem';
    if (project.projectIdentifier === testProjectId) {
    }
    
    const isDenied = denyService.isDenied(project.projectIdentifier);
    
    if (project.projectIdentifier === testProjectId) {
    }
    
    if (isDenied) {
    }
    
    return !isDenied;
  });

  if (projects.length !== filtered.length) {
  }
  
  return filtered;
}

export { useDenyList, filterDeniedProjects };
export type { DenyListService };

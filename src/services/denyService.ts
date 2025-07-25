import { useQuery } from '@tanstack/react-query';

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
];

const DENY_LIST_URL = 'https://lists.blockcore.net/deny/angor.json';
const DENY_LIST_PROXY_URL = '/api/deny/angor.json';

interface DenyListService {
  isDenied: (projectIdentifier: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

function useDenyList(): DenyListService {
  const { data: denyList = [], isLoading, error } = useQuery({
    queryKey: ['denyList'],
    queryFn: async (): Promise<string[]> => {
      const fallbackDenyList = [
        'angor1qfs3835r3r8leha9ksnrf8jadvtyzwuzu7huqk9',
        'angor1q748m7hqu5d7h58zyxvl6gvz4hhaptg5kez6r7f', 
        'angor1q2a5m2zcwpmkh49z05pg6gd9cxm4dhx3ywfclem'
      ];

      try {
        let response;

        try {
          response = await fetch(DENY_LIST_PROXY_URL, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          if (!response.ok) response = undefined;
        } catch {
          // Intentionally ignore errors for proxy fetch
        }

        if (!response) {
          try {
            response = await fetch(DENY_LIST_URL, { 
              mode: 'cors',
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            });
            if (!response.ok) response = undefined;
          } catch {
            // Intentionally ignore errors for direct fetch
          }
        }

        if (!response) {
          for (const proxy of CORS_PROXIES) {
            try {
              response = await fetch(proxy + encodeURIComponent(DENY_LIST_URL), {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
              });
              if (response.ok) break;
              else response = undefined;
            } catch {
              // Intentionally ignore errors for proxy fetch
            }
          }
        }

        if (!response || !response.ok) return fallbackDenyList;

        const list = await response.json();
        return Array.isArray(list) ? list : fallbackDenyList;

      } catch {
        return fallbackDenyList;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const isDenied = (projectIdentifier: string): boolean => {
    if (!projectIdentifier || !denyList.length) return false;
    return denyList.includes(projectIdentifier);
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
  if (!projects.length || denyService.isLoading) return projects;

  return projects.filter(project => {
    if (!project.projectIdentifier) return true;
    return !denyService.isDenied(project.projectIdentifier);
  });
}

export { useDenyList, filterDeniedProjects };
export type { DenyListService };

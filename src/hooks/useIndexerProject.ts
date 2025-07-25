import { useQuery } from '@tanstack/react-query';
import { AngorIndexerService } from '@/services/angorIndexer';
import { useCurrentIndexer } from '@/hooks/useCurrentIndexer';
import type { AngorProject } from '@/types/angor';

/**
 * Hook to fetch project data from the indexer API
 */
export function useIndexerProject(projectIdentifier: string | undefined) {
  const { primaryUrl, network } = useCurrentIndexer();

  return useQuery({
    queryKey: ['indexer-project', projectIdentifier, network, primaryUrl],
    queryFn: async (): Promise<AngorProject | null> => {
      if (!projectIdentifier) return null;
      

      
      // Create indexer service instance with current primary URL
      const indexerService = new AngorIndexerService(primaryUrl);
      const project = await indexerService.getProject(projectIdentifier, network);
      
      if (project) {

      } else {

      }
      
      return project;
    },
    enabled: !!projectIdentifier,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

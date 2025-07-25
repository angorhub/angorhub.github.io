import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { AngorDataAggregator } from '@/services/angorData';
import { AngorIndexerService } from '@/services/angorIndexer';
import { useNetwork } from '@/contexts/NetworkContext';
import { useCurrentIndexer } from '@/hooks/useCurrentIndexer';
import type { IndexedProject, ProjectFilters } from '@/types/angor';

export interface UseAngorProjectsOptions {
  limit?: number;
  offset?: number;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAngorProjects(options: UseAngorProjectsOptions = {}) {
  const {
    limit = 10,
    offset = 0,
    enableAutoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;
  const { network } = useNetwork();
  const { primaryUrl } = useCurrentIndexer();

  const [progress, setProgress] = useState({ current: 0, total: 100, stage: '' });

  const handleProgress = useCallback((current: number, total: number, stage: string) => {
    setProgress({ current, total, stage });
  }, []);

  const query = useQuery({
    queryKey: ['angor-projects', limit, offset, network, primaryUrl],
    queryFn: async () => {
      setProgress({ current: 0, total: 100, stage: 'Starting...' });
      
      // Create data aggregator instance with current primary URL
      const angorData = new AngorDataAggregator(primaryUrl);
      const projects = await angorData.loadProjectsWithFullData(
        offset,
        limit,
        network,
        handleProgress
      );
      return projects;
    },
    staleTime: enableAutoRefresh ? refreshInterval : 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: enableAutoRefresh ? refreshInterval : false,
  });

  return {
    ...query,
    progress,
    projects: query.data || [],
  };
}

export function useAngorProject(projectId: string | undefined) {
  const { network } = useNetwork();
  const { primaryUrl } = useCurrentIndexer();
  
  return useQuery({
    queryKey: ['angor-project', projectId, network, primaryUrl],
    queryFn: async () => {
      if (!projectId) return null;
      
      // Create indexer service instance with current primary URL
      const indexerService = new AngorIndexerService(primaryUrl);
      return indexerService.getProject(projectId, network);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useAngorProjectStats(projectId: string | undefined) {
  const { network } = useNetwork();
  const { primaryUrl } = useCurrentIndexer();
  
  return useQuery({
    queryKey: ['angor-project-stats', projectId, network, primaryUrl],
    queryFn: async () => {
      if (!projectId) return null;
      
      // Create indexer service instance with current primary URL
      const indexerService = new AngorIndexerService(primaryUrl);
      return indexerService.getProjectStats(projectId, network);
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // More frequent updates for stats
    gcTime: 15 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useAngorProjectInvestments(projectId: string | undefined) {
  const { network } = useNetwork();
  const { primaryUrl } = useCurrentIndexer();
  
  return useQuery({
    queryKey: ['angor-project-investments', projectId, network, primaryUrl],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Create indexer service instance with current primary URL
      const indexerService = new AngorIndexerService(primaryUrl);
      return indexerService.getProjectInvestments(projectId, network);
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000,
  });
}

export function useAngorProjectSearch(query: string, limit: number = 20) {
  const { network } = useNetwork();
  const { primaryUrl } = useCurrentIndexer();
  
  return useQuery({
    queryKey: ['angor-project-search', query, limit, network, primaryUrl],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      // Create indexer service instance with current primary URL
      const indexerService = new AngorIndexerService(primaryUrl);
      return indexerService.searchProjects(query, limit, network);
    },
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFilteredProjects(
  projects: IndexedProject[],
  filters: ProjectFilters
) {
  // Create temporary data aggregator instance for filtering (doesn't need URL)
  const angorData = new AngorDataAggregator();
  const filteredProjects = angorData.filterAndSortProjects(projects, filters);
  const statistics = angorData.getProjectStatistics(filteredProjects);

  return {
    projects: filteredProjects,
    statistics,
    count: filteredProjects.length,
  };
}

export interface UseAngorDashboardData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalFunding: number;
  totalInvestors: number;
  averageFunding: number;
  recentProjects: IndexedProject[];
  topFundedProjects: IndexedProject[];
}

export function useAngorDashboard(): {
  data: UseAngorDashboardData | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data: projects, isLoading, error } = useAngorProjects({ limit: 50 });

  if (isLoading || error || !projects) {
    return { data: undefined, isLoading, error };
  }

  // Create temporary data aggregator instance for statistics (doesn't need URL)
  const angorData = new AngorDataAggregator();
  const statistics = angorData.getProjectStatistics(projects);
  
  const recentProjects = [...projects]
    .sort((a, b) => (b.projectData.startDate ?? 0) - (a.projectData.startDate ?? 0))
    .slice(0, 5);

  const topFundedProjects = [...projects]
    .sort((a, b) => b.stats.amountInvested - a.stats.amountInvested)
    .slice(0, 5);

  const dashboardData: UseAngorDashboardData = {
    ...statistics,
    recentProjects,
    topFundedProjects,
  };

  return {
    data: dashboardData,
    isLoading: false,
    error: null,
  };
}

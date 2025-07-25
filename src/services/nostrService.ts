import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { ANGOR_EVENT_KINDS } from '@/types/angor';
import type { NostrProfile, ProjectDetails, ProjectFAQ, ProjectMedia, ProjectMembers, NostrProjectDetails } from '@/types/angor';

/**
 * Retry mechanism for Nostr queries
 */
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  description: string,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${description}:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed for ${description}`);
}

/**
 * Helper function to safely parse JSON content
 */
function safeJsonParse(content: string, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  try {
    // Quick check if content looks like JSON
    const trimmed = content.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      console.log('Content does not appear to be JSON, skipping parse:', trimmed.slice(0, 50) + '...');
      return fallback;
    }
    
    return JSON.parse(content);
  } catch {
    console.log('Invalid JSON content, skipping:', content.slice(0, 50) + '...');
    return fallback;
  }
}

/**
 * Hook to fetch user profile by pubkey
 */
export function useNostrProfile(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr-profile', pubkey],
    queryFn: async () => {
      if (!pubkey) return null;

      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(5000);
        const events = await nostr.query([{
          kinds: [ANGOR_EVENT_KINDS.PROFILE_METADATA],
          authors: [pubkey],
          limit: 1
        }], { signal });

        if (events.length > 0) {
          const parsedContent = safeJsonParse(events[0].content, {});
          return parsedContent as NostrProfile;
        }
        return {};
      }, `Profile for ${pubkey}`);
    },
    enabled: !!pubkey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch project details by event ID
 */
export function useNostrProjectDetails(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr-project-details', eventId],
    queryFn: async () => {
      if (!eventId) return {};

      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(5000);
        const events = await nostr.query([{
          ids: [eventId],
          limit: 1
        }], { signal });

        if (events.length > 0) {
          const parsedContent = safeJsonParse(events[0].content, {});
          return parsedContent as ProjectDetails;
        }
        return {};
      }, `Project details for ${eventId}`);
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch additional project data (FAQ, media, members, project details)
 */
export function useNostrAdditionalData(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr-additional-data', pubkey],
    queryFn: async () => {
      if (!pubkey) return { faq: {}, media: {}, members: {}, project: {} as NostrProjectDetails, content: '' };

      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(8000);
        
        // Query both kind 30078 (additional data) and kind 3030 (project info)
        const events = await nostr.query([
          {
            kinds: [ANGOR_EVENT_KINDS.ADDITIONAL_DATA], // 30078
            authors: [pubkey],
            limit: 100
          },
          {
            kinds: [ANGOR_EVENT_KINDS.PROJECT_INFO], // 3030
            authors: [pubkey],
            limit: 10
          }
        ], { signal });

        let faq: ProjectFAQ = { questions: [] };
        let media: ProjectMedia = {};
        let members: ProjectMembers = { team: [] };
        let project: NostrProjectDetails = {};
        let content: string = '';

        events.forEach(event => {
          if (event.kind === ANGOR_EVENT_KINDS.PROJECT_INFO) {
            // Kind 3030 - Project information
            const parsedContent = safeJsonParse(event.content, {});
            project = parsedContent as NostrProjectDetails;
          } else if (event.kind === ANGOR_EVENT_KINDS.ADDITIONAL_DATA) {
            // Kind 30078 - Additional data with d tags
            const dTag = event.tags.find(tag => tag[0] === 'd');
            const parsedContent = safeJsonParse(event.content, {});
            
            if (dTag) {
              const tagValue = dTag[1];
              
              if (tagValue === 'angor:faq' || tagValue === 'faq') {
                faq = parsedContent as unknown as ProjectFAQ;
              } else if (tagValue === 'angor:media' || tagValue === 'media') {
                media = parsedContent as unknown as ProjectMedia;
              } else if (tagValue === 'angor:members' || tagValue === 'members') {
                members = parsedContent as unknown as ProjectMembers;
              } else if (tagValue === 'angor:project' || tagValue === 'project') {
                project = { ...project, ...(parsedContent as NostrProjectDetails) };
                // Store the raw content for markdown rendering
                content = event.content;
              }
            } else if (!dTag && parsedContent.projectIdentifier) {
              // Untagged project data that contains projectIdentifier (main project details)
              project = { ...project, ...(parsedContent as NostrProjectDetails) };
            }
          }
        });

        return { faq, media, members, project, content };
      }, `Additional data for ${pubkey}`);
    },
    enabled: !!pubkey,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch project updates
 */
export function useProjectUpdates(projectId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['project-updates', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(5000);
        const events = await nostr.query([{
          kinds: [ANGOR_EVENT_KINDS.PROJECT_INFO, ANGOR_EVENT_KINDS.PROJECT_NOTE],
          '#project': [projectId],
          limit: 50
        }], { signal });

        return events
          .sort((a, b) => b.created_at - a.created_at)
          .map(event => ({
            id: event.id,
            content: event.content,
            created_at: event.created_at,
            author: event.pubkey,
            tags: event.tags,
          }));
      }, `Updates for project ${projectId}`);
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch all projects from Nostr
 */
export function useNostrProjects() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr-projects'],
    queryFn: async () => {
      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(10000);
        const events = await nostr.query([{
          kinds: [ANGOR_EVENT_KINDS.PROJECT_INFO, ANGOR_EVENT_KINDS.ADDITIONAL_DATA],
          limit: 100
        }], { signal });

        return events
          .sort((a, b) => b.created_at - a.created_at)
          .map(event => {
            const content = safeJsonParse(event.content, {});
            if (Object.keys(content).length === 0) {
              return null; // Skip non-JSON content
            }
            
            return {
              ...content,
              eventId: event.id,
              pubkey: event.pubkey,
              created_at: event.created_at,
            };
          })
          .filter(Boolean);
      }, 'All Nostr projects');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch detailed project information by eventId (kinds 3030 and 30078)
 * First fetches the initial event to get the author, then fetches all project data from that author
 */
export function useNostrProjectByEventId(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr-project-by-eventid', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(10000);
        
        // Step 1: Get the initial event to find the author
        const initialEvents = await nostr.query([{
          ids: [eventId],
          limit: 1
        }], { signal });

        if (initialEvents.length === 0) {
          return null;
        }

        const initialEvent = initialEvents[0];
        const authorPubkey = initialEvent.pubkey;

        // Step 2: Fetch ALL project data from this author (both kinds 3030 and 30078)
        const allEvents = await nostr.query([
          {
            kinds: [ANGOR_EVENT_KINDS.PROJECT_INFO], // 3030
            authors: [authorPubkey],
            limit: 10
          },
          {
            kinds: [ANGOR_EVENT_KINDS.ADDITIONAL_DATA], // 30078
            authors: [authorPubkey],
            limit: 50
          }
        ], { signal });

        // Step 3: Process and merge all project data
        let projectDetails: NostrProjectDetails = {};
        let additionalData: Partial<NostrProjectDetails> = {};
        let mergedProjectData: NostrProjectDetails = {};

        for (const event of allEvents) {
          const content = safeJsonParse(event.content, {});
          
          // Skip non-JSON content
          if (Object.keys(content).length === 0) {
            continue;
          }
          
          if (event.kind === ANGOR_EVENT_KINDS.PROJECT_INFO) {
            // Kind 3030 - Project information
            const projectContent = content as NostrProjectDetails;
            projectDetails = { ...projectDetails, ...projectContent };
            mergedProjectData = { ...mergedProjectData, ...projectContent };
          } else if (event.kind === ANGOR_EVENT_KINDS.ADDITIONAL_DATA) {
            // Kind 30078 - Additional data
            const dTag = event.tags.find(tag => tag[0] === 'd')?.[1];
            
            if (dTag === 'angor:project' || dTag === 'project') {
              // Tagged project data
              const projectContent = content as NostrProjectDetails;
              additionalData = { ...additionalData, ...projectContent };
              mergedProjectData = { ...mergedProjectData, ...projectContent };
            } else if (!dTag && content.projectIdentifier) {
              // Untagged project data that contains projectIdentifier (main project details)
              const projectContent = content as NostrProjectDetails;
              additionalData = { ...additionalData, ...projectContent };
              mergedProjectData = { ...mergedProjectData, ...projectContent };
              console.log(`Found untagged project data with targetAmount: ${content.targetAmount}`);
            }
          }
        }

        return {
          projectDetails: mergedProjectData, // Merged data from both kinds
          additionalData,
          nostrPubKey: authorPubkey,
          eventId: eventId,
          created_at: initialEvent.created_at,
          // Ensure we have the essential fields available
          targetAmount: mergedProjectData.targetAmount || projectDetails.targetAmount,
          name: mergedProjectData.name || projectDetails.name,
          about: mergedProjectData.about || projectDetails.about
        };
      }, `Project data for eventId ${eventId}`);
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch enhanced project metadata by nostrPubKey
 */
export function useProjectMetadata(nostrPubKey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['project-metadata', nostrPubKey],
    queryFn: async () => {
      if (!nostrPubKey) return null;

      return queryWithRetry(async () => {
        const signal = AbortSignal.timeout(8000);
        
        // Fetch profile metadata (kind 0) and additional project data (kind 30078)
        const events = await nostr.query([
          {
            kinds: [ANGOR_EVENT_KINDS.PROFILE_METADATA], // 0
            authors: [nostrPubKey],
            limit: 1
          },
          {
            kinds: [ANGOR_EVENT_KINDS.ADDITIONAL_DATA], // 30078
            authors: [nostrPubKey],
            '#d': ['angor:project', 'angor:media', 'angor:members'],
            limit: 10
          }
        ], { signal });

        let profile = {};
        let projectData = {};
        let mediaData = {};
        let membersData = {};

        for (const event of events) {
          if (event.kind === ANGOR_EVENT_KINDS.PROFILE_METADATA) {
            profile = safeJsonParse(event.content, {});
          } else if (event.kind === ANGOR_EVENT_KINDS.ADDITIONAL_DATA) {
            const dTag = event.tags.find(tag => tag[0] === 'd')?.[1];
            const content = safeJsonParse(event.content, {});
            
            // Skip non-JSON content
            if (Object.keys(content).length === 0) {
              continue;
            }
            
            switch (dTag) {
              case 'angor:project':
                projectData = content;
                break;
              case 'angor:media':
                mediaData = content;
                break;
              case 'angor:members':
                membersData = content;
                break;
            }
          }
        }

        return {
          profile,
          project: projectData,
          media: mediaData,
          members: membersData,
          nostrPubKey
        };
      }, `Project metadata for ${nostrPubKey}`);
    },
    enabled: !!nostrPubKey,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

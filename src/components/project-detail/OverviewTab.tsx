import { 
  ProjectDescription,
  ProjectTechnicalDetails,
  ProjectDescriptionSkeleton,
  ProjectTechnicalDetailsSkeleton,
} from '.';
import type { 
  NostrProfile, 
  ProjectMetadata,
  ProjectMedia,
  NostrMediaItem
} from '@/types/angor';

export function OverviewTabSkeleton() {
  return (
    <div className="space-y-6">
      <ProjectDescriptionSkeleton />
      <ProjectTechnicalDetailsSkeleton />
    </div>
  );
}

interface ProjectData {
  details?: {
    startDate?: number;
    endDate?: number;
    expiryDate?: number;
  };
  projectIdentifier?: string;
  nostrPubKey?: string;
}

interface IndexerProject {
  projectIdentifier?: string;
  nostrPubKey?: string;
  founderKey?: string;
  createdOnBlock?: number;
  penaltyDays?: number;
}

interface AdditionalData {
  content?: string;
  project?: {
    about?: string;
    projectIdentifier?: string;
    nostrPubKey?: string;
    founderKey?: string;
    startDate?: number;
    endDate?: number;
    expiryDate?: number;
    targetAmount?: number;
    penaltyDays?: number;
    stages?: Array<{
      releaseDate?: number;
      amountToRelease: number;
    }>;
  };
  media?: NostrMediaItem[] | ProjectMedia;
}

interface NostrProjectData {
  projectDetails?: {
    projectIdentifier?: string;
    nostrPubKey?: string;
    founderKey?: string;
    startDate?: number;
    endDate?: number;
    expiryDate?: number;
    targetAmount?: number;
    penaltyDays?: number;
  };
}

interface ProjectStats {
  targetAmount?: number;
}

interface OverviewTabProps {
  additionalData?: AdditionalData;
  projectData?: ProjectMetadata;
  profile?: NostrProfile;
  project?: ProjectData;
  indexerProject?: IndexerProject;
  nostrProjectData?: NostrProjectData;
  stats?: ProjectStats;
  mediaData?: ProjectMedia;
  formatBTC: (sats: number | undefined) => string;
}

export function OverviewTab({
  additionalData,
  projectData,
  profile,
  project,
  indexerProject,
  nostrProjectData,
  stats,
  formatBTC
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Project Description Component */}
      <ProjectDescription
        additionalData={additionalData}
        projectData={projectData}
        profile={profile}
      />

      {/* Project Technical Details Component */}
      <ProjectTechnicalDetails
        project={project}
        additionalData={additionalData}
        indexerProject={indexerProject}
        nostrProjectData={nostrProjectData}
        stats={stats}
        formatBTC={formatBTC}
      />


    </div>
  );
}

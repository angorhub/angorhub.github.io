import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function ProjectTechnicalDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-full bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
  project?: {
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

interface ProjectTechnicalDetailsProps {
  project?: ProjectData;
  additionalData?: AdditionalData;
  indexerProject?: IndexerProject;
  nostrProjectData?: NostrProjectData;
  stats?: ProjectStats;
  formatBTC: (sats: number | undefined) => string;
}

export function ProjectTechnicalDetails({
  project,
  additionalData,
  indexerProject,
  nostrProjectData,
  stats,
  formatBTC
}: ProjectTechnicalDetailsProps) {
  // Don't render if no technical details are available
  if (!project?.details && !additionalData?.project && !indexerProject) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Project Identifier</Label>
            <div className="text-sm text-muted-foreground font-mono p-2 bg-muted rounded break-all">
              {nostrProjectData?.projectDetails?.projectIdentifier || 
               additionalData?.project?.projectIdentifier || 
               indexerProject?.projectIdentifier || 
               project?.projectIdentifier || 'N/A'}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Nostr Public Key</Label>
            <div className="text-sm text-muted-foreground font-mono p-2 bg-muted rounded break-all">
              {nostrProjectData?.projectDetails?.nostrPubKey || 
               additionalData?.project?.nostrPubKey || 
               indexerProject?.nostrPubKey || 
               project?.nostrPubKey || 'N/A'}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Founder Key</Label>
            <div className="text-sm text-muted-foreground font-mono p-2 bg-muted rounded break-all">
              {nostrProjectData?.projectDetails?.founderKey || 
               additionalData?.project?.founderKey || 
               indexerProject?.founderKey || 'N/A'}
            </div>
          </div>

          {indexerProject?.createdOnBlock && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Created on Block</Label>
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                {indexerProject.createdOnBlock.toLocaleString()}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Start Date</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {(nostrProjectData?.projectDetails?.startDate || additionalData?.project?.startDate) ?
                new Date(((nostrProjectData?.projectDetails?.startDate || additionalData?.project?.startDate) ?? 0) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 
                (project?.details?.startDate ? 
                  new Date(project.details.startDate * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'
                )
              }
            </div>
          </div>

         <div className="space-y-3">
            <Label className="text-sm font-medium">End Date</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {(nostrProjectData?.projectDetails?.endDate || additionalData?.project?.endDate) ?
                new Date(((nostrProjectData?.projectDetails?.endDate || additionalData?.project?.endDate) ?? 0) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) :
                (project?.details?.endDate ?
                  new Date(project.details.endDate * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'
                )
              }
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Expiry Date</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {(nostrProjectData?.projectDetails?.expiryDate || additionalData?.project?.expiryDate) ?
                new Date(((nostrProjectData?.projectDetails?.expiryDate || additionalData?.project?.expiryDate) ?? 0) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 
                (project?.details?.expiryDate ? 
                  new Date(project.details.expiryDate * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'
                )
              }
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Target Amount</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {(() => {
                const targetAmount = nostrProjectData?.projectDetails?.targetAmount || additionalData?.project?.targetAmount;
                return targetAmount ? 
                  `${formatBTC(targetAmount)} (${targetAmount.toLocaleString()} sats)` : 
                  (stats?.targetAmount ? `${formatBTC(stats.targetAmount)}` : 'N/A');
              })()}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Penalty Days</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {(nostrProjectData?.projectDetails?.penaltyDays || additionalData?.project?.penaltyDays || indexerProject?.penaltyDays) ? 
                `${nostrProjectData?.projectDetails?.penaltyDays || additionalData?.project?.penaltyDays || indexerProject?.penaltyDays} days` : 'N/A'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

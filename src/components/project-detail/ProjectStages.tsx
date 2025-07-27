import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProjectStagesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface Stage {
  releaseDate?: number;
  amountToRelease: number;
}

interface AdditionalData {
  project?: {
    stages?: Stage[];
    targetAmount?: number;
  };
}

interface ProjectStagesProps {
  additionalData?: AdditionalData;
  formatBTC: (sats: number | undefined) => string;
}

export function ProjectStages({
  additionalData,
  formatBTC
}: ProjectStagesProps) {
  // Don't render if no stages available
  if (!additionalData?.project?.stages || 
      !Array.isArray(additionalData.project.stages) || 
      additionalData.project.stages.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Project Stages (Milestones)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {additionalData.project.stages.map((stage, index: number) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
              <div className="space-y-1">
                <div className="font-medium">Stage {index + 1}</div>
                <div className="text-sm text-muted-foreground">
                  Release Date: {stage.releaseDate ? 
                    new Date(stage.releaseDate * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'
                  }
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-bold text-green-600 text-lg">
                  {stage.amountToRelease}% of funds
                </div>
                <div className="text-sm text-muted-foreground">
                  {additionalData?.project?.targetAmount && stage.amountToRelease ? 
                    formatBTC((additionalData.project.targetAmount * stage.amountToRelease) / 100) : 'N/A'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

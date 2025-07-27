import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { 
  NostrProfile, 
  ProjectMetadata
} from '@/types/angor';

export function ProjectDescriptionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

interface AdditionalData {
  content?: string;
  project?: {
    about?: string;
  };
}

interface ProjectDescriptionProps {
  additionalData?: AdditionalData;
  projectData?: ProjectMetadata;
  profile?: NostrProfile;
}

export function ProjectDescription({
  additionalData,
  projectData,
  profile
}: ProjectDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Project Description</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Render content from additional data (kind 30078 with #d: ['angor:project']) as markdown */}
        {additionalData?.content ? (
          <MarkdownRenderer 
            content={additionalData.content} 
            className="prose-sm max-w-none"
          />
        ) : additionalData?.project?.about ? (
          <MarkdownRenderer 
            content={additionalData.project.about} 
            className="prose-sm max-w-none"
          />
        ) : (
          <div className="prose max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {projectData?.about || profile?.about || 'Detailed project description will be available here once the creator provides more information.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Hash, 
  Key, 
  User, 
  Calendar, 
  CalendarCheck, 
  CalendarX, 
  Target, 
  Shield,
  Blocks,
  Copy,
  ExternalLink,
  Clock,
  Bitcoin
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

export function ProjectTechnicalDetailsSkeleton() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
          <div className="h-7 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
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
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Don't render if no technical details are available
  if (!project?.details && !additionalData?.project && !indexerProject) {
    return null;
  }

  // Helper function to copy text to clipboard
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // Helper function to format hash display
  const formatHash = (hash: string | undefined) => {
    if (!hash || hash === 'N/A') return 'N/A';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  // Helper function to create detail item
  const DetailItem = ({ 
    icon: Icon, 
    label, 
    value, 
    fullValue, 
    copyable = false, 
    type = 'text',
    badge,
    href
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    fullValue?: string;
    copyable?: boolean;
    type?: 'text' | 'hash' | 'date' | 'amount' | 'number';
    badge?: string;
    href?: string;
  }) => {
    const displayValue = type === 'hash' && fullValue ? formatHash(fullValue) : value;
    const isNA = value === 'N/A' || !value;
    
    return (
      <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-border transition-all duration-200 hover:shadow-md group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            {badge && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {badge}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {copyable && !isNA && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => copyToClipboard(fullValue || value, label)}
              >
                <Copy className={`h-3 w-3 transition-all ${copiedField === label ? 'text-green-500' : 'text-muted-foreground'}`} />
              </Button>
            )}
            {href && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => window.open(href, '_blank')}
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
        <div className={`text-sm font-medium ${isNA ? 'text-muted-foreground/60' : 'text-foreground'} ${type === 'hash' ? 'font-mono' : ''}`}>
          {isNA ? (
            <span className="italic">Not available</span>
          ) : (
            <>
              {type === 'amount' && (
                <div className="flex items-center space-x-2">
                  <Bitcoin className="h-4 w-4 text-orange-500" />
                  <span>{displayValue}</span>
                </div>
              )}
              {type !== 'amount' && displayValue}
              {type === 'hash' && fullValue && !isNA && (
                <div className="text-xs text-muted-foreground/60 mt-1 break-all">
                  {fullValue}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Data extraction
  const projectIdentifier = nostrProjectData?.projectDetails?.projectIdentifier || 
                           additionalData?.project?.projectIdentifier || 
                           indexerProject?.projectIdentifier || 
                           project?.projectIdentifier;

  const nostrPubKey = nostrProjectData?.projectDetails?.nostrPubKey || 
                     additionalData?.project?.nostrPubKey || 
                     indexerProject?.nostrPubKey || 
                     project?.nostrPubKey;

  const founderKey = nostrProjectData?.projectDetails?.founderKey || 
                    additionalData?.project?.founderKey || 
                    indexerProject?.founderKey;

  const startDate = nostrProjectData?.projectDetails?.startDate || additionalData?.project?.startDate || project?.details?.startDate;
  const endDate = nostrProjectData?.projectDetails?.endDate || additionalData?.project?.endDate || project?.details?.endDate;
  const expiryDate = nostrProjectData?.projectDetails?.expiryDate || additionalData?.project?.expiryDate || project?.details?.expiryDate;
  const targetAmount = nostrProjectData?.projectDetails?.targetAmount || additionalData?.project?.targetAmount || stats?.targetAmount;
  const penaltyDays = nostrProjectData?.projectDetails?.penaltyDays || additionalData?.project?.penaltyDays || indexerProject?.penaltyDays;

  // Format dates
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Hash className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              Project Details
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Technical specifications and blockchain information
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Identifier */}
          <DetailItem
            icon={Hash}
            label="Project Identifier"
            value={projectIdentifier || 'N/A'}
            fullValue={projectIdentifier}
            copyable={!!projectIdentifier}
            type="hash"
            badge="ID"
          />

          {/* Nostr Public Key */}
          <DetailItem
            icon={Key}
            label="Nostr Public Key"
            value={nostrPubKey || 'N/A'}
            fullValue={nostrPubKey}
            copyable={!!nostrPubKey}
            type="hash"
            badge="NPUB"
          />

          {/* Founder Key */}
          <DetailItem
            icon={User}
            label="Founder Key"
            value={founderKey || 'N/A'}
            fullValue={founderKey}
            copyable={!!founderKey}
            type="hash"
            badge="FOUNDER"
          />

          {/* Created on Block */}
          {indexerProject?.createdOnBlock && (
            <DetailItem
              icon={Blocks}
              label="Created on Block"
              value={indexerProject.createdOnBlock.toLocaleString()}
              type="number"
              badge="BLOCKCHAIN"
            />
          )}

          {/* Start Date */}
          <DetailItem
            icon={Calendar}
            label="Start Date"
            value={formatDate(startDate)}
            type="date"
            badge={startDate && startDate > Date.now() / 1000 ? "UPCOMING" : "STARTED"}
          />

          {/* End Date */}
          <DetailItem
            icon={CalendarCheck}
            label="End Date"
            value={formatDate(endDate)}
            type="date"
            badge={endDate && endDate < Date.now() / 1000 ? "ENDED" : "ACTIVE"}
          />

          {/* Expiry Date */}
          <DetailItem
            icon={CalendarX}
            label="Expiry Date"
            value={formatDate(expiryDate)}
            type="date"
            badge={expiryDate && expiryDate < Date.now() / 1000 ? "EXPIRED" : "VALID"}
          />

          {/* Target Amount */}
          <DetailItem
            icon={Target}
            label="Target Amount"
            value={targetAmount ? `${formatBTC(targetAmount)} (${targetAmount.toLocaleString()} sats)` : 'N/A'}
            type="amount"
            badge="GOAL"
          />

          {/* Penalty Days */}
          <DetailItem
            icon={Shield}
            label="Penalty Days"
            value={penaltyDays ? `${penaltyDays} days` : 'N/A'}
            type="number"
            badge="SECURITY"
          />
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>All timestamps are displayed in your local timezone</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

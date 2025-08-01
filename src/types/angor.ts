export interface AngorProject {
  projectIdentifier: string;
  nostrPubKey?: string;
  nostrEventId?: string;
  targetAmount: number;
  amountInvested: number;
  investorCount: number;
  penaltyDays: number;
  founderKey: string;
  createdOnBlock: number;
  trxId: string;
  totalInvestmentsCount?: number;
  metadata?: ProjectMetadata;
  stats?: ProjectStats;
  details?: ProjectDetails;
  profile?: NostrProfile;
  faq?: ProjectFAQ;
  media?: ProjectMedia;
  members?: ProjectMembers;
}

export interface ProjectMetadata {
  name: string;
  about: string;
  banner?: string;
  picture?: string;
  website?: string;
  lud16?: string; // Lightning address
  tags?: string[];
  category?: string;
}

export interface ProjectStats {
  amountInvested: number;
  investorCount: number;
  completionPercentage: number;
  lastUpdated: number;
  targetAmount: number;
  daysRemaining?: number;
  status: 'active' | 'completed' | 'expired' | 'upcoming';
  // Additional indexer stats
  amountSpentSoFarByFounder?: number;
  amountInPenalties?: number;
  countInPenalties?: number;
}

export interface ProjectDetails {
  targetAmount?: number;
  startDate?: number;
  endDate?: number;
  expiryDate?: number;
  nostrPubKey?: string;
  projectIdentifier?: string;
  createdOnBlock?: number;
  founderKey?: string;
  founderRecoveryKey?: string;
  penaltyDays?: number;
  name?: string;
  about?: string;
  stages?: ProjectStage[];
  description?: string;
  roadmap?: string[];
}

export interface ProjectStage {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  releaseDate: number;
  isCompleted: boolean;
}

export interface NostrProfile {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  lud16?: string;
  nip05?: string;
}

export interface ProjectInvestment {
  investorPublicKey: string;
  totalAmount: number;
  transactionId: string;
  timeInvested: number;
  isSeeder: boolean;
}

export interface ProjectFAQ {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ProjectMedia {
  images?: string[];
  videos?: string[];
  documents?: string[];
  gallery?: Array<{
    url: string;
    type: 'image' | 'video' | 'document';
    caption?: string;
  }>;
}

export interface ProjectMembers {
  team: Array<{
    pubkey: string;
    name?: string;
    role: string;
    bio?: string;
    picture?: string;
  }>;
  pubkeys?: string[];
}

// Additional types for Nostr data structures
export interface NostrProjectUpdate {
  id: string;
  content: string;
  created_at: number;
  author: string;
  tags: string[][];
}

export interface NostrFAQItem {
  question: string;
  answer: string;
}

export interface NostrMediaItem {
  url: string;
  type: 'image' | 'video' | 'document';
  caption?: string;
}

export interface NostrTeamMember {
  pubkey: string;
  name?: string;
  role?: string;
  bio?: string;
  picture?: string;
}

export interface NostrInvestment {
  id: string;
  pubkey: string;
  amount: number;
  created_at: number;
}

export interface NostrProjectStage {
  name: string;
  description: string;
  targetAmount: number;
  amountToRelease?: number;
  releaseDate?: number;
}

// Additional data structure for Nostr events
export interface NostrAdditionalData {
  faq?: NostrFAQItem[];
  media?: NostrMediaItem[] | ProjectMedia;
  members?: ProjectMembers;
  project?: NostrProjectDetails;
}

export interface IndexedProject {
  project: AngorProject;
  projectData: ProjectDetails;
  profile: NostrProfile;
  stats: ProjectStats;
  investments: ProjectInvestment[];
  faq: ProjectFAQ;
  media: ProjectMedia;
  members: ProjectMembers;
  pubKeyToUse?: string;
  index: number;
}

// Filter & Sort Types
export type FilterType = 'all' | 'active' | 'upcoming' | 'completed' | 'expired';
export type SortType = 'default' | 'funding' | 'endDate' | 'investors' | 'newest' | 'amount';

export interface ProjectFilters {
  search?: string;
  status?: FilterType;
  minAmount?: number;
  maxAmount?: number;
  categories?: string[];
  sortBy?: SortType;
}

// Angor-specific event kinds
export const ANGOR_EVENT_KINDS = {
  PROFILE_METADATA: 0,
  PROJECT_NOTE: 1,
  PROJECT_REACTION: 7,
  ADDITIONAL_DATA: 30078,
  PROJECT_INFO: 3030, // New kind for project information
} as const;

// Indexer Configuration Types
export interface IndexerEntry {
  url: string;
  isPrimary: boolean;
}

export interface IndexerConfig {
  mainnet: IndexerEntry[];
  testnet: IndexerEntry[];
}

// Constants - Multi-indexer configuration
export const ANGOR_INDEXER_CONFIG: IndexerConfig = {
  mainnet: [
    { url: 'https://indexer.angor.io/', isPrimary: false },
    { url: 'https://fulcrum.angor.online/', isPrimary: true },
    { url: 'https://electrs.angor.online/', isPrimary: false },
    { url: 'https://cyphermunkhouse.angor.online/', isPrimary: false },
    { url: 'https://indexer.angor.fund/', isPrimary: false }
  ],
  testnet: [
    { url: 'https://test.indexer.angor.io/', isPrimary: true },
    { url: 'https://signet.angor.online/', isPrimary: false },
    { url: 'https://signet2.angor.online/', isPrimary: false }
  ]
};

// Helper function to get primary indexer URL
export const getPrimaryIndexerUrl = (network: 'mainnet' | 'testnet'): string => {
  const indexers = ANGOR_INDEXER_CONFIG[network];
  const primary = indexers.find(indexer => indexer.isPrimary);
  return primary ? primary.url : indexers[0]?.url || 
    (network === 'mainnet' ? 'https://indexer.angor.io/' : 'https://test.indexer.angor.io/');
};

// Backward compatibility - keep the old constant for now
export const ANGOR_INDEXER_BASE_URL = {
  mainnet: getPrimaryIndexerUrl('mainnet'),
  testnet: getPrimaryIndexerUrl('testnet')
};

export const ANGOR_RELAY_POOL = {
  mainnet: [
    'wss://relay.damus.io',
    'wss://relay.primal.net',
    'wss://nos.lol',
    'wss://relay.angor.io',
    'wss://relay2.angor.io'
  ],
  testnet: [
    'wss://relay.damus.io',
    'wss://relay.primal.net',
    'wss://nos.lol',
    'wss://relay.angor.io',
    'wss://relay2.angor.io'
  ]
} as const;

export interface NostrProjectDetails {
  founderKey?: string;
  founderRecoveryKey?: string;
  projectIdentifier?: string;
  nostrPubKey?: string;
  startDate?: number;
  endDate?: number;
  penaltyDays?: number;
  expiryDate?: number;
  targetAmount?: number;
  name?: string;
  about?: string;
  stages?: Array<{
    amountToRelease: number;
    releaseDate: number;
  }>;
  projectSeeders?: {
    threshold: number;
    secretHashes: string[];
  };
}

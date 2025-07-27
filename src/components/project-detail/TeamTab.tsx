import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { 
  ProjectMembers,
  NostrTeamMember
} from '@/types/angor';

export function TeamTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 bg-muted animate-pulse rounded-full" />
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AdditionalData {
  members?: ProjectMembers;
}

interface TeamTabProps {
  additionalData?: AdditionalData;
  TeamMemberProfile: React.ComponentType<{ pubkey: string; index: number }>;
}

export function TeamTab({ additionalData, TeamMemberProfile }: TeamTabProps) {
  return (
    <div className="space-y-6">
      {(additionalData?.members && 
        (((additionalData.members as ProjectMembers).pubkeys && Array.isArray((additionalData.members as ProjectMembers).pubkeys) && (additionalData.members as ProjectMembers).pubkeys!.length > 0) ||
         ('team' in additionalData.members && Array.isArray(additionalData.members.team) && additionalData.members.team.length > 0))) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Project Team</CardTitle>
            <p className="text-sm text-muted-foreground">
              Meet the team members working on this project
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {/* Display team members from pubkeys with clean profile layout */}
              {(additionalData.members as ProjectMembers).pubkeys && Array.isArray((additionalData.members as ProjectMembers).pubkeys) && 
                (additionalData.members as ProjectMembers).pubkeys!.map((pubkey: string, index: number) => (
                  <TeamMemberProfile key={pubkey} pubkey={pubkey} index={index} />
                ))
              }
              
              {/* Display team members from team array (if available) */}
              {'team' in additionalData.members && Array.isArray(additionalData.members.team) && 
                additionalData.members.team.map((member: NostrTeamMember, index: number) => (
                  <div key={`team-${index}`} className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                    <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                      <AvatarImage src={member.picture} />
                      <AvatarFallback className="text-lg">
                        {member.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {member.name || 'Team Member'}
                        </h4>
                        <p className="text-sm text-primary font-medium">
                          {member.role || 'Team Member'}
                        </p>
                      </div>
                      {member.bio && (
                        <p className="text-sm text-foreground/80 leading-relaxed">{member.bio}</p>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Team Information</h3>
            <p className="text-muted-foreground mb-4">
              Team information will be available once provided by the creator.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

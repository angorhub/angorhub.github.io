import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RichContent } from '@/components/ui/RichContent';
import { Star, ArrowLeft, ExternalLink } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { formatDistanceToNow } from 'date-fns';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites } = useFavorites();

  const handleRemoveFavorite = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromFavorites(projectId);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              Favorite Projects
            </h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start adding projects to your favorites by clicking the star icon on any project.
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            Favorite Projects
            <Badge variant="secondary" className="ml-2">
              {favorites.length}
            </Badge>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card 
              key={favorite.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProjectClick(favorite.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={favorite.picture} />
                    <AvatarFallback>
                      {favorite.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 flex-1 pr-2">
                        {favorite.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                        className="text-yellow-500 hover:text-yellow-600 shrink-0"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                    {favorite.description && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        <RichContent content={favorite.description} />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Added {formatDistanceToNow(new Date(favorite.addedAt), { addSuffix: true })}
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

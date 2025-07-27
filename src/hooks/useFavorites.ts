import { useLocalStorage } from './useLocalStorage';

export interface FavoriteProject {
  id: string;
  name: string;
  picture?: string;
  description?: string;
  addedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteProject[]>('angor-favorites', []);

  const addToFavorites = (projectId: string, projectName?: string, projectPicture?: string, projectDescription?: string) => {
    const newFavorite: FavoriteProject = {
      id: projectId,
      name: projectName || projectId,
      picture: projectPicture,
      description: projectDescription,
      addedAt: Date.now()
    };
    
    setFavorites(prev => {
      // Check if already exists
      if (prev.some(fav => fav.id === projectId)) {
        return prev;
      }
      return [...prev, newFavorite];
    });
  };

  const removeFromFavorites = (projectId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== projectId));
  };

  const toggleFavorite = (projectId: string, projectName?: string, projectPicture?: string, projectDescription?: string) => {
    if (isFavorite(projectId)) {
      removeFromFavorites(projectId);
    } else {
      addToFavorites(projectId, projectName, projectPicture, projectDescription);
    }
  };

  const isFavorite = (projectId: string): boolean => {
    return favorites.some(fav => fav.id === projectId);
  };

  const getFavoriteProjects = (): FavoriteProject[] => {
    return favorites.sort((a, b) => b.addedAt - a.addedAt);
  };

  return {
    favorites: getFavoriteProjects(),
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    favoriteCount: favorites.length
  };
}

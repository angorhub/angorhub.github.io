import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SearchContextType {
  isSearchOpen: boolean;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export { SearchContext };

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <SearchContext.Provider value={{ 
      isSearchOpen, 
      toggleSearch, 
      openSearch, 
      closeSearch 
    }}>
      {children}
    </SearchContext.Provider>
  );
}

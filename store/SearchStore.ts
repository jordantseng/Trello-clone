import { create } from 'zustand';

interface SearchStore {
  searchString: string;
  setSearchString: (seachString: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchString: '',
  setSearchString: (searchString) => {
    set({ searchString });
  },
}));

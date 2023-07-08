import { create } from 'zustand';

interface SearchStore {
  searchString: string;
  updateSearchString: (seachString: string) => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  searchString: '',
  updateSearchString: (searchString) => {
    set({ searchString });
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import { REGIONS, DEFAULT_REGION, Region, RegionCode } from '@/lib/regions';

interface RegionState {
  currentRegion: Region;
  setRegion: (id: RegionCode) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      currentRegion: DEFAULT_REGION,
      setRegion: (id) => {
        const region = REGIONS.find((r) => r.id === id) || DEFAULT_REGION;
        set({ currentRegion: region });
      },
    }),
    {
      name: 'marketplace-region', // Имя ключа в localStorage
    }
  )
);
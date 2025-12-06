export type RegionCode = 'ru' | 'kz' | 'us';

export interface Region {
  id: RegionCode;
  name: string;
  currency: string;
  symbol: string;
  rate: number; 
  flag: string;
}

export const REGIONS: Region[] = [
  { id: 'ru', name: 'Россия',     currency: 'RUB', symbol: '₽', rate: 1,    flag: '🇷🇺' },
  { id: 'kz', name: 'Казахстан',  currency: 'KZT', symbol: '₸', rate: 5,    flag: '🇰🇿' }, 
  { id: 'us', name: 'USA',       currency: 'USD', symbol: '$', rate: 0.011, flag: '🇺🇸' },
];

export const DEFAULT_REGION = REGIONS[0];
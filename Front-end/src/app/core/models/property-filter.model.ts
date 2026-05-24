export interface PropertyFilters {
  operation?: 'all' | 'rent' | 'sale';
  category?: string;
  location?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  features?: {
    garage?: boolean;
    terrace?: boolean;
    pool?: boolean;
    garden?: boolean;
    ranchon?: boolean;
    balcony?: boolean;
    jacuzzi?: boolean;
    furnished?: boolean;
  };
}

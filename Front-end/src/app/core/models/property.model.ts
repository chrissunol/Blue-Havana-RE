export type PropertyOperation = 'rent' | 'sale';
export type PropertyStatus = 'available' | 'sold' | 'rented';

export interface TranslatedText {
  es: string;
  en: string;
  fr: string;
}

export interface PropertyFeatures {
  garage?: boolean;
  terrace?: boolean;
  pool?: boolean;
  garden?: boolean;
  ranchon?: boolean;
  balcony?: boolean;
  jacuzzi?: boolean;
  furnished?: boolean;
  other?: boolean;
  otherText?: string;
}

export interface Property {
  id: string;
  title: TranslatedText;
  category: TranslatedText;
  price: number;
  annualPrice?: number;
  pricePerM2?: number;
  operation: PropertyOperation;
  location: TranslatedText;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  area: number;
  images: string[];
  visible: boolean;
  featured: boolean;
  description?: TranslatedText;
  features?: PropertyFeatures;
  status?: PropertyStatus;
}


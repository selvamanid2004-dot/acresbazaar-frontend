export interface PropertySpecs {
  beds?: number;
  baths?: number;
  sqft?: number;
  area?: string;
  plotSize?: string;
  plotArea?: string;
  bhk?: string;
  bedrooms?: number;
  bathrooms?: number;
  dimensions?: string;
  facing?: string;
  possessionDate?: string;
  status?: 'Ready to Move' | 'Under Construction' | 'Newly Launched' | string;
  reraApproved?: boolean | string;
  roadAccess?: string;
  builtUpArea?: string;
  keyFeatures?: string[];
  amenities?: string[];
  // Dynamic Category Specifics
  length?: string;
  width?: string;
  roadWidth?: string;
  cornerPlot?: boolean | string;
  dtcpApproved?: boolean | string;
  floor?: number | string;
  totalFloors?: number | string;
  parking?: string;
  furnishing?: string;
  commercialType?: string;
  suitableFor?: string;
  waterAvailability?: string;
  electricity?: string;
  soilType?: string;
  nearbyLandmark?: string;
}

export interface Property {
  id: string;
  title: string;
  slug?: string;
  category: string;
  tier: 'platinum' | 'gold' | 'premium' | 'standard';
  type: string;
  listingType?: 'buy' | 'rent' | string;
  price: number | string;
  priceDisplay?: string;
  pricePerSqFt?: string;
  location: string;
  exactAddress?: string;
  address?: string;
  city?: string;
  specs: PropertySpecs;
  shortDescription?: string;
  description?: string;
  imageUrl: string;
  galleryImages?: string[];
  badges?: string[];
  isNewLaunch?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  reraId?: string;
  contactPhone?: string;
  ownerId?: string;
  ownerRole?: 'seller' | 'dealer';
  submissionStatus?: 'Draft' | 'Pending Verification' | 'Approved' | 'Rejected' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submissionDate?: string;
  createdAt?: string;
  dealer?: {
    name: string;
    phone: string;
    email?: string;
  };
  postedBy?: {
    name: string;
    role: 'Owner' | 'Dealer' | 'Scout' | 'Developer' | string;
    verified: boolean;
    phone?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: string;
  iconName: string;
  description: string;
  imageUrl: string;
}

export interface HeroSlide {
  id: number;
  categoryLabel: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  description: string;
  priceStarting: string;
  location: string;
  imageUrl: string;
  ctaText: string;
  secondaryCtaText: string;
}

export interface SearchFilter {
  tab?: string;
  category: string;
  location: string;
  budgetRange: string;
}

export interface ScoutStep {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export interface WhyUsBenefit {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  icon: string;
}

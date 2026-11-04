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
  videos?: string[];
  videoCount?: number;
  hasVideos?: boolean;
  detailsVisible?: boolean;
  isDetailsLocked?: boolean;
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
  owner_contact?: {
    name: string;
    phone: string;
    email?: string;
  };
  ownerContact?: {
    name: string;
    phone: string;
    email?: string;
  };
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
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
  category?: string;
  location?: string;
  budgetRange?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  propertyType?: string;
  bhk?: string;
  facing?: string;
  furnishing?: string;
  constructionStatus?: string;
  search?: string;
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


export function parseAndFormatIndianPrice(input: any): { numericPrice: number; priceDisplay: string } {
  if (typeof input === 'number') {
    const num = isNaN(input) ? 0 : Math.round(input);
    return {
      numericPrice: num,
      priceDisplay: num > 0 ? `₹${num.toLocaleString('en-IN')}` : 'Price on Request'
    };
  }

  const str = String(input || '').trim();
  if (!str) {
    return { numericPrice: 0, priceDisplay: 'Price on Request' };
  }

  // Check for Cr / Crore (e.g., 1.5 Cr, 1Cr, 2 Crore)
  const crMatch = str.match(/([\d.]+)\s*(cr|crore|crores)\b/i);
  if (crMatch) {
    const val = Math.round(parseFloat(crMatch[1]) * 10000000);
    return {
      numericPrice: val,
      priceDisplay: `₹${val.toLocaleString('en-IN')}`
    };
  }

  // Check for L / Lakh / Lac (e.g., 50 L, 50L, 50 Lakh, 50 Lac)
  const lakhMatch = str.match(/([\d.]+)\s*(l|lakh|lakhs|lac|lacs)\b/i);
  if (lakhMatch) {
    const val = Math.round(parseFloat(lakhMatch[1]) * 100000);
    return {
      numericPrice: val,
      priceDisplay: `₹${val.toLocaleString('en-IN')}`
    };
  }

  // Check for K / Thousand (e.g., 25 K, 25K, 25 Thousand)
  const kMatch = str.match(/([\d.]+)\s*(k|thousand|thousands)\b/i);
  if (kMatch) {
    const val = Math.round(parseFloat(kMatch[1]) * 1000);
    return {
      numericPrice: val,
      priceDisplay: `₹${val.toLocaleString('en-IN')}`
    };
  }

  // Direct numeric value (e.g. "15000000", "₹1,50,00,000", "$15,000,000")
  const numOnly = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (!isNaN(numOnly) && numOnly > 0) {
    const val = Math.round(numOnly);
    return {
      numericPrice: val,
      priceDisplay: `₹${val.toLocaleString('en-IN')}`
    };
  }

  return {
    numericPrice: 0,
    priceDisplay: str.startsWith('₹') ? str : (str ? `₹${str}` : 'Price on Request')
  };
}

export function formatIndianPrice(price: number | string | undefined | null, priceDisplay?: string): string {
  if (priceDisplay && priceDisplay.startsWith('₹') && !priceDisplay.includes('$')) {
    return priceDisplay;
  }
  const parsed = parseAndFormatIndianPrice(price);
  return parsed.priceDisplay;
}

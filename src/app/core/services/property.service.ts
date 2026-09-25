import { Injectable, signal, computed } from '@angular/core';
import { Category, HeroSlide, Property, ScoutStep, SearchFilter, WhyUsBenefit } from '../models/property.model';
import { getApiBaseUrl } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  constructor() {
    this.syncPlatinumFromBackend();
    this.syncCategoriesFromBackend();
    this.syncHomeSettingsFromBackend();
    this.syncPlansFromBackend();
  }

  // Hero Slides (Category-focused, controlled 40-45vh banners)
  private readonly heroSlides = signal<HeroSlide[]>([
    {
      id: 1,
      categoryLabel: 'NEW LAUNCH',
      badge: 'Exclusive Pre-Launch',
      titlePrefix: '',
      titleHighlight: "Find a Property You'll Love",
      titleSuffix: '',
      description: 'Discover residential properties, premium plots, villas and apartments in the locations you prefer.',
      priceStarting: 'Starting at $450,000',
      location: 'Miami Coastline & Austin Valley',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Now',
      secondaryCtaText: 'View Properties'
    },
    {
      id: 2,
      categoryLabel: 'PLATINUM PLOTS',
      badge: 'Clear Title & RERA',
      titlePrefix: '',
      titleHighlight: 'Prime Plotted Lands & Estates',
      titleSuffix: '',
      description: 'Clear-title gated township plots with wide road access, water infrastructure and high appreciation.',
      priceStarting: 'Starting at $280,000',
      location: 'Greenfield Corridor & Dallas North',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Now',
      secondaryCtaText: 'View Properties'
    },
    {
      id: 3,
      categoryLabel: 'PLATINUM VILLAS',
      badge: 'Private Residences',
      titlePrefix: '',
      titleHighlight: 'Bespoke Luxury Villas',
      titleSuffix: '',
      description: 'Independent 4 & 5 BHK designer villas with private pools, gardens, and 24/7 guarded security.',
      priceStarting: 'Starting at $1,250,000',
      location: 'Palm Springs & Beverly Hills',
      imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Now',
      secondaryCtaText: 'View Properties'
    },
    {
      id: 4,
      categoryLabel: 'PREMIUM APARTMENTS',
      badge: 'Urban High-Rise',
      titlePrefix: '',
      titleHighlight: 'Modern Skyline Residences',
      titleSuffix: '',
      description: 'Spacious 2, 3 & 4 BHK apartments with panoramic balconies, rooftop amenities and transit connectivity.',
      priceStarting: 'Starting at $390,000',
      location: 'Downtown Financial District',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Now',
      secondaryCtaText: 'View Properties'
    }
  ]);

  // Quick Property Categories (7 items required)
  private readonly categories = signal<Category[]>([
    {
      id: 'all-res',
      name: 'All Residential',
      slug: 'all-residential',
      count: '4,850+ Properties',
      iconName: 'home',
      description: 'Homes, apartments & townhouses',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'plots',
      name: 'Plots',
      slug: 'plots',
      count: '1,240+ Plots',
      iconName: 'map',
      description: 'Gated & clear title plots',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'villas',
      name: 'Villas',
      slug: 'villas',
      count: '890+ Villas',
      iconName: 'castle',
      description: 'Independent luxury estates',
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'apartments',
      name: 'Apartments / Flats',
      slug: 'apartments',
      count: '3,120+ Flats',
      iconName: 'building',
      description: 'High-rise & studio apartments',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'houses',
      name: 'Independent Houses',
      slug: 'independent-houses',
      count: '960+ Houses',
      iconName: 'warehouse',
      description: 'Standalone duplexes & homes',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'commercial',
      name: 'Commercial Spaces',
      slug: 'commercial',
      count: '780+ Spaces',
      iconName: 'briefcase',
      description: 'Office spaces & retail shops',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'farm-land',
      name: 'Farm Lands',
      slug: 'farm-lands',
      count: '420+ Acres',
      iconName: 'trees',
      description: 'Agricultural & weekend farmlands',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  // Property signals initialized to empty arrays (no hardcoded/sample properties)
  private readonly newLaunches = signal<Property[]>([]);
  private readonly platinumPlots = signal<Property[]>([]);
  private readonly platinumVillas = signal<Property[]>([]);
  private readonly newApartments = signal<Property[]>([]);
  private readonly commercialProperties = signal<Property[]>([]);
  private readonly independentHouses = signal<Property[]>([]);
  private readonly farmLands = signal<Property[]>([]);

  // Section 12: Why Choose AcresBazaar (4 items specified)
  private readonly whyUsBenefits = signal<WhyUsBenefit[]>([
    {
      id: 'why-1',
      title: 'Verified Properties',
      description: 'Every plot, villa, and apartment undergoes a multi-point legal due-diligence and on-site physical check.',
      badgeText: '100% Verified',
      icon: 'shield-check'
    },
    {
      id: 'why-2',
      title: 'Easy Property Search',
      description: 'Find your dream home in seconds using verified location filters, property categories and budget selectors.',
      badgeText: 'Fast & Intuitive',
      icon: 'search-sparkle'
    },
    {
      id: 'why-3',
      title: 'Gold & Premium Listings',
      description: 'Clear categorization separating crowd-sourced scout deals from certified direct owner and dealer listings.',
      badgeText: 'Exclusive Portfolios',
      icon: 'award-ribbon'
    },
    {
      id: 'why-4',
      title: 'Property Scout Rewards',
      description: 'Earn generous cash bounties simply by snapping and submitting for-sale boards spotted around your city.',
      badgeText: 'Earn Bounties',
      icon: 'compass-scout'
    }
  ]);

  // Public Getters
  getHeroSlides() {
    return this.heroSlides.asReadonly();
  }

  getCategories() {
    return this.categories.asReadonly();
  }

  getNewLaunches() {
    return this.newLaunches.asReadonly();
  }

  getPlatinumPlots() {
    return this.platinumPlots.asReadonly();
  }

  getPlatinumVillas() {
    return this.platinumVillas.asReadonly();
  }

  getNewApartments() {
    return this.newApartments.asReadonly();
  }

  getCommercialProperties() {
    return this.commercialProperties.asReadonly();
  }

  getIndependentHouses() {
    return this.independentHouses.asReadonly();
  }

  getFarmLands() {
    return this.farmLands.asReadonly();
  }

  getWhyUsBenefits() {
    return this.whyUsBenefits.asReadonly();
  }

  private customProperties = signal<Property[]>(this.loadCustomProperties());

  private loadCustomProperties(): Property[] {
    try {
      const data = localStorage.getItem('aura_custom_properties');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveCustomProperties(props: Property[]): void {
    this.customProperties.set(props);
    try {
      // Clean oversized data URLs to avoid QuotaExceededError in localStorage
      const safeProps = props.map(p => {
        const isHugeDataUrl = (url?: string) => url && url.startsWith('data:') && url.length > 2048;
        return {
          ...p,
          imageUrl: isHugeDataUrl(p.imageUrl) ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' : p.imageUrl,
          galleryImages: (p.galleryImages || []).map(img => isHugeDataUrl(img) ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' : img)
        };
      });
      localStorage.setItem('aura_custom_properties', JSON.stringify(safeProps));
    } catch (e) {
      console.warn('Could not cache properties to localStorage:', e);
    }
  }

  addCustomProperty(prop: Partial<Property> & { title: string }): Property {
    const fullProp: Property = {
      id: prop.id || 'cust-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: prop.title,
      slug: prop.slug || prop.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: prop.category || 'all-residential',
      tier: 'platinum',
      type: prop.type || 'residence',
      listingType: prop.listingType || 'buy',
      price: prop.price || 'Price on Request',
      priceDisplay: prop.priceDisplay || (typeof prop.price === 'string' ? prop.price : (prop.price ? `₹${prop.price}` : 'Price on Request')),
      location: prop.location || '',
      city: prop.city || '',
      address: prop.address || prop.location || '',
      specs: prop.specs || {},
      shortDescription: prop.shortDescription || prop.description || '',
      description: prop.description || prop.shortDescription || '',
      imageUrl: prop.imageUrl || '',
      galleryImages: prop.galleryImages || (prop.imageUrl ? [prop.imageUrl] : []),
      badges: prop.badges || ['Platinum Exclusive', 'Verified Listing'],
      isVerified: true,
      submissionStatus: prop.submissionStatus || 'Pending Verification',
      submissionDate: prop.submissionDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      ownerId: prop.ownerId,
      ownerRole: prop.ownerRole,
      dealer: prop.dealer,
      postedBy: prop.postedBy || {
        name: prop.dealer?.name || 'Verified Partner',
        role: prop.ownerRole === 'dealer' ? 'Dealer' : 'Owner',
        verified: true,
        phone: prop.dealer?.phone
      }
    };

    const list = [fullProp, ...this.loadCustomProperties()];
    this.saveCustomProperties(list);
    return fullProp;
  }

  updateCustomProperty(prop: Property): boolean {
    const current = this.loadCustomProperties();
    const index = current.findIndex(p => p.id === prop.id);
    if (index !== -1) {
      current[index] = prop;
      this.saveCustomProperties(current);
      return true;
    }
    return false;
  }

  deleteCustomProperty(propId: string): void {
    const list = this.loadCustomProperties().filter(p => p.id !== propId);
    this.saveCustomProperties(list);
  }

  syncPlatinumFromBackend(): Promise<Property[]> {
    // Fetch live approved properties from NestJS REST API
    return fetch(`${getApiBaseUrl()}/properties/public`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.properties && Array.isArray(data.properties)) {
          const apiProps: Property[] = data.properties.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            priceDisplay: p.priceDisplay || (p.price ? (String(p.price).startsWith('₹') || String(p.price).startsWith('$') ? String(p.price) : `₹${p.price}`) : 'Price on Request'),
            location: p.location || (p.city ? `${p.city}` : 'Prime Location'),
            city: p.city || '',
            address: p.address || p.location || '',
            exactAddress: p.address || p.location || '',
            type: p.category,
            category: p.category,
            tier: ((p.tier || p.planType || '').toLowerCase() === 'gold' ? 'gold' : 'platinum') as 'gold' | 'platinum',
            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
            galleryImages: p.galleryImages || [],
            specs: p.specs || {},
            description: p.description,
            shortDescription: p.description || '',
            submissionDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
            submissionStatus: 'APPROVED',
            ownerName: p.sellerName,
            isVerified: true
          }));

          this.saveCustomProperties(apiProps);

          // Distribute into category signals for homepage sections
          const isTerm = (p: Property, terms: string[]) => {
            const cat = (p.category || '').toLowerCase();
            const typ = (p.type || '').toLowerCase();
            return terms.some(t => cat.includes(t) || typ.includes(t));
          };

          const plots = apiProps.filter(p => isTerm(p, ['plot', 'land', 'site', 'layout']) && !isTerm(p, ['farm']));
          const villas = apiProps.filter(p => isTerm(p, ['villa', 'estate', 'bungalow']));
          const apts = apiProps.filter(p => isTerm(p, ['apartment', 'flat', 'penthouse', 'high-rise']));
          const commercial = apiProps.filter(p => isTerm(p, ['commercial', 'office', 'retail', 'shop', 'tech park', 'grade-a']));
          const houses = apiProps.filter(p => isTerm(p, ['house', 'independent', 'duplex']));
          const farms = apiProps.filter(p => isTerm(p, ['farm', 'agriculture']));

          this.platinumPlots.set(plots);
          this.platinumVillas.set(villas);
          this.newApartments.set(apts);
          this.commercialProperties.set(commercial);
          this.independentHouses.set(houses);
          this.farmLands.set(farms);
          this.newLaunches.set(apiProps.slice(0, 4));

          return apiProps;
        }
        return [];
      })
      .catch(() => []);
  }

  syncCategoriesFromBackend(): void {
    try {
      fetch(`${getApiBaseUrl()}/categories`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.categories && Array.isArray(data.categories)) {
            const apiCats: Category[] = data.categories.map((c: any) => ({
              id: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
              name: c.name,
              slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
              count: `${c.propertiesCount ?? 0}+ Properties`,
              iconName: 'home',
              description: c.description || 'Premium verified properties',
              imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80'
            }));
            if (apiCats.length > 0) {
              this.categories.set(apiCats);
            }
          }
        })
        .catch(() => {});
    } catch {}
  }

  syncHomeSettingsFromBackend(): void {
    try {
      fetch(`${getApiBaseUrl()}/settings/group/home`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.settings) {
            const headline = data.settings.hero_title || data.settings.hero_headline;
            const subtitle = data.settings.hero_subtitle || data.settings.hero_subheading;
            const bgImg = data.settings.hero_image;
            const badge = data.settings.hero_badge;
            const price = data.settings.hero_price_label;

            if (headline || subtitle || bgImg || badge || price) {
              const current = this.heroSlides();
              const updated = [...current];
              if (updated.length > 0) {
                updated[0] = {
                  ...updated[0],
                  titleHighlight: headline || updated[0].titleHighlight,
                  description: subtitle || updated[0].description,
                  imageUrl: bgImg || updated[0].imageUrl,
                  badge: badge || updated[0].badge,
                  priceStarting: price || updated[0].priceStarting
                };
                this.heroSlides.set(updated);
              }
            }
          }
        })
        .catch(() => {});
    } catch {}
  }

  // Live Plans from PostgreSQL
  private readonly plans = signal<any[]>([]);
  public readonly plansList = this.plans.asReadonly();

  readonly goldPlan = computed(() => {
    const p = this.plans().find(x => x.planId?.toLowerCase() === 'gold');
    return {
      name: p?.name || 'Gold Plan',
      price: p?.price !== undefined ? p.price : 999,
      period: p?.period || p?.billing_period || 'month',
      badge: p?.badge || 'BUYER ACCESS',
      description: p?.description || 'Curated verified listings under Gold Plan membership. Unlock full legal dossiers, exact addresses, and direct owner contacts.',
      benefits: p?.benefits || [],
      content: p?.content || ''
    };
  });

  readonly platinumPlan = computed(() => {
    const p = this.plans().find(x => x.planId?.toLowerCase() === 'platinum');
    return {
      name: p?.name || 'Platinum VIP Plan',
      price: p?.price !== undefined ? p.price : 2499,
      period: p?.period || p?.billing_period || 'year',
      badge: p?.badge || 'VIP ALL-ACCESS',
      description: p?.description || 'Exclusive off-market inventory, priority site viewings, dedicated property lawyer, and unmetered owner connections.',
      benefits: p?.benefits || [],
      content: p?.content || ''
    };
  });

  syncPlansFromBackend(): void {
    try {
      fetch(`${getApiBaseUrl()}/plans`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.plans && Array.isArray(data.plans)) {
            this.plans.set(data.plans);
          }
        })
        .catch(() => {});
    } catch {}
  }

  getPlan(planId: string) {
    return this.plans().find(p => p.planId?.toLowerCase() === planId.toLowerCase());
  }

  getPropertiesByOwner(ownerId: string): Property[] {
    return this.loadCustomProperties().filter(p => p.ownerId === ownerId);
  }

  getAllProperties(): Property[] {
    // Only APPROVED properties should be displayed publicly
    const custom: Property[] = this.customProperties()
      .filter(p => !p.submissionStatus || p.submissionStatus.toUpperCase() === 'APPROVED')
      .map(p => ({
        ...p,
        tier: (p.tier?.toLowerCase() === 'gold' ? 'gold' : 'platinum') as 'gold' | 'platinum',
        priceDisplay: String(p.priceDisplay || p.price || ''),
        shortDescription: p.shortDescription || p.description || '',
        isVerified: p.isVerified !== undefined ? p.isVerified : true,
        postedBy: p.postedBy || {
          name: p.dealer?.name || (p as any).ownerName || 'Verified Partner',
          role: p.ownerRole === 'dealer' ? 'Dealer' : 'Owner',
          phone: p.dealer?.phone || '+91 98450 00000',
          verified: true
        }
      }));

    return custom;
  }

  getCategoryMetadata(slug: string): { title: string; description: string; count: string } {
    const s = slug.toLowerCase().trim();
    if (s.includes('plot') || s === 'plots' || s === 'plots-land') {
      return {
        title: 'Plots & Land',
        description: 'Explore verified residential township plots, gated lands, and high-appreciation investment parcels with clear titles.',
        count: `${this.getPropertiesByCategory('plots').length} Land Parcels Available`
      };
    }
    if (s.includes('villa') || s === 'villas' || s === 'villas-estates') {
      return {
        title: 'Villas & Estates',
        description: 'Bespoke designer residences, private infinity pool villas, and ultra-luxury independent estates in premier neighborhoods.',
        count: `${this.getPropertiesByCategory('villas').length} Luxury Villas Available`
      };
    }
    if (s.includes('apartment') || s.includes('flat') || s === 'apartments') {
      return {
        title: 'Apartments / Flats',
        description: 'High-rise skyline penthouses, modern 2, 3 & 4 BHK residences with panoramic balconies and premier lifestyle amenities.',
        count: `${this.getPropertiesByCategory('apartments').length} Apartments Available`
      };
    }
    if (s.includes('house') || s === 'houses' || s === 'independent-houses') {
      return {
        title: 'Independent Houses',
        description: 'Standalone duplexes, private colonial manors, and custom craftsman residences with private yards and garages.',
        count: `${this.getPropertiesByCategory('houses').length} Independent Homes Available`
      };
    }
    if (s.includes('commercial') || s === 'commercial-spaces') {
      return {
        title: 'Commercial Spaces',
        description: 'Grade-A corporate office suites, central high-street retail showrooms, and prime commercial assets with high rental yields.',
        count: `${this.getPropertiesByCategory('commercial').length} Commercial Units Available`
      };
    }
    if (s.includes('farm') || s === 'farm-lands' || s === 'farm-land') {
      return {
        title: 'Farm Lands',
        description: 'Fertile agricultural acreage, weekend organic agro-retreats, and serene countryside parcels with natural water access.',
        count: `${this.getPropertiesByCategory('farm-lands').length} Farm Lands Available`
      };
    }
    return {
      title: 'All Residential Properties',
      description: 'Complete verified collection of residential apartments, luxury villas, and independent homes across prime metropolitan corridors.',
      count: `${this.getPropertiesByCategory('residential').length} Residential Properties Available`
    };
  }

  getPropertiesByCategory(category: string): Property[] {
    const all = this.getAllProperties();
    const catLower = (category || '').toLowerCase().trim();

    if (catLower === 'all' || catLower === '') {
      return all;
    }

    const matches = (p: Property, terms: string[]) => {
      const pCat = (p.category || '').toLowerCase();
      const pType = (p.type || '').toLowerCase();
      return terms.some(t => pCat.includes(t) || pType.includes(t));
    };

    if (catLower.includes('farm')) {
      return all.filter(p => matches(p, ['farm', 'agriculture']));
    }

    if (catLower.includes('apartment') || catLower.includes('flat')) {
      return all.filter(p => matches(p, ['apartment', 'flat', 'penthouse', 'high-rise']));
    }

    if (catLower.includes('villa') || catLower.includes('estate')) {
      return all.filter(p => matches(p, ['villa', 'estate', 'bungalow']));
    }

    if (catLower.includes('plot') || (catLower.includes('land') && !catLower.includes('farm'))) {
      return all.filter(p => matches(p, ['plot', 'land', 'site', 'layout']) && !p.category?.toLowerCase().includes('farm'));
    }

    if (catLower.includes('house') || catLower.includes('independent')) {
      return all.filter(p => matches(p, ['house', 'independent', 'duplex', 'bungalow', 'villa', 'home']));
    }

    if (catLower.includes('commercial')) {
      return all.filter(p => matches(p, ['commercial', 'office', 'retail', 'shop', 'tech park', 'grade-a']));
    }

    if (catLower.includes('project') || catLower.includes('new launch')) {
      return all.filter(p => p.isNewLaunch);
    }

    if (catLower.includes('residential')) {
      return all.filter(p => matches(p, ['residential', 'apartment', 'flat', 'villa', 'estate', 'house', 'duplex', 'home']));
    }

    return all.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pType = (p.type || '').toLowerCase();
      return pCat.includes(catLower) || pType.includes(catLower) || catLower.includes(pCat);
    });
  }

  getPropertiesByCategoryAndTier(category: string, tier: 'gold' | 'platinum'): Property[] {
    const props = this.getPropertiesByCategory(category);
    return props.filter(p => {
      const pTier = (p.tier || '').toLowerCase();
      if (tier === 'gold') {
        return pTier === 'gold';
      } else {
        return pTier === 'platinum' || pTier === 'premium';
      }
    });
  }

  getGoldPropertiesByCategory(category: string): Property[] {
    return this.getPropertiesByCategoryAndTier(category, 'gold');
  }

  getPlatinumPropertiesByCategory(category: string): Property[] {
    return this.getPropertiesByCategoryAndTier(category, 'platinum');
  }
}



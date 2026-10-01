import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HeroSliderComponent } from './components/hero-slider/hero-slider.component';
import { PropertySearchComponent } from './components/property-search/property-search.component';
import { PropertyCategoriesComponent } from './components/property-categories/property-categories.component';
import { ContinueBrowsingComponent } from './components/continue-browsing/continue-browsing.component';
import { NewLaunchSectionComponent } from './components/new-launch-section/new-launch-section.component';
import { FeaturedSectionsComponent } from './components/featured-sections/featured-sections.component';
import { GoldPremiumComponent } from './components/gold-premium/gold-premium.component';
import { PropertyScoutComponent } from './components/property-scout/property-scout.component';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us.component';
import { CtaBannerComponent } from './components/cta-banner/cta-banner.component';
import { AdCarouselComponent } from '../../shared/components/ad-carousel/ad-carousel.component';

import { Property, SearchFilter } from '../../core/models/property.model';
import { NotificationService } from '../../shared/services/notification.service';
import { NavStateService } from '../../core/services/nav-state.service';
import { PropertyService } from '../../core/services/property.service';
import { ActivityService } from '../../core/services/activity.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSliderComponent,
    PropertySearchComponent,
    PropertyCategoriesComponent,
    ContinueBrowsingComponent,
    NewLaunchSectionComponent,
    FeaturedSectionsComponent,
    GoldPremiumComponent,
    PropertyScoutComponent,
    WhyChooseUsComponent,
    CtaBannerComponent,
    AdCarouselComponent
  ],
  template: `
    <div class="marketplace-home-wrapper">
      
      <!-- 1. Property Hero Banner (40-45vh) -->
      <app-hero-slider
        (exploreNowClicked)="scrollTo('search-section')"
        (viewPropertiesClicked)="scrollTo('new-launches')">
      </app-hero-slider>

      <!-- 2. Large Property Search Box -->
      <app-property-search
        (searchSubmitted)="onSearchFilter($event)">
      </app-property-search>

      <!-- 2.5 DEDICATED DATABASE-BACKED SEARCH RESULTS SECTION -->
      <section 
        id="search-results-section" 
        class="search-results-section section-py" 
        *ngIf="activeSearchFilter()">
        <div class="container">
          
          <!-- Search Results Header & Filter Badges -->
          <div class="search-head-bar">
            <div class="search-head-left">
              <div class="search-badge-row">
                <span class="search-badge">DATABASE SEARCH RESULTS</span>
                <span class="search-count-pill" *ngIf="!isSearching()">
                  {{ searchResults().length }} {{ searchResults().length === 1 ? 'Property Found' : 'Properties Found' }}
                </span>
              </div>
              <h2 class="search-title">Matching Properties</h2>
              
              <!-- Active Filter Chips -->
              <div class="active-filter-chips">
                <span class="filter-chip" *ngIf="activeSearchFilter()?.location">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Location: <strong>{{ activeSearchFilter()?.location }}</strong>
                </span>

                <span class="filter-chip" *ngIf="getCategoryLabel(activeSearchFilter()?.category)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  Category: <strong>{{ getCategoryLabel(activeSearchFilter()?.category) }}</strong>
                </span>

                <span class="filter-chip" *ngIf="getBudgetLabel(activeSearchFilter()?.budgetRange)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Budget: <strong>{{ getBudgetLabel(activeSearchFilter()?.budgetRange) }}</strong>
                </span>

                <span class="filter-chip" *ngIf="activeSearchFilter()?.propertyType">
                  Type: <strong>{{ activeSearchFilter()?.propertyType }}</strong>
                </span>

                <span class="filter-chip" *ngIf="activeSearchFilter()?.bhk">
                  BHK: <strong>{{ activeSearchFilter()?.bhk }}</strong>
                </span>

                <span class="filter-chip" *ngIf="activeSearchFilter()?.facing">
                  Facing: <strong>{{ activeSearchFilter()?.facing }}</strong>
                </span>

                <span class="filter-chip" *ngIf="activeSearchFilter()?.furnishing">
                  Furnishing: <strong>{{ activeSearchFilter()?.furnishing }}</strong>
                </span>

                <span class="filter-chip" *ngIf="activeSearchFilter()?.constructionStatus">
                  Status: <strong>{{ activeSearchFilter()?.constructionStatus }}</strong>
                </span>
              </div>
            </div>

            <div class="search-head-right">
              <button type="button" class="btn btn-clear-results" (click)="clearSearchResults()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Clear Search</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div class="search-loading-box" *ngIf="isSearching()">
            <div class="search-spinner"></div>
            <p class="search-loading-text">Filtering verified properties across database...</p>
          </div>

          <!-- Results Grid (matching cards) -->
          <div class="search-grid" *ngIf="!isSearching() && searchResults().length > 0">
            <div *ngFor="let item of searchResults()" class="listing-card">
              
              <!-- Card Image Frame -->
              <div class="card-thumb-wrap">
                <img [src]="item.imageUrl" [alt]="item.title" class="listing-img" loading="lazy" />
                
                <div class="card-tag-overlay">
                  <span class="tier-pill" [class.gold-pill]="item.tier === 'gold'" [class.plat-pill]="item.tier === 'platinum'">
                    {{ item.tier === 'gold' ? 'GOLD PLAN' : 'PLATINUM VIP' }}
                  </span>
                  <span class="cat-pill">{{ item.type || item.category | uppercase }}</span>
                </div>

                <div class="verified-badge-mini" *ngIf="item.isVerified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>VERIFIED</span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body">
                <div class="type-and-bhk">
                  <span class="prop-type-tag">{{ item.type | uppercase }}</span>
                  <span class="bhk-tag" *ngIf="item.specs.beds">{{ item.specs.beds }} BHK</span>
                  <span class="bhk-tag" *ngIf="item.specs.plotSize">{{ item.specs.plotSize }}</span>
                </div>

                <h3 class="project-name" [title]="item.title">{{ item.title }}</h3>

                <div class="location-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ item.location }}{{ item.city && !item.location.includes(item.city) ? ', ' + item.city : '' }}</span>
                </div>

                <p class="feature-info">{{ item.shortDescription || item.description }}</p>

                <div class="card-footer-row">
                  <div class="price-col">
                    <span class="price-label">Price</span>
                    <span class="price-value">{{ item.priceDisplay }}</span>
                  </div>

                  <button type="button" class="btn btn-outline btn-sm btn-details" (click)="openDetailsModal(item)">
                    View Details
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Empty State (No properties found) -->
          <div class="no-results-box" *ngIf="!isSearching() && searchResults().length === 0">
            <div class="no-results-card">
              <div class="no-results-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <h3 class="no-results-title">No properties found matching your search criteria.</h3>
              <p class="no-results-desc">
                We couldn't find any approved properties matching all the selected filters. Try broadening your location, adjusting your budget range, or selecting another category.
              </p>
              <div class="no-results-actions">
                <button type="button" class="btn btn-primary" (click)="clearSearchResults()">
                  Clear Search & View All Properties
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- 3. Quick Property Categories -->
      <app-property-categories></app-property-categories>

      <!-- 4. Continue Browsing -->
      <app-continue-browsing></app-continue-browsing>

      <!-- 5. Promotional Ad & Carousel Presentation Section -->
      <div class="container">
        <app-ad-carousel></app-ad-carousel>
      </div>

      <!-- 6. New Launch (4 cards, View All link) -->
      <app-new-launch-section (propertySelected)="openDetailsModal($event)"></app-new-launch-section>

      <!-- 7. Featured Sections: Platinum Plots, Platinum Villas, New Apartments -->
      <app-featured-sections (propertySelected)="openDetailsModal($event)"></app-featured-sections>

      <!-- 8. Gold & Premium Properties -->
      <app-gold-premium (tierChosen)="onTierSelect($event)"></app-gold-premium>

      <!-- 9. Property Scout Banner -->
      <app-property-scout (becomeScoutRequested)="onBecomeScout()"></app-property-scout>

      <!-- 10. Why Choose AcresBazaar -->
      <app-why-choose-us></app-why-choose-us>

      <!-- 11. Final CTA -->
      <app-cta-banner
        (exploreRequested)="scrollTo('search-section')">
      </app-cta-banner>

    </div>
  `,
  styles: [`
    .marketplace-home-wrapper {
      background-color: #FFFFFF;
    }

    /* SEARCH RESULTS SECTION STYLING */
    .search-results-section {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
      padding: 3rem 0;
    }

    .search-head-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .search-head-left {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-badge-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-badge {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #0369A1;
      background: #E0F2FE;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      text-transform: uppercase;
      border: 1px solid #BAE6FD;
    }

    .search-count-pill {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0F172A;
      background: #F1F5F9;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }

    .search-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .active-filter-chips {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-top: 0.25rem;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      color: #475569;
    }

    .filter-chip strong {
      color: #0F172A;
    }

    .btn-clear-results {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.25rem;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-clear-results:hover {
      background: #FEE2E2;
      color: #DC2626;
      border-color: #FCA5A5;
    }

    /* LOADING STATE */
    .search-loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      gap: 1rem;
    }

    .search-spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid #E2E8F0;
      border-top-color: #0284C7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .search-loading-text {
      font-size: 0.95rem;
      font-weight: 500;
      color: #64748B;
    }

    /* GRID & CARDS */
    .search-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1200px) {
      .search-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 860px) {
      .search-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 580px) {
      .search-grid {
        grid-template-columns: 1fr;
      }
    }

    .listing-card {
      background: #FFFFFF;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .listing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      border-color: #CBD5E1;
    }

    .card-thumb-wrap {
      position: relative;
      height: 200px;
      background: #F1F5F9;
      overflow: hidden;
    }

    .listing-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .listing-card:hover .listing-img {
      transform: scale(1.04);
    }

    .card-tag-overlay {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 0.4rem;
      z-index: 2;
    }

    .tier-pill {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .gold-pill {
      background: #FEF3C7;
      color: #926227;
      border: 1px solid rgba(217, 119, 6, 0.4);
    }

    .plat-pill {
      background: #E0E7FF;
      color: #3730A3;
      border: 1px solid rgba(79, 70, 229, 0.4);
    }

    .cat-pill {
      font-size: 0.68rem;
      font-weight: 700;
      background: rgba(15, 23, 42, 0.75);
      color: #FFFFFF;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }

    .verified-badge-mini {
      position: absolute;
      bottom: 10px;
      left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(16, 185, 129, 0.95);
      color: #FFFFFF;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.6rem;
    }

    .type-and-bhk {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .prop-type-tag {
      font-size: 0.72rem;
      font-weight: 800;
      color: #0284C7;
      letter-spacing: 0.06em;
    }

    .bhk-tag {
      font-size: 0.72rem;
      font-weight: 700;
      background: #F1F5F9;
      color: #475569;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .project-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      color: #64748B;
    }

    .feature-info {
      font-size: 0.82rem;
      color: #64748B;
      line-height: 1.45;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #F1F5F9;
      padding-top: 0.85rem;
      margin-top: 0.5rem;
    }

    .price-col {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.68rem;
      color: #94A3B8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .price-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0F172A;
    }

    .btn-details {
      padding: 0.45rem 0.95rem;
      font-size: 0.82rem;
      font-weight: 700;
      border-radius: 6px;
      border: 1.5px solid #0F172A;
      color: #0F172A;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-details:hover {
      background: #0F172A;
      color: #FFFFFF;
    }

    /* EMPTY STATE */
    .no-results-box {
      padding: 2rem 0;
    }

    .no-results-card {
      background: #FFFFFF;
      border: 1.5px dashed #CBD5E1;
      border-radius: 16px;
      padding: 3.5rem 2rem;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .no-results-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #F1F5F9;
      color: #64748B;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-results-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }

    .no-results-desc {
      font-size: 0.92rem;
      color: #64748B;
      line-height: 1.5;
      margin: 0;
    }

    .no-results-actions {
      margin-top: 0.75rem;
    }
  `]
})
export class HomeComponent {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  propertyService = inject(PropertyService);
  activityService = inject(ActivityService);
  router = inject(Router);

  // Search Results State
  searchResults = signal<Property[]>([]);
  isSearching = signal<boolean>(false);
  activeSearchFilter = signal<SearchFilter | null>(null);

  constructor() {
    this.propertyService.syncPlatinumFromBackend();
  }

  getCategoryLabel(slug?: string): string {
    if (!slug || slug === 'all-residential' || slug === 'all' || slug === 'ALL') return '';
    const map: Record<string, string> = {
      'plots': 'Plots & Land',
      'plots-land': 'Plots & Land',
      'villas': 'Villas & Estates',
      'villas-estates': 'Villas & Estates',
      'apartments': 'Apartments / Flats',
      'independent-houses': 'Independent Houses',
      'commercial': 'Commercial Spaces',
      'commercial-spaces': 'Commercial Spaces',
      'farm-lands': 'Farm Lands'
    };
    return map[slug] || slug;
  }

  getBudgetLabel(budget?: string): string {
    if (!budget || budget === 'any' || budget === 'ALL') return '';
    const map: Record<string, string> = {
      'under-20l': 'Under ₹20 Lakhs',
      '20l-50l': '₹20L – ₹50L',
      '50l-1cr': '₹50L – ₹1 Cr',
      '1cr-3cr': '₹1 Cr – ₹3 Cr',
      '3cr-5cr': '₹3 Cr – ₹5 Cr',
      'above-5cr': 'Above ₹5 Cr'
    };
    return map[budget] || budget;
  }

  openDetailsModal(property: Property) {
    this.activityService.track('VIEW_PROPERTY', property.id, {
      title: property.title,
      price: property.price,
      location: property.location
    });

    this.router.navigate([], {
      queryParams: { property: property.id },
      queryParamsHandling: 'merge'
    });
  }

  openPostPropertyModal() {
    this.navStateService.openPostProperty();
  }

  async onSearchFilter(filter: SearchFilter) {
    this.activityService.track('SEARCH', undefined, filter);

    const isLocEmpty = !filter.location || filter.location.trim().length === 0;
    const isCatEmpty = !filter.category || filter.category === 'all-residential' || filter.category === 'all';
    const isBudgetEmpty = !filter.budgetRange || filter.budgetRange === 'any';
    const isAdvEmpty = !filter.propertyType && !filter.bhk && !filter.facing && !filter.furnishing && !filter.constructionStatus;

    // If completely default/empty search
    if (isLocEmpty && isCatEmpty && isBudgetEmpty && isAdvEmpty) {
      this.clearSearchResults();
      return;
    }

    this.activeSearchFilter.set(filter);
    this.isSearching.set(true);

    try {
      const results = await this.propertyService.searchPublicProperties({
        category: filter.category,
        location: filter.location,
        budgetRange: filter.budgetRange,
        propertyType: filter.propertyType,
        bhk: filter.bhk,
        facing: filter.facing,
        furnishing: filter.furnishing,
        constructionStatus: filter.constructionStatus
      });
      this.searchResults.set(results);
    } catch {
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
      setTimeout(() => {
        this.scrollTo('search-results-section');
      }, 50);
    }
  }

  clearSearchResults() {
    this.activeSearchFilter.set(null);
    this.searchResults.set([]);
  }

  onTierSelect(tier: string) {
    if (tier.includes('Gold')) {
      this.scrollTo('property-scout');
    } else {
      this.scrollTo('platinum-villas');
    }
  }

  onBecomeScout() {
    this.notificationService.show('Scout Portal', 'Redirecting to territory onboarding...', 'gold');
  }

  scrollTo(elementId: string) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

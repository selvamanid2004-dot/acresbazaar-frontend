import { Component, inject } from '@angular/core';
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

import { Category, Property, SearchFilter } from '../../core/models/property.model';
import { NotificationService } from '../../shared/services/notification.service';
import { NavStateService } from '../../core/services/nav-state.service';

import { PropertyService } from '../../core/services/property.service';

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
    CtaBannerComponent
  ],
  template: `
    <div class="marketplace-home-wrapper">
      
      <!-- 1. Property Hero Banner (40-45vh) -->
      <app-hero-slider
        (exploreNowClicked)="scrollTo('search-section')"
        (viewPropertiesClicked)="scrollTo('new-launches')">
      </app-hero-slider>

      <!-- 2. Large Property Search Box (only Gold Plan & Platinum Plan options) -->
      <app-property-search
        (searchSubmitted)="onSearchFilter($event)">
      </app-property-search>

      <!-- 3. Quick Property Categories (All Residential, Plots, Villas, Apartments, Houses, Commercial, Farm Lands) -->
      <app-property-categories></app-property-categories>

      <!-- 4. Continue Browsing -->
      <app-continue-browsing></app-continue-browsing>

      <!-- 5. New Launch (4 cards, View All link) -->
      <app-new-launch-section (propertySelected)="openDetailsModal($event)"></app-new-launch-section>

      <!-- 6, 7, 8. Featured Sections: Platinum Plots, Platinum Villas, New Apartments -->
      <app-featured-sections (propertySelected)="openDetailsModal($event)"></app-featured-sections>

      <!-- 9. Gold & Premium Properties (Two-column layout) -->
      <app-gold-premium (tierChosen)="onTierSelect($event)"></app-gold-premium>

      <!-- 10. Property Scout Banner -->
      <app-property-scout (becomeScoutRequested)="onBecomeScout()"></app-property-scout>

      <!-- 11. Why Choose AcresBazaar (4 items) -->
      <app-why-choose-us></app-why-choose-us>

      <!-- 12. Final CTA -->
      <app-cta-banner
        (exploreRequested)="scrollTo('search-section')">
      </app-cta-banner>

    </div>
  `,
  styles: [`
    .marketplace-home-wrapper {
      background-color: #FFFFFF;
    }
  `]
})
export class HomeComponent {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  propertyService = inject(PropertyService);
  router = inject(Router);

  constructor() {
    this.propertyService.syncPlatinumFromBackend();
  }

  openDetailsModal(property: Property) {
    this.router.navigate([], {
      queryParams: { property: property.id },
      queryParamsHandling: 'merge'
    });
  }

  openPostPropertyModal() {
    this.navStateService.openPostProperty();
  }

  onSearchFilter(filter: SearchFilter) {
    this.scrollTo('new-launches');
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

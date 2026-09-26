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
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
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

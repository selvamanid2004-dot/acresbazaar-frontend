import { Component, EventEmitter, OnInit, OnDestroy, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-buyer-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-category.component.html',
  styleUrl: './buyer-category.component.css'
})
export class BuyerCategoryComponent implements OnInit, OnDestroy {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  currentCategory = 'all-residential';
  currentTier: 'gold' | 'platinum' | null = null;
  private routeSub?: Subscription;

  // All 7 Dedicated Categories
  buyerCategories = [
    { name: 'All Residential', slug: 'all-residential' },
    { name: 'Plots', slug: 'plots' },
    { name: 'Villas', slug: 'villas' },
    { name: 'Apartments / Flats', slug: 'apartments' },
    { name: 'Independent Houses', slug: 'independent-houses' },
    { name: 'Commercial Spaces', slug: 'commercial' },
    { name: 'Farm Lands', slug: 'farm-lands' }
  ];

  get currentMeta() {
    return this.propertyService.getCategoryMetadata(this.currentCategory);
  }

  get goldProperties(): Property[] {
    return this.propertyService.getGoldPropertiesByCategory(this.currentCategory);
  }

  get platinumProperties(): Property[] {
    return this.propertyService.getPlatinumPropertiesByCategory(this.currentCategory);
  }

  get totalCategoryCount(): string {
    const total = this.goldProperties.length + this.platinumProperties.length;
    return `${total} Verified Properties`;
  }

  get isGoldUnlocked(): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const mem = this.authService.activeMembership() || this.navStateService.activeMembership();
    return mem === 'gold' || mem === 'platinum';
  }

  get isPlatinumUnlocked(): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const mem = this.authService.activeMembership() || this.navStateService.activeMembership();
    return mem === 'platinum';
  }

  get backButtonLabel(): string {
    if (this.currentTier) {
      return `Back to ${this.currentMeta.title}`;
    }
    return 'Back to For Buyers';
  }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      if (params['category']) {
        this.currentCategory = params['category'];
        this.navStateService.selectedCategorySlug.set(this.currentCategory);
      }
      if (params['tier'] && (params['tier'] === 'gold' || params['tier'] === 'platinum')) {
        this.currentTier = params['tier'];
      } else {
        this.currentTier = null;
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  goBack() {
    if (this.currentTier) {
      // Step back from /buyers/:category/:tier to /buyers/:category
      this.router.navigate(['/buyers', this.currentCategory]);
    } else {
      // Step back from /buyers/:category to /buyers
      this.router.navigate(['/buyers']);
    }
  }

  isCurrentCategory(slug: string): boolean {
    return this.currentCategory.toLowerCase() === slug.toLowerCase();
  }

  switchCategory(slug: string) {
    if (this.currentTier) {
      this.router.navigate(['/buyers', slug, this.currentTier]);
    } else {
      this.router.navigate(['/buyers', slug]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchTier(tier: 'gold' | 'platinum' | null) {
    if (tier) {
      this.router.navigate(['/buyers', this.currentCategory, tier]);
    } else {
      this.router.navigate(['/buyers', this.currentCategory]);
    }
  }

  openMembershipModal(tier: 'gold' | 'platinum', property?: Property) {
    if (tier === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onViewFullDetails(prop: Property) {
    this.propertySelected.emit(prop);
    this.router.navigate([], {
      queryParams: { property: prop.id },
      queryParamsHandling: 'merge'
    });
  }

  relockForDemo() {
    this.authService.logout();
    this.navStateService.activeMembership.set(null);
    this.notificationService.show('Session Reset', 'Property details have been re-locked for demonstration.', 'info');
  }
}

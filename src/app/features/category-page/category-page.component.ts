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
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  activeSlug = 'all-residential';
  private routeSub?: Subscription;

  // The 7 dedicated category routes
  categoryRoutes = [
    { name: 'All Residential', slug: 'all-residential' },
    { name: 'Plots', slug: 'plots' },
    { name: 'Villas', slug: 'villas' },
    { name: 'Apartments / Flats', slug: 'apartments' },
    { name: 'Independent Houses', slug: 'independent-houses' },
    { name: 'Commercial Spaces', slug: 'commercial' },
    { name: 'Farm Lands', slug: 'farm-lands' }
  ];

  get currentSlug(): string {
    return this.activeSlug;
  }

  get currentMeta() {
    return this.propertyService.getCategoryMetadata(this.currentSlug);
  }

  get goldProperties(): Property[] {
    return this.propertyService.getGoldPropertiesByCategory(this.currentSlug);
  }

  get platinumProperties(): Property[] {
    return this.propertyService.getPlatinumPropertiesByCategory(this.currentSlug);
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

  ngOnInit() {
    this.propertyService.syncPlatinumFromBackend();
    this.loadCategories();
    this.routeSub = this.route.data.subscribe(data => {
      if (data && data['category']) {
        this.activeSlug = data['category'];
        this.navStateService.selectedCategorySlug.set(this.activeSlug);
      } else {
        const path = this.router.url.split('?')[0].replace('/', '');
        if (path) {
          this.activeSlug = path;
          this.navStateService.selectedCategorySlug.set(this.activeSlug);
        }
      }
    });
  }

  loadCategories(): void {
    // Uses predefined category routes
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  isCurrentSlug(slug: string): boolean {
    return this.currentSlug.toLowerCase() === slug.toLowerCase();
  }

  switchCategory(slug: string) {
    this.router.navigate(['/' + slug]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // Angular router navigation using queryParams so Browser Back gracefully returns to Category Page
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

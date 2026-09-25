import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Property } from '../../../../core/models/property.model';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-featured-sections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- =================================================================
         SECTION 7: NEW PLATINUM PLOTS
         ================================================================= -->
    <section class="marketplace-section section-py bg-light" id="platinum-plots">
      <div class="container">
        
        <div class="section-head-bar">
          <div class="head-titles">
            <h2 class="section-title">New Platinum Plots</h2>
            <p class="section-subtitle">Premium plots selected for your next investment.</p>
          </div>
          <a href="#platinum-plots" class="view-all-btn" (click)="onViewAll($event, 'Platinum Plots')">
            <span>View All Plots</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <div class="cards-grid" *ngIf="platinumPlots().length > 0; else emptyPlotsTpl">
          <div *ngFor="let plot of platinumPlots()" class="listing-card">
            
            <!-- Large Property Image Only -->
            <div class="card-thumb-wrap">
              <img [src]="plot.imageUrl" alt="Property image" class="listing-img" loading="lazy" />
            </div>

            <div class="card-body">
              <!-- Unlocked State -->
              <ng-container *ngIf="isUnlocked(plot); else plotLockedTpl">
                <div class="unlocked-details">
                  <span class="plot-dim-chip">{{ plot.specs.plotSize }}</span>
                  <h3 class="project-name">{{ plot.title }}</h3>
                  
                  <div class="location-line">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ plot.location }}, {{ plot.city }}</span>
                  </div>

                  <div class="feature-spec-row" *ngIf="plot.specs.roadAccess">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m18 8-6-6-6 6"></path>
                      <path d="M12 2v20"></path>
                    </svg>
                    <span>{{ plot.specs.roadAccess }}</span>
                  </div>

                  <div class="card-footer-row">
                    <div class="price-col">
                      <span class="price-label">Starting Price</span>
                      <span class="price-value">{{ plot.priceDisplay }}</span>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm btn-details" (click)="onDetails(plot)">
                      View Details
                    </button>
                  </div>
                </div>
              </ng-container>

              <!-- Locked Template (Default / Public State) -->
              <ng-template #plotLockedTpl>
                <div class="locked-card-content">
                  <div class="locked-label-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lock-icon">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span class="locked-text">Property Details Locked</span>
                  </div>

                  <button type="button" class="btn btn-unlock-property" (click)="onUnlockProperty(plot)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                    <span>Unlock Property Details</span>
                  </button>
                </div>
              </ng-template>
            </div>

          </div>
        </div>

        <ng-template #emptyPlotsTpl>
          <div class="empty-state-card">
            <div class="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M3 9h18"></path>
                <path d="M9 21V9"></path>
              </svg>
            </div>
            <h4 class="empty-state-title">No Platinum Plots Currently Listed</h4>
            <p class="empty-state-text">Verified residential and commercial plots will appear here once published.</p>
          </div>
        </ng-template>

      </div>
    </section>

    <!-- =================================================================
         SECTION 8: NEW PLATINUM VILLAS
         ================================================================= -->
    <section class="marketplace-section section-py bg-white" id="platinum-villas">
      <div class="container">
        
        <div class="section-head-bar">
          <div class="head-titles">
            <h2 class="section-title">New Platinum Villas</h2>
            <p class="section-subtitle">Luxury independent villas and estates in premier neighborhoods.</p>
          </div>
          <a href="#platinum-villas" class="view-all-btn" (click)="onViewAll($event, 'Platinum Villas')">
            <span>View All Villas</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <div class="cards-grid" *ngIf="platinumVillas().length > 0; else emptyVillasTpl">
          <div *ngFor="let villa of platinumVillas()" class="listing-card">
            
            <!-- Large Property Image Only -->
            <div class="card-thumb-wrap">
              <img [src]="villa.imageUrl" alt="Property image" class="listing-img" loading="lazy" />
            </div>

            <div class="card-body">
              <!-- Unlocked State -->
              <ng-container *ngIf="isUnlocked(villa); else villaLockedTpl">
                <div class="unlocked-details">
                  <div class="type-and-bhk">
                    <span class="bhk-tag">{{ villa.specs.beds }} BHK Luxury Villa</span>
                    <span class="dot-sep">•</span>
                    <span class="area-text">{{ villa.specs.builtUpArea }}</span>
                  </div>

                  <h3 class="project-name">{{ villa.title }}</h3>

                  <div class="location-line">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ villa.location }}, {{ villa.city }}</span>
                  </div>

                  <div class="features-pill-row" *ngIf="villa.specs.keyFeatures">
                    <span *ngFor="let feat of villa.specs.keyFeatures" class="feat-pill">{{ feat }}</span>
                  </div>

                  <div class="card-footer-row">
                    <div class="price-col">
                      <span class="price-label">Starting Price</span>
                      <span class="price-value">{{ villa.priceDisplay }}</span>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm btn-details" (click)="onDetails(villa)">
                      View Details
                    </button>
                  </div>
                </div>
              </ng-container>

              <!-- Locked Template (Default / Public State) -->
              <ng-template #villaLockedTpl>
                <div class="locked-card-content">
                  <div class="locked-label-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lock-icon">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span class="locked-text">Property Details Locked</span>
                  </div>

                  <button type="button" class="btn btn-unlock-property" (click)="onUnlockProperty(villa)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                    <span>Unlock Property Details</span>
                  </button>
                </div>
              </ng-template>
            </div>

          </div>
        </div>

        <ng-template #emptyVillasTpl>
          <div class="empty-state-card">
            <div class="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h4 class="empty-state-title">No Platinum Villas Currently Listed</h4>
            <p class="empty-state-text">Exclusive villas and estates will appear here once published.</p>
          </div>
        </ng-template>

      </div>
    </section>

    <!-- =================================================================
         SECTION 9: NEW APARTMENTS
         ================================================================= -->
    <section class="marketplace-section section-py bg-light" id="new-apartments">
      <div class="container">
        
        <div class="section-head-bar">
          <div class="head-titles">
            <h2 class="section-title">New Apartments</h2>
            <p class="section-subtitle">Contemporary high-rise apartments and penthouses in prime hubs.</p>
          </div>
          <a href="#new-apartments" class="view-all-btn" (click)="onViewAll($event, 'Apartments')">
            <span>View All Apartments</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <div class="cards-grid" *ngIf="newApartments().length > 0; else emptyAptsTpl">
          <div *ngFor="let apt of newApartments()" class="listing-card">
            
            <!-- Large Property Image Only -->
            <div class="card-thumb-wrap">
              <img [src]="apt.imageUrl" alt="Property image" class="listing-img" loading="lazy" />
            </div>

            <div class="card-body">
              <!-- Unlocked State -->
              <ng-container *ngIf="isUnlocked(apt); else aptLockedTpl">
                <div class="unlocked-details">
                  <div class="type-and-bhk">
                    <span class="bhk-tag">{{ apt.specs.beds }} BHK Flat</span>
                    <span class="dot-sep">•</span>
                    <span class="area-text">{{ apt.specs.builtUpArea }}</span>
                  </div>

                  <h3 class="project-name">{{ apt.title }}</h3>

                  <div class="location-line">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ apt.location }}, {{ apt.city }}</span>
                  </div>

                  <div class="features-pill-row" *ngIf="apt.specs.keyFeatures">
                    <span *ngFor="let feat of apt.specs.keyFeatures" class="feat-pill">{{ feat }}</span>
                  </div>

                  <div class="card-footer-row">
                    <div class="price-col">
                      <span class="price-label">Starting Price</span>
                      <span class="price-value">{{ apt.priceDisplay }}</span>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm btn-details" (click)="onDetails(apt)">
                      View Details
                    </button>
                  </div>
                </div>
              </ng-container>

              <!-- Locked Template (Default / Public State) -->
              <ng-template #aptLockedTpl>
                <div class="locked-card-content">
                  <div class="locked-label-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lock-icon">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span class="locked-text">Property Details Locked</span>
                  </div>

                  <button type="button" class="btn btn-unlock-property" (click)="onUnlockProperty(apt)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                    <span>Unlock Property Details</span>
                  </button>
                </div>
              </ng-template>
            </div>

          </div>
        </div>

        <ng-template #emptyAptsTpl>
          <div class="empty-state-card">
            <div class="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M8 14h.01"></path>
                <path d="M16 14h.01"></path>
              </svg>
            </div>
            <h4 class="empty-state-title">No Modern Apartments Currently Listed</h4>
            <p class="empty-state-text">New apartment listings will appear here once verified.</p>
          </div>
        </ng-template>

      </div>
    </section>
  `,
  styles: [`
    .marketplace-section {
      border-top: 1px solid var(--slate-200);
    }

    /* Empty State */
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3.5rem 1.5rem;
      background: var(--slate-50);
      border: 1px dashed var(--slate-300);
      border-radius: var(--radius-md);
      margin-top: 0.5rem;
    }

    .empty-icon-wrap {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      color: var(--slate-400);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
    }

    .empty-state-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--primary-900);
      margin-bottom: 0.35rem;
    }

    .empty-state-text {
      font-size: 0.875rem;
      color: var(--slate-500);
      max-width: 440px;
    }

    .bg-white { background-color: #FFFFFF; }
    .bg-light { background-color: #F8FAFC; }

    .section-head-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--primary-900);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .section-subtitle {
      font-size: 0.95rem;
      color: var(--slate-500);
      margin-top: 0.25rem;
    }

    .view-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-900);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--slate-300);
      transition: all var(--transition-fast);
    }

    .view-all-btn:hover {
      background: var(--primary-900);
      color: #FFFFFF;
      border-color: var(--primary-900);
    }

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.35rem;
    }

    .listing-card {
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-base);
    }

    .listing-card:hover {
      border-color: var(--slate-400);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .card-thumb-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: var(--slate-900);
    }

    .listing-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 500ms ease;
      display: block;
    }

    .listing-card:hover .listing-img {
      transform: scale(1.05);
    }

    .card-body {
      padding: 1.25rem 1.15rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* Locked Card Body State */
    .locked-card-content {
      padding: 1rem 0.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 1rem;
      flex: 1;
      min-height: 110px;
    }

    .locked-label-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--primary-900);
    }

    .lock-icon {
      color: #936B3B;
      flex-shrink: 0;
    }

    .btn-unlock-property {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.7rem 1.15rem;
      font-size: 0.86rem;
      font-weight: 800;
      background: linear-gradient(135deg, #C5A880 0%, #936B3B 100%);
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(147, 107, 59, 0.25);
      transition: all var(--transition-fast);
    }

    .btn-unlock-property:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(147, 107, 59, 0.35);
    }

    /* Unlocked Content State */
    .unlocked-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .type-and-bhk {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-bottom: 0.4rem;
    }

    .plot-dim-chip {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-900);
      background: var(--gold-light);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-xs);
      margin-bottom: 0.5rem;
      width: fit-content;
    }

    .bhk-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-900);
      background: var(--slate-100);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-xs);
    }

    .dot-sep {
      color: var(--slate-400);
      font-size: 0.8rem;
    }

    .area-text {
      font-size: 0.75rem;
      color: var(--slate-600);
      font-weight: 600;
    }

    .project-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--primary-900);
      line-height: 1.35;
      margin-bottom: 0.4rem;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8125rem;
      color: var(--slate-500);
      margin-bottom: 0.65rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .location-line svg {
      color: var(--gold-600);
      flex-shrink: 0;
    }

    .feature-spec-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--slate-600);
      margin-bottom: 0.75rem;
    }

    .feature-spec-row svg {
      color: var(--primary-700);
      flex-shrink: 0;
    }

    .features-pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-bottom: 0.75rem;
    }

    .feat-pill {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--slate-600);
      background: var(--slate-100);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-xs);
    }

    .card-footer-row {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding-top: 0.85rem;
      border-top: 1px dashed var(--slate-200);
    }

    .price-col {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.68rem;
      color: var(--slate-400);
      text-transform: uppercase;
      font-weight: 600;
    }

    .price-value {
      font-size: 1.15rem;
      font-weight: 800;
      font-family: var(--font-display);
      color: var(--primary-900);
    }

    .btn-details {
      font-weight: 700;
    }

    @media (max-width: 1100px) {
      .cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FeaturedSectionsComponent {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  platinumPlots = this.propertyService.getPlatinumPlots();
  platinumVillas = this.propertyService.getPlatinumVillas();
  newApartments = this.propertyService.getNewApartments();

  isUnlocked(item: Property): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const active = this.authService.activeMembership() || this.navStateService.activeMembership();
    if (!active) return false;
    if (active === 'platinum') return true;
    return item.tier === 'gold';
  }

  onUnlockProperty(item: Property) {
    const tier: 'gold' | 'platinum' = item.tier === 'gold' ? 'gold' : 'platinum';
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/register/buyer'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (tier === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onViewAll(event: Event, type: string) {
    event.preventDefault();
    this.notificationService.show(type, `Loading directory of ${type}. Membership required to view full property dossiers.`, 'info');
  }

  onDetails(item: Property) {
    this.propertySelected.emit(item);
  }
}

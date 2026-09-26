import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchFilter } from '../../../../core/models/property.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PropertyService } from '../../../../core/services/property.service';

@Component({
  selector: 'app-property-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="floating-search-section" id="search-section">
      <div class="container">
        
        <!-- Overlapping White Floating Search Card -->
        <div class="search-panel-card">
          
          <!-- TOP ROW: ONLY TWO PROMINENT PLAN OPTIONS (Gold Plan & Platinum Plan) -->
          <div class="plans-toggle-row">
            <div class="plans-intro-label">
              <div class="plans-badge-row">
                <span class="plans-badge">EXCLUSIVE MEMBERSHIP</span>
                <span class="plans-sub-label">Direct owner contacts & verified dossiers</span>
              </div>
            </div>

            <div class="plans-buttons-wrap">
              <!-- Option 1: Gold Plan -->
              <button 
                type="button" 
                class="plan-card-btn gold-plan-btn" 
                [class.active-plan]="navStateService.activeMembership() === 'gold'"
                (click)="openPlanOption('gold')">
                <div class="plan-card-inner">
                  <div class="plan-left">
                    <div class="plan-icon gold-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <div class="plan-text">
                      <div class="plan-tag-wrap">
                        <span class="plan-tag gold-tag">{{ propertyService.goldPlan().badge || 'BUYER ACCESS' }}</span>
                      </div>
                      <strong class="plan-title">{{ propertyService.goldPlan().name }}</strong>
                    </div>
                  </div>
                  <div class="plan-pricing">
                    <span class="plan-price">₹{{ propertyService.goldPlan().price }}</span>
                    <span class="plan-cadence">/{{ propertyService.goldPlan().period }}</span>
                  </div>
                </div>
              </button>

              <!-- Option 2: Platinum Plan -->
              <button 
                type="button" 
                class="plan-card-btn platinum-plan-btn" 
                [class.active-plan]="navStateService.activeMembership() === 'platinum'"
                (click)="openPlanOption('platinum')">
                <div class="plan-card-inner">
                  <div class="plan-left">
                    <div class="plan-icon plat-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <div class="plan-text">
                      <div class="plan-tag-wrap">
                        <span class="plan-tag plat-tag">{{ propertyService.platinumPlan().badge || 'VIP ALL-ACCESS' }}</span>
                      </div>
                      <strong class="plan-title">{{ propertyService.platinumPlan().name }}</strong>
                    </div>
                  </div>
                  <div class="plan-pricing">
                    <span class="plan-price">₹{{ propertyService.platinumPlan().price }}</span>
                    <span class="plan-cadence">/{{ propertyService.platinumPlan().period }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- SECOND ROW: Core Search Controls -->
          <form class="search-controls-row" (ngSubmit)="onSearch()">
            
            <!-- Category Dropdown: All Residential, Plots, Villas, Apartments / Flats, Independent Houses, Commercial Spaces, Farm Lands -->
            <div class="control-group category-group">
              <label for="search-cat-select" class="group-label">Category</label>
              <div class="select-wrapper">
                <select 
                  id="search-cat-select" 
                  class="control-select" 
                  [(ngModel)]="selectedCategory" 
                  (ngModelChange)="onCategoryChange($event)" 
                  name="category">
                  <option value="all-residential">All Residential</option>
                  <option value="plots">Plots</option>
                  <option value="villas">Villas</option>
                  <option value="apartments">Apartments / Flats</option>
                  <option value="independent-houses">Independent Houses</option>
                  <option value="commercial">Commercial Spaces</option>
                  <option value="farm-lands">Farm Lands</option>
                </select>
              </div>
            </div>

            <!-- Divider -->
            <div class="control-divider"></div>

            <!-- Location / Project / Keyword Search -->
            <div class="control-group location-group">
              <label for="search-keyword-input" class="group-label">Location / Project</label>
              <div class="input-wrapper">
                <svg class="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <input 
                  id="search-keyword-input"
                  type="text" 
                  class="control-input" 
                  placeholder="Search by location, project or property" 
                  [(ngModel)]="searchKeyword" 
                  name="keyword" 
                  autocomplete="off" />
              </div>
            </div>

            <!-- Divider -->
            <div class="control-divider"></div>

            <!-- Budget Filter -->
            <div class="control-group budget-group">
              <label for="search-budget-select" class="group-label">Budget</label>
              <div class="select-wrapper">
                <select id="search-budget-select" class="control-select" [(ngModel)]="selectedBudget" name="budget">
                  <option value="any">Budget (Any)</option>
                  <option value="under-500k">Under $500,000</option>
                  <option value="500k-1m">$500,000 - $1,000,000</option>
                  <option value="1m-2m">$1,000,000 - $2,000,000</option>
                  <option value="2m-5m">$2,000,000 - $5,000,000</option>
                  <option value="5m-plus">$5,000,000+ (Luxury)</option>
                </select>
              </div>
            </div>

            <!-- Search Action CTA Button -->
            <div class="search-btn-wrapper">
              <button type="submit" class="btn btn-primary btn-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </section>
  `,
  styles: [`
    .floating-search-section {
      position: relative;
      margin-top: -55px; /* Overlaps lower portion of hero banner */
      z-index: 50;
      padding-bottom: 2rem;
    }

    .search-panel-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.75rem 1.5rem 1.75rem;
      box-shadow: var(--shadow-search);
      border: 1px solid var(--slate-200);
    }

    /* TOP ROW: TWO PROMINENT PLAN OPTIONS */
    .plans-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--slate-200);
      padding-bottom: 1rem;
      margin-bottom: 1.25rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .plans-intro-label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .plans-badge-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .plans-badge {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #926227;
      background: #FEF3C7;
      border: 1px solid rgba(217, 119, 6, 0.25);
      padding: 0.2rem 0.65rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }

    .plans-sub-label {
      font-size: 0.82rem;
      color: var(--slate-500);
      font-weight: 500;
    }

    .plans-buttons-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    /* PLAN BUTTON / CARD STYLES */
    .plan-card-btn {
      position: relative;
      border: 1.5px solid var(--slate-200);
      background: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 0.55rem 1.15rem;
      cursor: pointer;
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      min-width: 220px;
      text-align: left;
    }

    .plan-card-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(11, 19, 43, 0.08);
    }

    .plan-card-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 1rem;
    }

    .plan-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .plan-icon {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform var(--transition-fast);
    }

    .plan-card-btn:hover .plan-icon {
      transform: scale(1.08);
    }

    /* Gold Plan Styling */
    .gold-plan-btn {
      border-color: rgba(197, 168, 128, 0.6);
      background: linear-gradient(135deg, #FFFFFF 0%, #FFFDF8 100%);
    }

    .gold-plan-btn:hover, .gold-plan-btn.active-plan {
      border-color: #B45309;
      box-shadow: 0 4px 16px rgba(180, 83, 9, 0.15);
      background: #FFFBEB;
    }

    .gold-icon {
      background: #FEF3C7;
      color: #B45309;
    }

    .gold-tag {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #92400E;
    }

    /* Platinum Plan Styling */
    .platinum-plan-btn {
      border-color: rgba(11, 19, 43, 0.25);
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
    }

    .platinum-plan-btn:hover, .platinum-plan-btn.active-plan {
      border-color: var(--primary-900);
      box-shadow: 0 4px 16px rgba(11, 19, 43, 0.15);
      background: #F1F5F9;
    }

    .plat-icon {
      background: var(--primary-900);
      color: var(--gold-400);
    }

    .plat-tag {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--primary-900);
    }

    .plan-tag-wrap {
      line-height: 1;
      margin-bottom: 0.15rem;
    }

    .plan-title {
      font-size: 0.96rem;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1.1;
      display: block;
    }

    .plan-pricing {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1;
    }

    .plan-price {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary-900);
    }

    .plan-cadence {
      font-size: 0.7rem;
      color: var(--slate-500);
      font-weight: 600;
      margin-top: 0.1rem;
    }

    /* SECOND ROW: Search Controls */
    .search-controls-row {
      display: grid;
      grid-template-columns: 1.2fr auto 2.2fr auto 1.2fr auto;
      align-items: flex-end;
      gap: 1.25rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .group-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--slate-500);
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .control-select, .control-input {
      width: 100%;
      height: 46px;
      font-size: 0.95rem;
      font-family: inherit;
      color: var(--primary-900);
      font-weight: 600;
      background: transparent;
      border: none;
      outline: none;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .control-input::placeholder {
      color: var(--slate-400);
      font-weight: 400;
    }

    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .select-wrapper select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.25rem center;
      padding-right: 1.5rem;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .location-icon {
      color: var(--gold-600);
      flex-shrink: 0;
    }

    .control-divider {
      width: 1px;
      height: 38px;
      background: var(--slate-200);
      align-self: flex-end;
      margin-bottom: 4px;
    }

    .search-btn-wrapper {
      display: flex;
      align-items: flex-end;
    }

    .btn-search {
      height: 46px;
      padding: 0 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 12px rgba(11, 19, 43, 0.2);
    }

    @media (max-width: 980px) {
      .floating-search-section {
        margin-top: -30px;
      }

      .plans-toggle-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .plans-buttons-wrap {
        width: 100%;
      }

      .plan-card-btn {
        flex: 1;
        min-width: 160px;
      }

      .search-controls-row {
        grid-template-columns: 1fr;
        gap: 0.85rem;
      }

      .control-divider {
        display: none;
      }

      .control-group {
        border-bottom: 1px solid var(--slate-100);
        padding-bottom: 0.5rem;
      }

      .btn-search {
        width: 100%;
        margin-top: 0.5rem;
      }
    }

    @media (max-width: 520px) {
      .plans-buttons-wrap {
        flex-direction: column;
      }

      .plan-card-btn {
        width: 100%;
      }
    }
  `]
})
export class PropertySearchComponent {
  router = inject(Router);
  notificationService = inject(NotificationService);
  navStateService = inject(NavStateService);
  authService = inject(AuthService);
  propertyService = inject(PropertyService);

  @Output() searchSubmitted = new EventEmitter<SearchFilter>();

  selectedCategory = 'all-residential';
  searchKeyword = '';
  selectedBudget = 'any';

  openPlanOption(plan: 'gold' | 'platinum') {
    if (plan === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onCategoryChange(catSlug: string) {
    this.selectedCategory = catSlug;
    this.router.navigate(['/' + catSlug]);
  }

  onSearch() {
    this.searchSubmitted.emit({
      category: this.selectedCategory,
      location: this.searchKeyword,
      budgetRange: this.selectedBudget
    });
    this.router.navigate(['/' + this.selectedCategory]);
  }
}

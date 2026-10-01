import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
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
            
            <!-- Category Dropdown: All Residential, Plots & Land, Villas, Apartments / Flats, Independent Houses, Commercial Spaces, Farm Lands -->
            <div class="control-group category-group">
              <label for="search-cat-select" class="group-label">Category</label>
              <div class="select-wrapper">
                <select 
                  id="search-cat-select" 
                  class="control-select" 
                  [(ngModel)]="selectedCategory" 
                  name="category">
                  <option value="all-residential">All Categories</option>
                  <option value="plots">Plots & Land</option>
                  <option value="villas">Villas & Estates</option>
                  <option value="apartments">Apartments / Flats</option>
                  <option value="independent-houses">Independent Houses</option>
                  <option value="commercial">Commercial Spaces</option>
                  <option value="farm-lands">Farm Lands</option>
                </select>
              </div>
            </div>

            <!-- Divider -->
            <div class="control-divider"></div>

            <!-- Location Search with Dynamic Database-driven Suggestions -->
            <div class="control-group location-group">
              <label for="search-keyword-input" class="group-label">Location / City</label>
              <div class="input-wrapper">
                <svg class="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <input 
                  id="search-keyword-input"
                  type="text" 
                  list="dynamicPropertyLocations"
                  class="control-input" 
                  placeholder="Enter city, locality or area" 
                  [(ngModel)]="searchKeyword" 
                  (input)="onLocationInput()"
                  name="keyword" 
                  autocomplete="off" />
                <datalist id="dynamicPropertyLocations">
                  <option *ngFor="let loc of dynamicLocations()" [value]="loc">{{ loc }}</option>
                </datalist>
              </div>
            </div>

            <!-- Divider -->
            <div class="control-divider"></div>

            <!-- Budget Filter (in INR Lakhs and Crores) -->
            <div class="control-group budget-group">
              <label for="search-budget-select" class="group-label">Budget</label>
              <div class="select-wrapper">
                <select id="search-budget-select" class="control-select" [(ngModel)]="selectedBudget" name="budget">
                  <option value="any">Budget (Any)</option>
                  <option value="under-20l">Under ₹20 Lakhs</option>
                  <option value="20l-50l">₹20 Lakhs – ₹50 Lakhs</option>
                  <option value="50l-1cr">₹50 Lakhs – ₹1 Crore</option>
                  <option value="1cr-3cr">₹1 Crore – ₹3 Crores</option>
                  <option value="3cr-5cr">₹3 Crores – ₹5 Crores</option>
                  <option value="above-5cr">Above ₹5 Crores</option>
                </select>
              </div>
            </div>

            <!-- Search Action CTA Button & Clear -->
            <div class="search-btn-wrapper">
              <button type="button" class="btn btn-clear-search" *ngIf="hasActiveFilters()" (click)="clearFilters()" title="Clear filters">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Clear</span>
              </button>
              <button type="submit" class="btn btn-primary btn-search" id="property-search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search</span>
              </button>
            </div>

          </form>

          <!-- ADVANCED FILTERS TOGGLE & EXPANDABLE SECTION -->
          <div class="advanced-filter-toggle-row">
            <button 
              type="button" 
              class="btn-toggle-advanced" 
              (click)="toggleAdvancedFilters()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              <span>{{ showAdvancedFilters() ? 'Fewer Filters' : 'More Search Filters' }}</span>
              <span class="active-badge-count" *ngIf="advancedFiltersCount() > 0">{{ advancedFiltersCount() }} Active</span>
              <svg class="chevron-icon" [class.rotated]="showAdvancedFilters()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <!-- EXPANDABLE ADVANCED FILTERS GRID -->
          <div class="advanced-filters-panel" *ngIf="showAdvancedFilters()">
            <div class="advanced-grid">
              
              <!-- Property Sub-Type -->
              <div class="adv-group">
                <label for="search-type-select" class="adv-label">Property Type</label>
                <select id="search-type-select" class="adv-select" [(ngModel)]="selectedPropertyType" name="propertyType">
                  <option value="any">Any Type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Plot">Gated / Layout Plot</option>
                  <option value="Villa">Villa / House</option>
                  <option value="Apartment">Apartment / Flat</option>
                  <option value="Farm Land">Farm Land</option>
                </select>
              </div>

              <!-- BHK / Bedrooms -->
              <div class="adv-group">
                <label for="search-bhk-select" class="adv-label">BHK / Bedrooms</label>
                <select id="search-bhk-select" class="adv-select" [(ngModel)]="selectedBhk" name="bhk">
                  <option value="any">Any BHK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5+ BHK">5+ BHK</option>
                </select>
              </div>

              <!-- Facing Direction -->
              <div class="adv-group">
                <label for="search-facing-select" class="adv-label">Facing Direction</label>
                <select id="search-facing-select" class="adv-select" [(ngModel)]="selectedFacing" name="facing">
                  <option value="any">Any Facing</option>
                  <option value="East">East Facing</option>
                  <option value="North">North Facing</option>
                  <option value="South">South Facing</option>
                  <option value="West">West Facing</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <!-- Furnishing -->
              <div class="adv-group">
                <label for="search-furnishing-select" class="adv-label">Furnishing</label>
                <select id="search-furnishing-select" class="adv-select" [(ngModel)]="selectedFurnishing" name="furnishing">
                  <option value="any">Any Furnishing</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <!-- Possession / Construction Status -->
              <div class="adv-group">
                <label for="search-status-select" class="adv-label">Possession Status</label>
                <select id="search-status-select" class="adv-select" [(ngModel)]="selectedConstructionStatus" name="constructionStatus">
                  <option value="any">Any Status</option>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Newly Launched">Newly Launched</option>
                </select>
              </div>

            </div>
          </div>

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

    .search-btn-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-clear-search {
      height: 46px;
      padding: 0 1rem;
      background: var(--slate-100);
      color: var(--slate-600);
      border: 1px solid var(--slate-300);
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s ease;
    }

    .btn-clear-search:hover {
      background: #FEE2E2;
      color: #DC2626;
      border-color: #FCA5A5;
    }

    .btn-search {
      height: 46px;
      padding: 0 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 12px rgba(11, 19, 43, 0.2);
    }

    /* ADVANCED FILTERS STYLING */
    .advanced-filter-toggle-row {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--slate-200);
    }

    .btn-toggle-advanced {
      background: none;
      border: none;
      color: #0284C7;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .btn-toggle-advanced:hover {
      background: #F0F9FF;
      color: #0369A1;
    }

    .active-badge-count {
      background: #E0F2FE;
      color: #0284C7;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      border: 1px solid #BAE6FD;
    }

    .chevron-icon {
      transition: transform 0.2s ease;
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    .advanced-filters-panel {
      margin-top: 1rem;
      padding: 1.25rem;
      background: #F8FAFC;
      border-radius: var(--radius-md);
      border: 1px solid var(--slate-200);
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .advanced-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
    }

    @media (max-width: 1024px) {
      .advanced-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 640px) {
      .advanced-grid {
        grid-template-columns: 1fr;
      }
    }

    .adv-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .adv-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--slate-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .adv-select {
      width: 100%;
      height: 38px;
      padding: 0 0.75rem;
      border: 1.5px solid var(--slate-300);
      border-radius: 6px;
      background: #FFFFFF;
      color: #0F172A;
      font-size: 0.88rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .adv-select:focus {
      border-color: #0284C7;
    }

    @media (max-width: 980px) {
      .floating-search-section {
        margin-top: -24px;
        padding-bottom: 1.5rem;
      }

      .search-panel-card {
        padding: 1.25rem 1rem;
        border-radius: var(--radius-md);
      }

      .plans-toggle-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.85rem;
      }

      .plans-buttons-wrap {
        width: 100%;
      }

      .plan-card-btn {
        flex: 1;
        min-width: 140px;
        padding: 0.5rem 0.85rem;
      }

      .search-controls-row {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .control-divider {
        display: none;
      }

      .control-group {
        border-bottom: 1px solid var(--slate-100);
        padding-bottom: 0.4rem;
      }

      .search-btn-wrapper {
        width: 100%;
        display: flex;
        flex-direction: row;
      }

      .btn-clear-search {
        flex: 1;
        justify-content: center;
        margin-top: 0.4rem;
        height: 44px;
      }

      .btn-search {
        flex: 2;
        margin-top: 0.4rem;
        height: 44px;
      }
    }

    @media (max-width: 520px) {
      .search-panel-card {
        padding: 1rem 0.75rem;
      }

      .plans-buttons-wrap {
        flex-direction: column;
      }

      .plan-card-btn {
        width: 100%;
        min-width: 100%;
        box-sizing: border-box;
      }

      .plan-title {
        font-size: 0.88rem;
      }

      .plan-price {
        font-size: 1.1rem;
      }
    }
  `]
})
export class PropertySearchComponent implements OnInit {
  router = inject(Router);
  notificationService = inject(NotificationService);
  navStateService = inject(NavStateService);
  authService = inject(AuthService);
  propertyService = inject(PropertyService);

  @Output() searchSubmitted = new EventEmitter<SearchFilter>();

  // Primary Filters
  selectedCategory = 'all-residential';
  searchKeyword = '';
  selectedBudget = 'any';

  // Advanced Filters
  selectedPropertyType = 'any';
  selectedBhk = 'any';
  selectedFacing = 'any';
  selectedFurnishing = 'any';
  selectedConstructionStatus = 'any';
  showAdvancedFilters = signal<boolean>(false);

  // Dynamic suggestions fetched straight from actual database property records
  dynamicLocations = signal<string[]>([]);
  private locationDebounceTimer: any = null;

  ngOnInit() {
    this.loadLocations();
  }

  async loadLocations(query?: string) {
    try {
      const locs = await this.propertyService.fetchLocationsFromBackend(query);
      this.dynamicLocations.set(locs);
    } catch {
      this.dynamicLocations.set([]);
    }
  }

  onLocationInput() {
    clearTimeout(this.locationDebounceTimer);
    this.locationDebounceTimer = setTimeout(() => {
      this.loadLocations(this.searchKeyword);
    }, 250);
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(v => !v);
  }

  advancedFiltersCount(): number {
    let count = 0;
    if (this.selectedPropertyType !== 'any') count++;
    if (this.selectedBhk !== 'any') count++;
    if (this.selectedFacing !== 'any') count++;
    if (this.selectedFurnishing !== 'any') count++;
    if (this.selectedConstructionStatus !== 'any') count++;
    return count;
  }

  openPlanOption(plan: 'gold' | 'platinum') {
    if (plan === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  hasActiveFilters(): boolean {
    return (
      (this.selectedCategory !== 'all-residential' && this.selectedCategory !== 'all' && this.selectedCategory !== '') ||
      (this.searchKeyword !== undefined && this.searchKeyword.trim().length > 0) ||
      (this.selectedBudget !== 'any' && this.selectedBudget !== 'ALL' && this.selectedBudget !== '') ||
      (this.selectedPropertyType !== 'any') ||
      (this.selectedBhk !== 'any') ||
      (this.selectedFacing !== 'any') ||
      (this.selectedFurnishing !== 'any') ||
      (this.selectedConstructionStatus !== 'any')
    );
  }

  clearFilters() {
    this.selectedCategory = 'all-residential';
    this.searchKeyword = '';
    this.selectedBudget = 'any';
    this.selectedPropertyType = 'any';
    this.selectedBhk = 'any';
    this.selectedFacing = 'any';
    this.selectedFurnishing = 'any';
    this.selectedConstructionStatus = 'any';
    this.loadLocations();
    this.searchSubmitted.emit({
      category: 'all-residential',
      location: '',
      budgetRange: 'any'
    });
  }

  onSearch() {
    this.searchSubmitted.emit({
      category: this.selectedCategory,
      location: this.searchKeyword.trim(),
      budgetRange: this.selectedBudget,
      propertyType: this.selectedPropertyType !== 'any' ? this.selectedPropertyType : undefined,
      bhk: this.selectedBhk !== 'any' ? this.selectedBhk : undefined,
      facing: this.selectedFacing !== 'any' ? this.selectedFacing : undefined,
      furnishing: this.selectedFurnishing !== 'any' ? this.selectedFurnishing : undefined,
      constructionStatus: this.selectedConstructionStatus !== 'any' ? this.selectedConstructionStatus : undefined
    });
  }
}

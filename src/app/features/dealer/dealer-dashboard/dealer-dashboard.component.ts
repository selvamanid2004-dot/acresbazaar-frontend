import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { DealerAccount } from '../../../core/models/buyer.model';
import { getApiBaseUrl } from '../../../core/services/api-config';

interface DealerBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCategory?: string;
  propertyPrice?: number;
  planType: string;
  dealerName: string;
  dealerCompany?: string;
  dealerEmail: string;
  dealerPhone: string;
  bookingAmount?: number;
  bookingStatus: string;
  notes?: string;
  bookingDate: string;
  property?: any;
}

interface DealerRewardSummary {
  totalEarned: number;
  availablePoints: number;
  activeClaim: any | null;
  history: any[];
}

@Component({
  selector: 'app-dealer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-page">
      <!-- Top Banner / Greeting -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-badge">
            <span class="pulse-dot"></span>
            DEALER / AGENCY COMMAND CENTER
          </div>
          <h1>Welcome, <span class="gold-text">{{ dealer()?.businessName || dealer()?.fullName || 'Dealer Partner' }}</span></h1>
          <p class="subtitle">Buy properties under Gold & Premium plans, list verified agency inventory for sale, and earn dealer rewards.</p>
        </div>

        <div class="header-actions">
          <button (click)="switchTab('buy')" class="cta-btn buy-cta" [class.active-cta]="activeTab() === 'buy'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Buy Property
          </button>
          <a routerLink="/dealer/add-property" class="cta-btn primary-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Sell Property
          </a>
          <button (click)="logout()" class="logout-btn" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card cursor-pointer" (click)="switchTab('sell')">
          <div class="stat-icon gold-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Properties For Sale</span>
            <span class="stat-val">{{ myProperties().length }}</span>
          </div>
        </div>

        <div class="stat-card cursor-pointer" (click)="switchTab('my-bookings')">
          <div class="stat-icon blue-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Properties Booked / Bought</span>
            <span class="stat-val">{{ myBookings().length }}</span>
          </div>
        </div>

        <div class="stat-card cursor-pointer" (click)="switchTab('rewards')">
          <div class="stat-icon emerald-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Dealer Reward Points</span>
            <span class="stat-val text-gold">{{ rewardsSummary().availablePoints }} <small style="font-size: 0.65em; color: #94A3B8;">pts</small></span>
          </div>
        </div>

        <div class="stat-card cursor-pointer" (click)="openPlanUnlockModal('platinum')">
          <div class="stat-icon purple-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Buying Access Plan</span>
            <span class="stat-val" [ngClass]="dealerActivePlan() ? 'status-active' : 'text-amber'">
              {{ dealerActivePlan() ? ((dealerActivePlan() === 'gold' ? propertyService.goldPlan().name : propertyService.platinumPlan().name) + ' Active') : 'Locked (Click to Unlock)' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Action Navigation Tabs -->
      <div class="dashboard-nav-bar">
        <div class="nav-links">
          <button (click)="switchTab('overview')" class="nav-tab" [class.active]="activeTab() === 'overview'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Agency Overview
          </button>
          
          <button (click)="switchTab('buy')" class="nav-tab buy-highlight" [class.active]="activeTab() === 'buy'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Buy Properties
            <span class="tab-badge gold" *ngIf="dealerActivePlan()">{{ dealerActivePlan() === 'gold' ? 'Gold Unlocked' : 'Premium Unlocked' }}</span>
            <span class="tab-badge amber" *ngIf="!dealerActivePlan()">🔒 Locked</span>
          </button>

          <button (click)="switchTab('my-bookings')" class="nav-tab" [class.active]="activeTab() === 'my-bookings'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
            </svg>
            My Bookings ({{ myBookings().length }})
          </button>

          <button (click)="switchTab('sell')" class="nav-tab" [class.active]="activeTab() === 'sell'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Sell Properties ({{ myProperties().length }})
          </button>

          <button (click)="switchTab('rewards')" class="nav-tab" [class.active]="activeTab() === 'rewards'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Dealer Rewards
            <span class="tab-badge green">{{ rewardsSummary().availablePoints }} pts</span>
          </button>
        </div>
      </div>

      <!-- Celebration/Success Toast -->
      <div *ngIf="successBanner()" class="success-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ successBanner() }}</span>
        <button (click)="successBanner.set(null)" class="close-banner">&times;</button>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 1: OVERVIEW -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'overview'" class="tab-pane">
        <!-- Platinum Integration Notice -->
        <div class="platinum-banner">
          <div class="platinum-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            DEALER DUAL-TRADING PORTAL
          </div>
          <div class="platinum-text">
            <h3>Buy & Sell Real Estate with Institutional Escrow Guarantee</h3>
            <p>Dealers can acquire properties under the <strong>Gold Plan</strong> or <strong>Premium Plan</strong>, list inventory for sale under verified Platinum tier, and earn up to 500 reward points on every transaction.</p>
          </div>
          <div class="platinum-actions">
            <button (click)="switchTab('buy')" class="platinum-cta buy-cta-btn">Buy Properties &rarr;</button>
            <a routerLink="/dealer/add-property" class="platinum-cta sell-cta-btn">Sell Property &rarr;</a>
          </div>
        </div>

        <!-- Two Column Quick View -->
        <div class="two-col-grid">
          <!-- Recent Bookings / Purchases -->
          <div class="section-card">
            <div class="card-header">
              <div>
                <h3>Properties Booked / Acquired</h3>
                <p>Your recent property purchase orders under Gold & Premium plans</p>
              </div>
              <button (click)="switchTab('my-bookings')" class="view-link">View All &rarr;</button>
            </div>

            <div *ngIf="myBookings().length === 0" class="mini-empty">
              <p>No properties booked yet. Explore our marketplace to acquire assets.</p>
              <button (click)="switchTab('buy')" class="btn-sm-primary">Browse Properties to Buy</button>
            </div>

            <div *ngIf="myBookings().length > 0" class="mini-list">
              <div *ngFor="let b of myBookings().slice(0, 3)" class="mini-item">
                <div class="mini-badge" [ngClass]="b.planType === 'GOLD' ? 'gold' : 'platinum'">
                  {{ b.planType === 'GOLD' ? 'Gold Plan' : 'Premium Plan' }}
                </div>
                <div class="mini-details">
                  <h4>{{ b.propertyTitle }}</h4>
                  <span class="mini-meta">Booked: {{ b.bookingDate | date:'mediumDate' }} | Token: ₹{{ b.bookingAmount || 0 | number }}</span>
                </div>
                <div class="mini-status" [ngClass]="b.bookingStatus.toLowerCase()">
                  {{ b.bookingStatus }}
                </div>
              </div>
            </div>
          </div>

          <!-- Agency Listings for Sale -->
          <div class="section-card">
            <div class="card-header">
              <div>
                <h3>Agency Listings for Sale</h3>
                <p>Your submitted properties on AcresBazaar Platinum showcase</p>
              </div>
              <button (click)="switchTab('sell')" class="view-link">View All &rarr;</button>
            </div>

            <div *ngIf="myProperties().length === 0" class="mini-empty">
              <p>No properties posted for sale yet. Add your first listing to start receiving buyers.</p>
              <a routerLink="/dealer/add-property" class="btn-sm-primary">+ Post Property for Sale</a>
            </div>

            <div *ngIf="myProperties().length > 0" class="mini-list">
              <div *ngFor="let prop of myProperties().slice(0, 3)" class="mini-item">
                <div class="mini-badge platinum">Platinum Listing</div>
                <div class="mini-details">
                  <h4>{{ prop.title }}</h4>
                  <span class="mini-meta">{{ prop.location }} &bull; {{ prop.price }}</span>
                </div>
                <div class="mini-status" [ngClass]="prop.submissionStatus ? prop.submissionStatus.toLowerCase().replace(' ', '-') : 'pending'">
                  {{ prop.submissionStatus || 'Pending Verification' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 2: BUY PROPERTIES (LOCKED / UNLOCKED VIA PLANS LIKE BUYER MODULE) -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'buy'" class="tab-pane">
        <!-- Plan Status Banner -->
        <div class="membership-status-banner" [ngClass]="dealerActivePlan() ? (dealerActivePlan() === 'gold' ? 'gold-active' : 'platinum-active') : 'locked-banner'">
          <div class="banner-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <div *ngIf="!dealerActivePlan()">
              <strong>Dealer Buying Access is Currently Locked:</strong>
              Unlock with a membership plan to reveal property titles, exact prices, verified addresses, and seller contact details.
            </div>
            <div *ngIf="dealerActivePlan() === 'gold'">
              <strong>{{ propertyService.goldPlan().name }} Active (₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }}):</strong>
              Gold property titles, exact pricing, and seller contacts are unlocked. Premium Plan properties remain locked.
            </div>
            <div *ngIf="dealerActivePlan() === 'platinum'">
              <strong>{{ propertyService.platinumPlan().name }} Active (₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period }}):</strong>
              All Gold & Premium VIP properties, exact prices, dossiers, and direct contacts are unlocked.
            </div>
          </div>

          <div class="banner-actions">
            <button *ngIf="!dealerActivePlan()" (click)="openPlanUnlockModal('gold')" class="btn-unlock-pill gold-pill">
              Unlock {{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }})
            </button>
            <button *ngIf="!dealerActivePlan()" (click)="openPlanUnlockModal('platinum')" class="btn-unlock-pill platinum-pill">
              Unlock {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }})
            </button>
            <button *ngIf="dealerActivePlan() === 'gold'" (click)="openPlanUnlockModal('platinum')" class="btn-unlock-pill platinum-pill">
              Upgrade to {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }})
            </button>
            <button *ngIf="dealerActivePlan()" (click)="relockForDemo()" class="btn-relock">
              Relock (Demo)
            </button>
          </div>
        </div>

        <div class="marketplace-header">
          <div>
            <h2>Buy Properties Portal</h2>
            <p>Browse institutional inventory, prime lands, luxury villas and commercial spaces. Properties are locked until unlocked under Gold or Premium Plan. Bookings earn +500 Dealer Reward Points.</p>
          </div>
          <div class="rewards-pill">
            <span class="icon">🎁</span>
            <span>Earn <strong>+500 Points</strong> per booking</span>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="filter-bar">
          <div class="filter-group">
            <label>Category:</label>
            <select [ngModel]="selectedCategory()" (ngModelChange)="onCategoryChange($event)" class="filter-select">
              <option value="all">All Categories</option>
              <option value="plots">Plots & Land</option>
              <option value="villas">Luxury Villas</option>
              <option value="apartments">Premium Apartments</option>
              <option value="commercial">Commercial Real Estate</option>
              <option value="independent-houses">Independent Houses</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Plan Tier:</label>
            <div class="plan-toggle">
              <button (click)="onPlanFilterChange('all')" class="toggle-btn" [class.active]="selectedPlanFilter() === 'all'">All Plans</button>
              <button (click)="onPlanFilterChange('gold')" class="toggle-btn gold" [class.active]="selectedPlanFilter() === 'gold'">Gold Plan</button>
              <button (click)="onPlanFilterChange('platinum')" class="toggle-btn platinum" [class.active]="selectedPlanFilter() === 'platinum'">Premium / Platinum</button>
            </div>
          </div>

          <div class="search-wrap">
            <input type="text" [ngModel]="searchQuery()" (ngModelChange)="onSearchChange($event)" placeholder="Search by location, city, category..." class="search-input" />
          </div>
        </div>

        <!-- Property Grid -->
        <div *ngIf="isLoadingMarketplace()" class="loading-state">
          <div class="spinner"></div>
          <p>Loading available marketplace properties...</p>
        </div>

        <div *ngIf="!isLoadingMarketplace() && filteredMarketplace().length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3>No properties match your filter</h3>
          <p>Try switching categories or plan filters to see available inventory.</p>
          <button (click)="resetFilters()" class="cta-btn empty-cta">Reset Filters</button>
        </div>

        <div *ngIf="!isLoadingMarketplace() && filteredMarketplace().length > 0" class="property-cards-grid">
          <div *ngFor="let prop of filteredMarketplace()" class="prop-card buy-card" [class.is-locked]="!isPropUnlocked(prop)">
            
            <!-- Media Image Box -->
            <div class="prop-img-wrap">
              <img [src]="prop.imageUrl" [alt]="prop.title" class="prop-img" (error)="onImgError($event)" [class.blur-locked]="!isPropUnlocked(prop)" />
              <div class="plan-tag" [ngClass]="prop.planType === 'GOLD' ? 'gold' : 'platinum'">
                {{ prop.planType === 'GOLD' ? 'Gold Plan' : 'Premium Plan' }}
              </div>
              <div class="category-badge">{{ prop.category | uppercase }}</div>
              
              <!-- Locked overlay pill -->
              <div *ngIf="!isPropUnlocked(prop)" class="locked-overlay-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>LOCKED</span>
              </div>
            </div>

            <!-- UNLOCKED VIEW: Full details, price, direct contact, and Book Property button -->
            <div *ngIf="isPropUnlocked(prop)" class="prop-info unlocked-view">
              <div class="unlocked-badge-row">
                <span class="access-badge" [ngClass]="prop.planType === 'GOLD' ? 'gold-access' : 'plat-access'">
                  {{ prop.planType === 'GOLD' ? 'GOLD UNLOCKED' : 'PREMIUM UNLOCKED' }}
                </span>
                <span class="city-pill">{{ prop.city || prop.location }}</span>
              </div>

              <h4 class="prop-title">{{ prop.title }}</h4>
              
              <div class="prop-loc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span><strong>Address:</strong> {{ prop.location }}</span>
              </div>

              <div class="prop-price">{{ prop.priceDisplay || ('₹' + (prop.price | number)) }}</div>

              <div class="revealed-contact">
                <span class="contact-lbl">Direct Contact:</span>
                <span class="contact-name">{{ prop.sellerName || 'Verified Principal / Developer' }}</span>
                <span class="contact-phone">{{ prop.sellerPhone || '+91 98450 00000' }}</span>
              </div>

              <div class="card-buy-actions">
                <button (click)="openBookingModal(prop)" class="btn-book-now">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                  </svg>
                  Book / Buy Property (+500 Pts)
                </button>
              </div>
            </div>

            <!-- STRICT LOCKED VIEW: Like Buyers Module -->
            <div *ngIf="!isPropUnlocked(prop)" class="prop-info locked-view">
              <div class="lock-circle" [ngClass]="prop.planType === 'GOLD' ? 'gold-circle' : 'blue-circle'">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>

              <h4 class="locked-title">Property Details Locked</h4>
              <p class="locked-sub">
                Unlock full property information, verified title dossier, exact valuation, and contact numbers under the <strong>{{ prop.planType === 'GOLD' ? propertyService.goldPlan().name : propertyService.platinumPlan().name }}</strong>.
              </p>

              <div class="locked-actions">
                <button 
                  *ngIf="prop.planType === 'GOLD'" 
                  (click)="openPlanUnlockModal('gold')" 
                  class="btn-unlock-action gold-action"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                  Unlock {{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }}/{{ propertyService.goldPlan().period }})
                </button>

                <button 
                  *ngIf="prop.planType !== 'GOLD'" 
                  (click)="openPlanUnlockModal('platinum')" 
                  class="btn-unlock-action platinum-action"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                  Unlock {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }}/{{ propertyService.platinumPlan().period }})
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 3: MY BOOKINGS & PURCHASES -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'my-bookings'" class="tab-pane">
        <div class="section-header">
          <div>
            <h2>My Booked & Purchased Properties</h2>
            <p>All real estate acquisitions initiated under your agency account. Details are submitted directly to the AcresBazaar Admin Panel for title clearance and legal closing.</p>
          </div>
          <button (click)="switchTab('buy')" class="cta-btn buy-cta">
            + Book Another Property
          </button>
        </div>

        <div *ngIf="myBookings().length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
            </svg>
          </div>
          <h3>No bookings or property purchases yet</h3>
          <p>Browse our marketplace, unlock the membership plan, and secure prime residential or commercial inventory.</p>
          <button (click)="switchTab('buy')" class="cta-btn empty-cta">Browse Properties to Buy</button>
        </div>

        <div *ngIf="myBookings().length > 0" class="table-container">
          <table class="dealer-table">
            <thead>
              <tr>
                <th>Property Details</th>
                <th>Plan Tier</th>
                <th>Token / Amount</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Agency Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of myBookings()">
                <td>
                  <div class="table-prop-title">{{ b.propertyTitle }}</div>
                  <div class="table-prop-meta">{{ b.propertyCategory || 'Real Estate' }} &bull; Ref: {{ b.propertyId.substring(0, 8) }}...</div>
                </td>
                <td>
                  <span class="plan-pill" [ngClass]="b.planType === 'GOLD' ? 'gold' : 'platinum'">
                    {{ b.planType === 'GOLD' ? 'Gold Plan' : 'Premium Plan' }}
                  </span>
                </td>
                <td class="font-bold text-gold">
                  ₹{{ b.bookingAmount || 0 | number }}
                </td>
                <td class="text-muted">
                  {{ b.bookingDate | date:'mediumDate' }}
                </td>
                <td>
                  <span class="status-pill" [ngClass]="b.bookingStatus.toLowerCase()">
                    {{ b.bookingStatus }}
                  </span>
                </td>
                <td class="text-sm text-secondary">
                  {{ b.notes || 'Standard agency booking' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 4: SELL PROPERTIES / MY LISTINGS -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'sell'" class="tab-pane">
        <div class="section-header">
          <div>
            <h2>Agency Selling Portfolio</h2>
            <p>Your agency's submitted properties for sale. All dealer listings are featured under the verified Platinum tier with guaranteed buyer leads.</p>
          </div>
          <a routerLink="/dealer/add-property" class="cta-btn primary-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Post Property for Sale
          </a>
        </div>

        <div *ngIf="myProperties().length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h3>No properties listed under your agency</h3>
          <p>Add your first commercial or residential listing to start receiving buyer inquiries and earn +250 reward points.</p>
          <a routerLink="/dealer/add-property" class="cta-btn empty-cta">Add Property Now</a>
        </div>

        <div *ngIf="myProperties().length > 0" class="property-cards-grid">
          <div *ngFor="let prop of myProperties()" class="prop-card">
            <div class="prop-img-wrap">
              <img [src]="prop.imageUrl" [alt]="prop.title" class="prop-img" (error)="onImgError($event)" />
              <div class="status-tag" [ngClass]="prop.submissionStatus ? prop.submissionStatus.toLowerCase().replace(' ', '-') : 'pending-verification'">
                {{ prop.submissionStatus || 'Pending Verification' }}
              </div>
              <div class="tier-tag">Platinum Plan</div>
            </div>
            <div class="prop-info">
              <div class="prop-category">{{ prop.category | uppercase }}</div>
              <h4 class="prop-title">{{ prop.title }}</h4>
              <div class="prop-loc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ prop.location }}
              </div>
              <div class="prop-price">{{ prop.price }}</div>
              <div class="prop-actions">
                <a [routerLink]="['/dealer/my-properties']" [queryParams]="{ edit: prop.id }" class="btn-action edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Property
                </a>
                <a [routerLink]="['/category', prop.category]" class="btn-action view">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View in Platinum
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 5: DEALER REWARDS SYSTEM -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'rewards'" class="tab-pane">
        <div class="rewards-banner">
          <div class="rewards-hero">
            <div class="rewards-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div>
              <h2>Dealer Reward & Commission Milestone System</h2>
              <p>Earn reward points every time you list properties or buy inventory under Gold/Premium plans. Every 1,000 points unlocks a ₹1,000 direct commission bonus.</p>
            </div>
          </div>

          <!-- Points Display Card -->
          <div class="points-card">
            <div class="points-header">
              <span>AVAILABLE REWARD POINTS</span>
              <span class="pts-badge">1 Pt = ₹1</span>
            </div>
            <div class="points-value">
              {{ rewardsSummary().availablePoints }}
              <span class="pts-unit">Points</span>
            </div>
            <div class="points-cash">Cash Equivalent: <strong>₹{{ rewardsSummary().availablePoints | number }}</strong></div>

            <!-- Progress to next 1000 Milestone -->
            <div class="milestone-progress">
              <div class="progress-labels">
                <span>Milestone Progress</span>
                <span>{{ rewardsSummary().availablePoints % 1000 }} / 1000 pts</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" [style.width.%]="getProgressPercent()"></div>
              </div>
            </div>

            <!-- Claim Button / Status -->
            <div *ngIf="rewardsSummary().activeClaim" class="claim-active-notice">
              <span class="status-dot"></span>
              <span>Active Payout Request Under Review: <strong>{{ rewardsSummary().activeClaim?.rewardTitle }}</strong> ({{ rewardsSummary().activeClaim?.status }})</span>
            </div>

            <div *ngIf="!rewardsSummary().activeClaim" class="claim-action-wrap">
              <button 
                (click)="openClaimModal()" 
                class="btn-claim-reward" 
                [disabled]="rewardsSummary().availablePoints < 1000"
                [title]="rewardsSummary().availablePoints < 1000 ? 'Earn at least 1,000 points to claim reward' : 'Claim ₹1,000 reward'"
              >
                Claim ₹1,000 Reward Payout
              </button>
              <small *ngIf="rewardsSummary().availablePoints < 1000" class="text-muted">
                {{ 1000 - (rewardsSummary().availablePoints % 1000) }} more points needed to claim
              </small>
            </div>
          </div>
        </div>

        <!-- How it works cards -->
        <div class="rules-grid">
          <div class="rule-card">
            <div class="rule-pts">+250 PTS</div>
            <h4>List a Property for Sale</h4>
            <p>Every time your agency lists a commercial or residential property for sale on AcresBazaar, earn +250 points upon submission.</p>
          </div>

          <div class="rule-card highlight">
            <div class="rule-pts gold">+500 PTS</div>
            <h4>Buy / Book Property</h4>
            <p>Book or purchase any property under the Gold Plan or Premium Plan to automatically earn +500 reward points.</p>
          </div>

          <div class="rule-card">
            <div class="rule-pts green">₹1,000</div>
            <h4>Direct Payout</h4>
            <p>Redeem your points anytime you hit 1,000 points milestone. Payouts are transferred directly to your bank account or UPI.</p>
          </div>
        </div>

        <!-- Reward Activity History -->
        <div class="section-card" style="margin-top: 32px;">
          <div class="card-header">
            <h3>Reward Points History</h3>
            <span class="text-muted">Total Points Earned: {{ rewardsSummary().totalEarned }} pts</span>
          </div>

          <div *ngIf="rewardsSummary().history.length === 0" class="mini-empty">
            <p>No reward transactions recorded yet. List a property or book inventory to begin earning points.</p>
          </div>

          <div *ngIf="rewardsSummary().history.length > 0" class="table-container">
            <table class="dealer-table">
              <thead>
                <tr>
                  <th>Activity / Reward</th>
                  <th>Property / Reference</th>
                  <th>Points</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of rewardsSummary().history">
                  <td>
                    <strong>{{ item.rewardTitle }}</strong>
                  </td>
                  <td>{{ item.propertyTitle || 'Agency Incentive' }}</td>
                  <td [ngClass]="item.points > 0 ? 'text-gold font-bold' : 'text-danger font-bold'">
                    {{ item.points > 0 ? '+' : '' }}{{ item.points }} pts
                  </td>
                  <td class="text-muted">{{ item.date | date:'mediumDate' }}</td>
                  <td>
                    <span class="status-pill" [ngClass]="item.status.toLowerCase()">
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PLAN UNLOCK MODAL (DEALER UNLOCKS GOLD OR PLATINUM/PREMIUM MEMBERSHIP) -->
      <!-- ========================================================================= -->
      <div *ngIf="planUnlockModalOpen()" class="modal-backdrop">
        <div class="modal-dialog plan-unlock-dialog">
          <div class="modal-header">
            <div>
              <h3>Unlock Dealer Buying Access</h3>
              <p>Choose your plan to reveal full property titles, exact valuation, addresses, and owner contact details.</p>
            </div>
            <button (click)="closePlanUnlockModal()" class="close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <div class="plan-selection-boxes">
              <!-- Gold Plan Box -->
              <div 
                class="plan-choice-card" 
                [class.selected]="selectedUnlockTier() === 'gold'"
                (click)="selectedUnlockTier.set('gold')"
              >
                <div class="choice-top">
                  <span class="plan-pill gold">{{ propertyService.goldPlan().name | uppercase }}</span>
                  <div class="choice-price">
                    <span class="cur">₹</span>
                    <span class="val">{{ propertyService.goldPlan().price }}</span>
                    <span class="per">/ {{ propertyService.goldPlan().period }}</span>
                  </div>
                </div>

                <p class="choice-desc">{{ propertyService.goldPlan().description }}</p>

                <ul class="choice-perks">
                  <li>&#10003; Unlocks all Gold Plan properties</li>
                  <li>&#10003; Full property dossiers & exact prices</li>
                  <li>&#10003; Direct owner and builder contact phone numbers</li>
                  <li>&#10003; Legal title verification reports</li>
                  <li>&#10003; +500 Dealer Reward Points on every booking</li>
                </ul>

                <button 
                  type="button" 
                  class="btn-select-tier gold-tier-btn"
                  [class.active-btn]="selectedUnlockTier() === 'gold'"
                  (click)="activatePlan('gold')"
                >
                  Activate {{ propertyService.goldPlan().name }} (₹{{ propertyService.goldPlan().price }})
                </button>
              </div>

              <!-- Platinum / Premium Plan Box -->
              <div 
                class="plan-choice-card premium-choice" 
                [class.selected]="selectedUnlockTier() === 'platinum'"
                (click)="selectedUnlockTier.set('platinum')"
              >
                <div class="choice-top">
                  <span class="plan-pill platinum">{{ propertyService.platinumPlan().name | uppercase }}</span>
                  <div class="choice-price">
                    <span class="cur">₹</span>
                    <span class="val">{{ propertyService.platinumPlan().price }}</span>
                    <span class="per">/ {{ propertyService.platinumPlan().period }}</span>
                  </div>
                </div>

                <p class="choice-desc">{{ propertyService.platinumPlan().description }}</p>

                <ul class="choice-perks">
                  <li>&#10003; <strong>Unlocks ALL inventory (Gold & Premium VIP)</strong></li>
                  <li>&#10003; Instant principal callback guarantee</li>
                  <li>&#10003; Institutional 100% Escrow Title Protection</li>
                  <li>&#10003; Priority inspection & VIP negotiation support</li>
                  <li>&#10003; +500 Dealer Reward Points on every booking</li>
                </ul>

                <button 
                  type="button" 
                  class="btn-select-tier platinum-tier-btn"
                  [class.active-btn]="selectedUnlockTier() === 'platinum'"
                  (click)="activatePlan('platinum')"
                >
                  Activate {{ propertyService.platinumPlan().name }} (₹{{ propertyService.platinumPlan().price }})
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closePlanUnlockModal()" class="btn-cancel">Close</button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- BOOKING MODAL (DEALER BUYS PROPERTY UNDER GOLD / PREMIUM PLAN) -->
      <!-- ========================================================================= -->
      <div *ngIf="bookingModalOpen()" class="modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <h3>Book / Buy Property under Plan</h3>
              <p>Reserve this asset with your agency credentials and secure exclusive client rights.</p>
            </div>
            <button (click)="closeBookingModal()" class="close-btn">&times;</button>
          </div>

          <div class="modal-body" *ngIf="selectedPropForBooking()">
            <!-- Selected Property Preview -->
            <div class="modal-prop-preview">
              <img [src]="selectedPropForBooking().imageUrl" [alt]="selectedPropForBooking().title" class="preview-img" (error)="onImgError($event)" />
              <div>
                <h4 class="preview-title">{{ selectedPropForBooking().title }}</h4>
                <div class="preview-loc">{{ selectedPropForBooking().location }}</div>
                <div class="preview-price">{{ selectedPropForBooking().priceDisplay || ('₹' + (selectedPropForBooking().price | number)) }}</div>
              </div>
            </div>

            <!-- Plan Selection (Gold vs Premium) -->
            <div class="form-group">
              <label class="form-label">Booking Plan Tier <span class="req">*</span></label>
              <div class="plan-options-grid">
                <div 
                  class="plan-option-card" 
                  [class.selected]="bookingForm.planType === 'GOLD'"
                  (click)="bookingForm.planType = 'GOLD'"
                >
                  <div class="plan-option-header">
                    <span class="plan-badge gold">GOLD PLAN</span>
                    <input type="radio" name="planType" [checked]="bookingForm.planType === 'GOLD'" />
                  </div>
                  <div class="plan-option-perks">
                    <div>&#10003; Priority Gold Title Due Diligence</div>
                    <div>&#10003; Direct Owner Contact Numbers</div>
                    <div>&#10003; +500 Dealer Reward Points</div>
                  </div>
                </div>

                <div 
                  class="plan-option-card" 
                  [class.selected]="bookingForm.planType === 'PREMIUM'"
                  (click)="bookingForm.planType = 'PREMIUM'"
                >
                  <div class="plan-option-header">
                    <span class="plan-badge platinum">PREMIUM PLAN</span>
                    <input type="radio" name="planType" [checked]="bookingForm.planType === 'PREMIUM'" />
                  </div>
                  <div class="plan-option-perks">
                    <div>&#10003; VIP Escrow Protection Guarantee</div>
                    <div>&#10003; 30-Min Principal Callback</div>
                    <div>&#10003; +500 Dealer Reward Points</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking Token Amount -->
            <div class="form-group">
              <label class="form-label">Token / Booking Deposit Amount (₹) <span class="req">*</span></label>
              <input type="number" [(ngModel)]="bookingForm.amount" class="form-input" min="1000" step="5000" />
              <small class="text-muted">Standard token deposit to initiate legal title deed verification.</small>
            </div>

            <!-- Dealer Agency Details (Pre-filled) -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Dealer / Agent Name</label>
                <input type="text" [value]="dealer()?.fullName || dealer()?.businessName || 'Dealer Partner'" disabled class="form-input disabled" />
              </div>
              <div class="form-group">
                <label class="form-label">Agency / Business Name</label>
                <input type="text" [value]="dealer()?.businessName || 'Authorized Brokerage'" disabled class="form-input disabled" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Contact Email</label>
                <input type="text" [value]="dealer()?.email || ''" disabled class="form-input disabled" />
              </div>
              <div class="form-group">
                <label class="form-label">Contact Phone</label>
                <input type="text" [value]="dealer()?.mobile || dealer()?.phone || ''" disabled class="form-input disabled" />
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label">Agency Notes / Special Requirements</label>
              <textarea [(ngModel)]="bookingForm.notes" placeholder="e.g. Client inspection scheduled, payment via corporate escrow, etc." rows="2" class="form-textarea"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closeBookingModal()" class="btn-cancel" [disabled]="isSubmittingBooking()">Cancel</button>
            <button (click)="submitPropertyBooking()" class="btn-confirm-book" [disabled]="isSubmittingBooking()">
              <span *ngIf="!isSubmittingBooking()">Confirm & Book Property (+500 Pts)</span>
              <span *ngIf="isSubmittingBooking()">Booking Asset...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- CLAIM PAYOUT MODAL -->
      <!-- ========================================================================= -->
      <div *ngIf="claimModalOpen()" class="modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <h3>Claim ₹1,000 Reward Payout</h3>
              <p>Enter your agency bank or UPI details. Payout will be reviewed and disbursed by the Admin.</p>
            </div>
            <button (click)="closeClaimModal()" class="close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <div class="claim-info-box">
              <div class="info-label">Redeeming Points:</div>
              <div class="info-val">1,000 Points &rarr; <strong>₹1,000 Direct Cash</strong></div>
            </div>

            <div class="form-group">
              <label class="form-label">Bank Name <span class="req">*</span></label>
              <input type="text" [(ngModel)]="claimForm.bankName" placeholder="e.g. HDFC Bank / ICICI / SBI" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Account Number <span class="req">*</span></label>
              <input type="text" [(ngModel)]="claimForm.accountNo" placeholder="Enter bank account number" class="form-input" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">IFSC Code <span class="req">*</span></label>
                <input type="text" [(ngModel)]="claimForm.ifsc" placeholder="e.g. HDFC0001234" class="form-input uppercase" />
              </div>
              <div class="form-group">
                <label class="form-label">Account Holder Name <span class="req">*</span></label>
                <input type="text" [(ngModel)]="claimForm.holderName" placeholder="As per passbook" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">UPI ID (Optional)</label>
              <input type="text" [(ngModel)]="claimForm.upiId" placeholder="e.g. agency@okaxis" class="form-input" />
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closeClaimModal()" class="btn-cancel" [disabled]="isSubmittingClaim()">Cancel</button>
            <button (click)="submitPayoutClaim()" class="btn-confirm-book" [disabled]="isSubmittingClaim()">
              <span *ngIf="!isSubmittingClaim()">Submit Claim Request</span>
              <span *ngIf="isSubmittingClaim()">Submitting...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 24px 80px 24px;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F8FAFC;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #E2C044;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 5px 12px;
      border-radius: 20px;
      margin-bottom: 10px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #22C55E;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }

    h1 {
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 8px 0;
    }

    .gold-text {
      background: linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #AA820A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 0.95rem;
      color: #94A3B8;
      margin: 0;
      max-width: 650px;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .buy-cta {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }

    .buy-cta:hover, .buy-cta.active-cta {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      transform: translateY(-1px);
    }

    .primary-cta {
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0A1118;
      box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);
    }

    .primary-cta:hover {
      background: linear-gradient(135deg, #E2C044 0%, #B88E10 100%);
      transform: translateY(-1px);
    }

    .logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #F87171;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #EF4444;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s;
    }

    .stat-card.cursor-pointer:hover {
      border-color: rgba(212, 175, 55, 0.4);
      transform: translateY(-2px);
      background: #141F36;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .gold-icon { background: rgba(212, 175, 55, 0.15); color: #D4AF37; }
    .blue-icon { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
    .emerald-icon { background: rgba(16, 185, 129, 0.15); color: #34D399; }
    .purple-icon { background: rgba(168, 85, 247, 0.15); color: #C084FC; }

    .stat-meta {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.78rem;
      color: #94A3B8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-val {
      font-size: 1.55rem;
      font-weight: 800;
      color: #FFFFFF;
    }

    .text-gold { color: #E2C044; }
    .text-amber { color: #F59E0B; font-size: 1.05rem; }

    .status-active {
      color: #22C55E;
      font-size: 1.15rem;
    }

    /* Tab Bar */
    .dashboard-nav-bar {
      margin-bottom: 28px;
      border-bottom: 1px solid #1E293B;
    }

    .nav-links {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 10px;
      color: #94A3B8;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .nav-tab:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-tab.active {
      background: #1E293B;
      color: #D4AF37;
      border-color: rgba(212, 175, 55, 0.3);
    }

    .nav-tab.buy-highlight {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .tab-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 12px;
    }

    .tab-badge.gold {
      background: rgba(212, 175, 55, 0.2);
      color: #E2C044;
    }

    .tab-badge.amber {
      background: rgba(245, 158, 11, 0.2);
      color: #FBBF24;
    }

    .tab-badge.green {
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
    }

    /* Success Banner */
    .success-banner {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #A7F3D0;
      padding: 12px 18px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      font-size: 0.92rem;
      font-weight: 600;
    }

    .close-banner {
      margin-left: auto;
      background: none;
      border: none;
      color: #A7F3D0;
      font-size: 1.3rem;
      cursor: pointer;
    }

    /* Active Membership Banner in Buy Section */
    .membership-status-banner {
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .membership-status-banner.locked-banner {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #FDE68A;
    }

    .membership-status-banner.gold-active {
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #F3E5AB;
    }

    .membership-status-banner.platinum-active {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #BFDBFE;
    }

    .banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.92rem;
      line-height: 1.45;
      max-width: 800px;
    }

    .banner-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-unlock-pill {
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .gold-pill {
      background: #D4AF37;
      color: #0A1118;
    }

    .gold-pill:hover {
      background: #E2C044;
    }

    .platinum-pill {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .platinum-pill:hover {
      background: #2563EB;
    }

    .btn-relock {
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #E2E8F0;
      border-radius: 6px;
      font-size: 0.78rem;
      cursor: pointer;
    }

    /* Platinum Hero Banner */
    .platinum-banner {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .platinum-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 175, 55, 0.15);
      color: #E2C044;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 6px;
    }

    .platinum-text h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #FFFFFF;
    }

    .platinum-text p {
      font-size: 0.88rem;
      color: #94A3B8;
      margin: 0;
      max-width: 680px;
    }

    .platinum-actions {
      display: flex;
      gap: 10px;
    }

    .platinum-cta {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      border: none;
    }

    .buy-cta-btn {
      background: #10B981;
      color: #FFFFFF;
    }

    .sell-cta-btn {
      background: #D4AF37;
      color: #0A1118;
    }

    /* 2 Col Grid */
    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .section-card {
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 14px;
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 4px 0;
    }

    .card-header p {
      font-size: 0.8rem;
      color: #94A3B8;
      margin: 0;
    }

    .view-link {
      background: none;
      border: none;
      color: #D4AF37;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .mini-empty {
      padding: 28px 16px;
      text-align: center;
      color: #64748B;
      font-size: 0.88rem;
    }

    .btn-sm-primary {
      display: inline-block;
      margin-top: 10px;
      padding: 6px 14px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #E2C044;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
    }

    .mini-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mini-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #141F36;
      border-radius: 8px;
    }

    .mini-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }

    .mini-badge.gold {
      background: rgba(212, 175, 55, 0.2);
      color: #E2C044;
    }

    .mini-badge.platinum {
      background: rgba(148, 163, 184, 0.2);
      color: #E2E8F0;
    }

    .mini-details {
      flex: 1;
      min-width: 0;
    }

    .mini-details h4 {
      font-size: 0.88rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mini-meta {
      font-size: 0.75rem;
      color: #94A3B8;
    }

    .mini-status {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .mini-status.confirmed { background: rgba(16, 185, 129, 0.2); color: #34D399; }
    .mini-status.pending { background: rgba(245, 158, 11, 0.2); color: #FBBF24; }
    .mini-status.approved { background: rgba(16, 185, 129, 0.2); color: #34D399; }

    /* Marketplace Section (BUY) */
    .marketplace-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .marketplace-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 6px 0;
    }

    .marketplace-header p {
      font-size: 0.9rem;
      color: #94A3B8;
      max-width: 750px;
      margin: 0;
    }

    .rewards-pill {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #E2C044;
      padding: 8px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    /* Filters */
    .filter-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      background: #0F172A;
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid #1E293B;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-group label {
      font-size: 0.8rem;
      color: #94A3B8;
      font-weight: 600;
    }

    .filter-select {
      background: #141F36;
      border: 1px solid #334155;
      color: #FFFFFF;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .plan-toggle {
      display: flex;
      background: #141F36;
      border-radius: 8px;
      padding: 2px;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: #1E293B;
      color: #FFFFFF;
    }

    .toggle-btn.gold.active {
      background: rgba(212, 175, 55, 0.2);
      color: #E2C044;
    }

    .toggle-btn.platinum.active {
      background: rgba(59, 130, 246, 0.2);
      color: #60A5FA;
    }

    .search-wrap {
      flex: 1;
      min-width: 200px;
    }

    .search-input {
      width: 100%;
      background: #141F36;
      border: 1px solid #334155;
      color: #FFFFFF;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
    }

    /* Property Cards */
    .property-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .prop-card {
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 14px;
      overflow: hidden;
      transition: all 0.25s;
    }

    .prop-card.is-locked {
      border-color: rgba(245, 158, 11, 0.25);
    }

    .prop-card:hover {
      border-color: rgba(212, 175, 55, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
    }

    .prop-img-wrap {
      position: relative;
      height: 190px;
      background: #1E293B;
      overflow: hidden;
    }

    .prop-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: filter 0.3s;
    }

    .prop-img.blur-locked {
      filter: blur(4px) brightness(0.65);
    }

    .plan-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .plan-tag.gold {
      background: #D4AF37;
      color: #0A1118;
    }

    .plan-tag.platinum {
      background: #1E293B;
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .category-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(4px);
      color: #94A3B8;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .locked-overlay-tag {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(239, 68, 68, 0.9);
      color: #FFFFFF;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tier-tag {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #E2C044;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .status-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .status-tag.approved { background: #10B981; color: #FFFFFF; }
    .status-tag.pending-verification, .status-tag.pending { background: #F59E0B; color: #FFFFFF; }

    .prop-info {
      padding: 16px;
    }

    /* Unlocked Card Details */
    .unlocked-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .access-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .access-badge.gold-access {
      background: rgba(212, 175, 55, 0.2);
      color: #E2C044;
    }

    .access-badge.plat-access {
      background: rgba(59, 130, 246, 0.2);
      color: #60A5FA;
    }

    .city-pill {
      font-size: 0.75rem;
      color: #94A3B8;
    }

    .prop-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.35;
      color: #FFFFFF;
    }

    .prop-loc {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: #94A3B8;
      margin-bottom: 10px;
    }

    .prop-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #E2C044;
      margin-bottom: 12px;
    }

    .revealed-contact {
      background: #141F36;
      border: 1px solid #1E293B;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .contact-lbl {
      font-size: 0.72rem;
      color: #94A3B8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .contact-name {
      font-size: 0.88rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .contact-phone {
      font-size: 0.82rem;
      color: #38BDF8;
    }

    .card-buy-actions {
      border-top: 1px solid #1E293B;
      padding-top: 12px;
    }

    .btn-book-now {
      width: 100%;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-book-now:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    /* Locked Card Body (Buyer Module Theme) */
    .locked-view {
      text-align: center;
      padding: 24px 16px;
    }

    .lock-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px auto;
    }

    .gold-circle {
      background: rgba(212, 175, 55, 0.15);
      color: #D4AF37;
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
    }

    .blue-circle {
      background: rgba(59, 130, 246, 0.15);
      color: #60A5FA;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }

    .locked-title {
      font-size: 1.1rem;
      font-weight: 800;
      margin: 0 0 6px 0;
      color: #FFFFFF;
    }

    .locked-sub {
      font-size: 0.82rem;
      color: #94A3B8;
      line-height: 1.45;
      margin: 0 0 16px 0;
    }

    .btn-unlock-action {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .gold-action {
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0A1118;
    }

    .gold-action:hover {
      background: linear-gradient(135deg, #E2C044 0%, #B88E10 100%);
      transform: translateY(-1px);
    }

    .platinum-action {
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      color: #FFFFFF;
    }

    .platinum-action:hover {
      background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
      transform: translateY(-1px);
    }

    .prop-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-action.edit {
      background: #1E2D3D;
      color: #E2E8F0;
    }

    .btn-action.edit:hover {
      background: #243447;
      color: #D4AF37;
    }

    .btn-action.view {
      background: rgba(212, 175, 55, 0.1);
      color: #D4AF37;
      border: 1px solid rgba(212, 175, 55, 0.25);
    }

    .btn-action.view:hover {
      background: rgba(212, 175, 55, 0.2);
    }

    /* Table Styles */
    .table-container {
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 12px;
      overflow-x: auto;
    }

    .dealer-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .dealer-table th {
      background: #141F36;
      padding: 12px 16px;
      font-size: 0.78rem;
      color: #94A3B8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #1E293B;
    }

    .dealer-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #1E293B;
      font-size: 0.88rem;
      vertical-align: middle;
    }

    .dealer-table tr:last-child td {
      border-bottom: none;
    }

    .table-prop-title {
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 3px;
    }

    .table-prop-meta {
      font-size: 0.75rem;
      color: #94A3B8;
    }

    .plan-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .plan-pill.gold {
      background: rgba(212, 175, 55, 0.2);
      color: #E2C044;
    }

    .plan-pill.platinum {
      background: rgba(59, 130, 246, 0.2);
      color: #60A5FA;
    }

    .status-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .status-pill.confirmed, .status-pill.paid, .status-pill.approved {
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
    }

    .status-pill.pending {
      background: rgba(245, 158, 11, 0.2);
      color: #FBBF24;
    }

    .status-pill.cancelled, .status-pill.rejected {
      background: rgba(239, 68, 68, 0.2);
      color: #F87171;
    }

    /* Rewards Section */
    .rewards-banner {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 28px;
    }

    .rewards-hero {
      display: flex;
      gap: 20px;
    }

    .rewards-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: rgba(212, 175, 55, 0.15);
      color: #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rewards-hero h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 8px 0;
    }

    .rewards-hero p {
      font-size: 0.9rem;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0;
    }

    .points-card {
      background: #141F36;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 12px;
      padding: 20px;
    }

    .points-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #94A3B8;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .pts-badge {
      color: #E2C044;
    }

    .points-value {
      font-size: 2.2rem;
      font-weight: 900;
      color: #E2C044;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .pts-unit {
      font-size: 0.9rem;
      font-weight: 600;
      color: #94A3B8;
    }

    .points-cash {
      font-size: 0.85rem;
      color: #CBD5E1;
      margin-bottom: 16px;
    }

    .milestone-progress {
      margin-bottom: 16px;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94A3B8;
      margin-bottom: 6px;
    }

    .progress-bar-bg {
      background: #1E293B;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      background: linear-gradient(90deg, #D4AF37, #10B981);
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .btn-claim-reward {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0A1118;
      border: none;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-claim-reward:disabled {
      background: #1E293B;
      color: #64748B;
      cursor: not-allowed;
    }

    .btn-claim-reward:not(:disabled):hover {
      background: linear-gradient(135deg, #E2C044 0%, #B88E10 100%);
      transform: translateY(-1px);
    }

    .claim-active-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #FBBF24;
      background: rgba(245, 158, 11, 0.1);
      padding: 8px 10px;
      border-radius: 6px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #F59E0B;
      animation: pulse 1.5s infinite;
    }

    .rules-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .rule-card {
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 12px;
      padding: 20px;
    }

    .rule-card.highlight {
      border-color: rgba(212, 175, 55, 0.4);
      background: #141F36;
    }

    .rule-pts {
      font-size: 1.25rem;
      font-weight: 800;
      color: #38BDF8;
      margin-bottom: 6px;
    }

    .rule-pts.gold { color: #E2C044; }
    .rule-pts.green { color: #34D399; }

    .rule-card h4 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #FFFFFF;
    }

    .rule-card p {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 0;
      line-height: 1.45;
    }

    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-dialog {
      background: #0F172A;
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }

    .plan-unlock-dialog {
      max-width: 780px;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #1E293B;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .modal-header h3 {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 0 4px 0;
    }

    .modal-header p {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #94A3B8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-body {
      padding: 20px;
    }

    /* Plan Choice Cards in Unlock Modal */
    .plan-selection-boxes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .plan-choice-card {
      background: #141F36;
      border: 2px solid #334155;
      border-radius: 14px;
      padding: 22px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: all 0.25s;
    }

    .plan-choice-card:hover {
      transform: translateY(-2px);
    }

    .plan-choice-card.selected {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.08);
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
    }

    .plan-choice-card.premium-choice.selected {
      border-color: #3B82F6;
      background: rgba(59, 130, 246, 0.08);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
    }

    .choice-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .choice-price {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }

    .choice-price .cur {
      font-size: 1rem;
      font-weight: 700;
      color: #E2C044;
    }

    .choice-price .val {
      font-size: 1.8rem;
      font-weight: 900;
      color: #FFFFFF;
    }

    .choice-price .per {
      font-size: 0.78rem;
      color: #94A3B8;
    }

    .choice-desc {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 0 0 16px 0;
      line-height: 1.45;
    }

    .choice-perks {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.82rem;
      color: #CBD5E1;
      flex: 1;
    }

    .btn-select-tier {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .gold-tier-btn {
      background: #D4AF37;
      color: #0A1118;
    }

    .gold-tier-btn:hover {
      background: #E2C044;
    }

    .platinum-tier-btn {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .platinum-tier-btn:hover {
      background: #2563EB;
    }

    .modal-prop-preview {
      display: flex;
      gap: 16px;
      background: #141F36;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 20px;
      align-items: center;
    }

    .preview-img {
      width: 90px;
      height: 70px;
      border-radius: 6px;
      object-fit: cover;
    }

    .preview-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0 0 4px 0;
    }

    .preview-loc {
      font-size: 0.8rem;
      color: #94A3B8;
      margin-bottom: 4px;
    }

    .preview-price {
      font-size: 1.05rem;
      font-weight: 800;
      color: #E2C044;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #CBD5E1;
      margin-bottom: 6px;
    }

    .req { color: #EF4444; }

    .form-input, .form-textarea {
      width: 100%;
      background: #141F36;
      border: 1px solid #334155;
      color: #FFFFFF;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 0.88rem;
      box-sizing: border-box;
    }

    .form-input.disabled {
      background: #1E293B;
      color: #94A3B8;
      cursor: not-allowed;
    }

    .plan-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .plan-option-card {
      background: #141F36;
      border: 2px solid #334155;
      border-radius: 10px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .plan-option-card.selected {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.08);
    }

    .plan-option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .plan-badge {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .plan-badge.gold { background: #D4AF37; color: #0A1118; }
    .plan-badge.platinum { background: #3B82F6; color: #FFFFFF; }

    .plan-option-perks {
      font-size: 0.75rem;
      color: #94A3B8;
      line-height: 1.45;
    }

    .claim-info-box {
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 18px;
    }

    .info-label {
      font-size: 0.75rem;
      color: #94A3B8;
      margin-bottom: 2px;
    }

    .info-val {
      font-size: 1.05rem;
      color: #E2C044;
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #1E293B;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn-cancel {
      padding: 9px 16px;
      background: transparent;
      border: 1px solid #334155;
      color: #94A3B8;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-confirm-book {
      padding: 9px 20px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-confirm-book:disabled, .btn-cancel:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .uppercase { text-transform: uppercase; }

    /* Empty state */
    .empty-state {
      padding: 48px 24px;
      text-align: center;
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 16px;
    }

    .empty-icon {
      color: #64748B;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: #94A3B8;
      font-size: 0.9rem;
      margin: 0 0 20px 0;
    }

    .empty-cta {
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0A1118;
      display: inline-block;
    }

    .loading-state {
      padding: 60px;
      text-align: center;
      color: #94A3B8;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(212, 175, 55, 0.2);
      border-top-color: #D4AF37;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 900px) {
      .two-col-grid {
        grid-template-columns: 1fr;
      }
      .rules-grid {
        grid-template-columns: 1fr;
      }
      .rewards-banner {
        grid-template-columns: 1fr;
      }
      .plan-selection-boxes {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
      }
      .header-actions {
        flex-direction: column;
      }
      .primary-cta, .buy-cta, .logout-btn {
        width: 100%;
        justify-content: center;
      }
      .form-row, .plan-options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DealerDashboardComponent implements OnInit {
  activeTab = signal<'overview' | 'buy' | 'my-bookings' | 'sell' | 'rewards'>('overview');
  dealer = signal<DealerAccount | null>(null);
  myProperties = signal<Property[]>([]);
  myBookings = signal<DealerBooking[]>([]);
  marketplaceProperties = signal<any[]>([]);
  filteredMarketplace = signal<any[]>([]);
  selectedCategory = signal<string>('all');
  selectedPlanFilter = signal<string>('all');
  searchQuery = signal<string>('');
  isLoadingMarketplace = signal<boolean>(false);
  successBanner = signal<string | null>(null);

  // Dealer Active Plan signal (e.g. null = locked, 'gold' = gold unlocked, 'platinum' = premium unlocked)
  dealerActivePlan = signal<'gold' | 'platinum' | null>(null);

  // Plan Unlock Modal
  planUnlockModalOpen = signal<boolean>(false);
  selectedUnlockTier = signal<'gold' | 'platinum'>('gold');

  // Rewards signal
  rewardsSummary = signal<DealerRewardSummary>({
    totalEarned: 0,
    availablePoints: 0,
    activeClaim: null,
    history: []
  });

  // Booking Modal
  bookingModalOpen = signal<boolean>(false);
  selectedPropForBooking = signal<any | null>(null);
  bookingForm = {
    planType: 'PREMIUM' as 'GOLD' | 'PREMIUM',
    amount: 50000,
    notes: ''
  };
  isSubmittingBooking = signal<boolean>(false);

  // Claim Modal
  claimModalOpen = signal<boolean>(false);
  claimForm = {
    bankName: '',
    accountNo: '',
    ifsc: '',
    holderName: '',
    upiId: ''
  };
  isSubmittingClaim = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    public propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const current = this.authService.currentDealer();
    if (!current) {
      this.router.navigate(['/dealer/login']);
      return;
    }
    this.dealer.set(current);
    this.claimForm.holderName = current.fullName || current.businessName || '';

    // Load active plan from localStorage (if already unlocked in this session)
    const savedPlan = localStorage.getItem('dealer_active_plan');
    if (savedPlan === 'gold' || savedPlan === 'platinum') {
      this.dealerActivePlan.set(savedPlan);
    } else {
      this.dealerActivePlan.set(null);
    }

    this.loadProperties(current.id);
    this.loadDealerBookings(current.email, current.id);
    this.loadMarketplaceProperties();
    this.loadRewardsSummary(current.email);
  }

  isPropUnlocked(prop: any): boolean {
    const plan = this.dealerActivePlan();
    if (!plan) return false;
    if (plan === 'platinum') return true; // Platinum unlocks everything
    if (plan === 'gold') {
      return (prop.planType || '').toUpperCase().includes('GOLD');
    }
    return false;
  }

  openPlanUnlockModal(tier: 'gold' | 'platinum'): void {
    this.selectedUnlockTier.set(tier);
    this.planUnlockModalOpen.set(true);
  }

  closePlanUnlockModal(): void {
    this.planUnlockModalOpen.set(false);
  }

  activatePlan(tier: 'gold' | 'platinum'): void {
    this.dealerActivePlan.set(tier);
    localStorage.setItem('dealer_active_plan', tier);
    this.closePlanUnlockModal();
    const planName = tier === 'gold' ? this.propertyService.goldPlan().name : this.propertyService.platinumPlan().name;
    this.successBanner.set(`🎉 ${planName} Unlocked Successfully! Property titles, valuation, addresses, and contacts are now revealed.`);
  }

  relockForDemo(): void {
    this.dealerActivePlan.set(null);
    localStorage.removeItem('dealer_active_plan');
    this.successBanner.set('🔒 Buying access relocked for demonstration.');
  }

  switchTab(tab: 'overview' | 'buy' | 'my-bookings' | 'sell' | 'rewards'): void {
    this.activeTab.set(tab);
    if (tab === 'buy' && this.marketplaceProperties().length === 0) {
      this.loadMarketplaceProperties();
    }
    if (tab === 'rewards' && this.dealer()) {
      this.loadRewardsSummary(this.dealer()!.email);
    }
    if (tab === 'my-bookings' && this.dealer()) {
      this.loadDealerBookings(this.dealer()!.email, this.dealer()!.id);
    }
  }

  loadProperties(ownerId: string): void {
    const props = this.propertyService.getPropertiesByOwner(ownerId);
    this.myProperties.set(props);
  }

  async loadDealerBookings(email?: string, dealerId?: string): Promise<void> {
    try {
      const q = email ? `email=${encodeURIComponent(email)}` : `dealerId=${encodeURIComponent(dealerId || '')}`;
      const res = await fetch(`${getApiBaseUrl()}/properties/bookings/my?${q}`);
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) {
          this.myBookings.set(data.bookings);
        }
      }
    } catch (err) {
      console.warn('Failed to load dealer bookings from backend:', err);
    }
  }

  async loadMarketplaceProperties(): Promise<void> {
    this.isLoadingMarketplace.set(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/properties/public`);
      if (res.ok) {
        const data = await res.json();
        const rawProps = data.properties || [];
        const formatted = rawProps.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: (p.category || 'all-residential').toLowerCase().replace(/\s+/g, '-'),
          location: p.location,
          city: p.city,
          price: p.price,
          priceDisplay: p.priceDisplay || `₹${(p.price || 0).toLocaleString('en-IN')}`,
          planType: (p.planType || 'PLATINUM').toUpperCase(),
          sellerName: p.sellerName || p.seller?.name || 'Verified Principal / Developer',
          sellerPhone: p.sellerPhone || p.seller?.mobile || '+91 98450 00000',
          imageUrl: p.images && p.images[0]?.imageUrl ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        }));
        this.marketplaceProperties.set(formatted);
        this.applyFilters();
      }
    } catch (err) {
      console.warn('Failed to fetch public marketplace properties:', err);
    } finally {
      this.isLoadingMarketplace.set(false);
    }
  }

  async loadRewardsSummary(email: string): Promise<void> {
    if (!email) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/rewards/dealer-summary?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        this.rewardsSummary.set({
          totalEarned: data.totalEarned || 0,
          availablePoints: data.availablePoints || 0,
          activeClaim: data.activeClaim || null,
          history: data.history || []
        });
      }
    } catch (err) {
      console.warn('Failed to fetch dealer rewards summary:', err);
    }
  }

  onCategoryChange(cat: string): void {
    this.selectedCategory.set(cat);
    this.applyFilters();
  }

  onPlanFilterChange(plan: string): void {
    this.selectedPlanFilter.set(plan);
    this.applyFilters();
  }

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.selectedPlanFilter.set('all');
    this.searchQuery.set('');
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.marketplaceProperties();
    const cat = this.selectedCategory();
    const plan = this.selectedPlanFilter();
    const q = this.searchQuery().trim().toLowerCase();

    if (cat !== 'all') {
      list = list.filter(p => p.category.includes(cat) || cat.includes(p.category));
    }

    if (plan === 'gold') {
      list = list.filter(p => (p.planType || '').includes('GOLD'));
    } else if (plan === 'platinum') {
      list = list.filter(p => !(p.planType || '').includes('GOLD'));
    }

    if (q) {
      list = list.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
      );
    }

    this.filteredMarketplace.set(list);
  }

  getProgressPercent(): number {
    const pts = this.rewardsSummary().availablePoints;
    return Math.min(100, Math.round(((pts % 1000) / 1000) * 100));
  }

  openBookingModal(prop: any): void {
    this.selectedPropForBooking.set(prop);
    this.bookingForm.planType = (prop.planType || '').includes('GOLD') ? 'GOLD' : 'PREMIUM';
    this.bookingForm.amount = 50000;
    this.bookingForm.notes = '';
    this.bookingModalOpen.set(true);
  }

  closeBookingModal(): void {
    this.bookingModalOpen.set(false);
    this.selectedPropForBooking.set(null);
  }

  async submitPropertyBooking(): Promise<void> {
    const prop = this.selectedPropForBooking();
    const curDealer = this.dealer();
    if (!prop || !curDealer) return;

    this.isSubmittingBooking.set(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/properties/${prop.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookerRole: 'DEALER',
          planType: this.bookingForm.planType,
          dealerId: curDealer.id,
          dealerName: curDealer.businessName || curDealer.fullName || 'Dealer Partner',
          dealerCompany: curDealer.businessName || 'Verified Brokerage',
          dealerEmail: curDealer.email,
          dealerPhone: curDealer.mobile || curDealer.phone || '',
          bookingAmount: this.bookingForm.amount,
          notes: this.bookingForm.notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.closeBookingModal();
        this.successBanner.set(data.message || 'Property booked successfully! +500 Dealer Reward Points added to your account.');
        // Refresh bookings and rewards
        await this.loadDealerBookings(curDealer.email, curDealer.id);
        await this.loadRewardsSummary(curDealer.email);
        this.activeTab.set('my-bookings');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to book property');
      }
    } catch (err: any) {
      alert('Network error booking property: ' + (err.message || ''));
    } finally {
      this.isSubmittingBooking.set(false);
    }
  }

  openClaimModal(): void {
    this.claimModalOpen.set(true);
  }

  closeClaimModal(): void {
    this.claimModalOpen.set(false);
  }

  async submitPayoutClaim(): Promise<void> {
    const curDealer = this.dealer();
    if (!curDealer) return;

    if (!this.claimForm.bankName || !this.claimForm.accountNo || !this.claimForm.ifsc || !this.claimForm.holderName) {
      alert('Please fill all mandatory bank details (Bank Name, Account Number, IFSC, Account Holder Name).');
      return;
    }

    this.isSubmittingClaim.set(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: this.claimForm.holderName,
          userEmail: curDealer.email,
          userRole: 'DEALER',
          mobile: curDealer.mobile || curDealer.phone || '',
          points: 1000,
          bankName: this.claimForm.bankName,
          accountNo: this.claimForm.accountNo,
          ifsc: this.claimForm.ifsc,
          holderName: this.claimForm.holderName,
          upiId: this.claimForm.upiId
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.closeClaimModal();
        this.successBanner.set(data.message || 'Reward claim submitted successfully! Admin will disburse ₹1,000 to your bank account.');
        await this.loadRewardsSummary(curDealer.email);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit claim');
      }
    } catch (err: any) {
      alert('Network error submitting claim: ' + (err.message || ''));
    } finally {
      this.isSubmittingClaim.set(false);
    }
  }

  onImgError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  }

  logout(): void {
    this.authService.logoutDealer();
    this.router.navigate(['/']);
  }
}

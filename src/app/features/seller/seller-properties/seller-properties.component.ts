import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

export interface SellerPropertyItem {
  property_id: string;
  title: string;
  category: string;
  price: string;
  property_size: string;
  location: string;
  city: string;
  plan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approval_status?: string;
  created_at: string;
  image_urls?: string[];
  images?: any[];
  category_specs?: Record<string, any>;
}

@Component({
  selector: 'app-seller-properties',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="seller-props-page">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="container top-bar-inner">
          <div class="brand-line">
            <span class="seller-pill">
              <span class="dot"></span>
              SELLER PROPERTIES
            </span>
            <span class="seller-greeting">Account: <strong>{{ sellerName() }}</strong></span>
          </div>

          <div class="top-cta-group">
            <button (click)="loadProperties()" class="btn-refresh" title="Refresh Listings" [disabled]="loading()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>{{ loading() ? 'Syncing...' : 'Refresh' }}</span>
            </button>
            <a routerLink="/seller/categories" class="btn-post-new">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Post New Property</span>
            </a>
            <button (click)="logout()" class="btn-logout" title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container main-content">
        <!-- Page Title & Filter Row -->
        <div class="page-heading-row">
          <div>
            <h1>My Submitted Properties</h1>
            <p class="heading-sub">Track real-time review status, verification updates, and Platinum listings.</p>
          </div>

          <!-- Status Filters -->
          <div class="status-filters">
            <button
              type="button"
              class="filter-pill"
              [class.active]="selectedFilter() === 'ALL'"
              (click)="setFilter('ALL')"
            >
              All ({{ properties().length }})
            </button>
            <button
              type="button"
              class="filter-pill amber"
              [class.active]="selectedFilter() === 'PENDING'"
              (click)="setFilter('PENDING')"
            >
              Pending ({{ countStatus('PENDING') }})
            </button>
            <button
              type="button"
              class="filter-pill green"
              [class.active]="selectedFilter() === 'APPROVED'"
              (click)="setFilter('APPROVED')"
            >
              Approved ({{ countStatus('APPROVED') }})
            </button>
            <button
              type="button"
              class="filter-pill red"
              [class.active]="selectedFilter() === 'REJECTED'"
              (click)="setFilter('REJECTED')"
            >
              Rejected ({{ countStatus('REJECTED') }})
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="loading-box">
          <div class="spinner"></div>
          <p>Loading your properties from database...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && filteredProperties().length === 0" class="empty-state-box">
          <div class="empty-icon">📁</div>
          <h2>No properties found</h2>
          <p *ngIf="properties().length === 0">
            You have not submitted any properties yet. Choose a category to submit your first Platinum property listing.
          </p>
          <p *ngIf="properties().length > 0">
            No properties found matching status "{{ selectedFilter() }}".
          </p>
          <a routerLink="/seller/categories" class="btn-cta-empty">
            + Choose Category & Submit Property
          </a>
        </div>

        <!-- Properties List -->
        <div *ngIf="!loading() && filteredProperties().length > 0" class="properties-list">
          <div *ngFor="let prop of filteredProperties()" class="prop-card">
            <!-- Property Thumbnail -->
            <div class="prop-img-box">
              <img
                [src]="getThumbnail(prop)"
                [alt]="prop.title"
                class="prop-img"
              />
              <span class="plan-pill">PLATINUM</span>
            </div>

            <!-- Property Details -->
            <div class="prop-info-box">
              <div class="meta-top">
                <span class="cat-tag">{{ formatCategory(prop.category) }}</span>
                <span class="dot">•</span>
                <span class="submitted-date">Submitted: {{ formatDate(prop.created_at) }}</span>
              </div>

              <h3 class="prop-title">{{ prop.title }}</h3>

              <div class="location-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ prop.location }}{{ prop.city ? ', ' + prop.city : '' }}</span>
              </div>

              <div class="specs-chips">
                <span class="spec-chip" *ngIf="prop.property_size">{{ prop.property_size }}</span>
                <ng-container *ngIf="prop.category_specs as specs">
                  <span class="spec-chip" *ngIf="specs['bedrooms']">{{ specs['bedrooms'] }}</span>
                  <span class="spec-chip" *ngIf="specs['dimensions']">{{ specs['dimensions'] }}</span>
                  <span class="spec-chip" *ngIf="specs['approvalAuthority']">{{ specs['approvalAuthority'] }}</span>
                  <span class="spec-chip" *ngIf="specs['suitableFor']">{{ specs['suitableFor'] }}</span>
                </ng-container>
              </div>
            </div>

            <!-- Price & Status Area -->
            <div class="prop-status-box">
              <div class="price-display">{{ prop.price }}</div>

              <!-- Status Badge -->
              <div class="status-badge" [ngClass]="getStatusClass(prop.status)">
                <span class="status-bullet"></span>
                <span class="status-text">{{ getStatusLabel(prop.status) }}</span>
              </div>

              <!-- Status Helper Explanation -->
              <div class="status-explanation">
                <span *ngIf="prop.status === 'PENDING'" class="hint-amber">
                  ⏳ Waiting for Admin review. Hidden from public website.
                </span>
                <span *ngIf="prop.status === 'APPROVED'" class="hint-green">
                  ✓ Verified & Live under Platinum {{ formatCategory(prop.category) }}.
                </span>
                <span *ngIf="prop.status === 'REJECTED'" class="hint-red">
                  ✕ Application rejected by Admin. Hidden from public.
                </span>
              </div>

              <!-- View Live Link (Only if Approved) -->
              <a
                *ngIf="prop.status === 'APPROVED'"
                [routerLink]="['/category', prop.category]"
                class="btn-view-live"
                target="_blank"
              >
                View Live on Website →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-props-page {
      min-height: 85vh;
      background: #0B1118;
      color: #F8FAFC;
      padding-bottom: 4rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Top Bar */
    .top-bar {
      background: #111A24;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.85rem 0;
    }

    .top-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .brand-line {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .seller-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #D4AF37;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #D4AF37;
    }

    .seller-greeting {
      font-size: 0.86rem;
      color: #94A3B8;
    }

    .seller-greeting strong {
      color: #F8FAFC;
    }

    .top-cta-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #94A3B8;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-refresh:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }

    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-post-new {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #0B1118;
      font-size: 0.82rem;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-post-new:hover {
      box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
      transform: translateY(-1px);
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #EF4444;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.15);
    }

    /* Main Content */
    .main-content {
      padding-top: 2.5rem;
    }

    .page-heading-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .page-heading-row h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 0.35rem;
    }

    .heading-sub {
      font-size: 0.92rem;
      color: #94A3B8;
      margin: 0;
    }

    /* Filters */
    .status-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-pill {
      background: #131E2A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94A3B8;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-pill:hover {
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .filter-pill.active {
      background: #FFFFFF;
      color: #0B1118;
      border-color: #FFFFFF;
      font-weight: 700;
    }

    .filter-pill.amber.active {
      background: #F59E0B;
      color: #0B1118;
      border-color: #F59E0B;
    }

    .filter-pill.green.active {
      background: #10B981;
      color: #0B1118;
      border-color: #10B981;
    }

    .filter-pill.red.active {
      background: #EF4444;
      color: #FFFFFF;
      border-color: #EF4444;
    }

    /* Loading */
    .loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      color: #94A3B8;
      gap: 1rem;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(212, 175, 55, 0.2);
      border-top-color: #D4AF37;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty State */
    .empty-state-box {
      background: #131E2A;
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 3.5rem 2rem;
      text-align: center;
      max-width: 600px;
      margin: 2rem auto;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.75rem;
    }

    .empty-state-box h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.5rem;
    }

    .empty-state-box p {
      font-size: 0.9rem;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0 0 1.5rem;
    }

    .btn-cta-empty {
      display: inline-flex;
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #0B1118;
      font-size: 0.9rem;
      font-weight: 800;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      text-decoration: none;
    }

    /* Property Cards */
    .properties-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .prop-card {
      background: #131E2A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: 180px 1fr 240px;
      gap: 1.5rem;
      align-items: center;
      transition: border-color 0.2s;
    }

    .prop-card:hover {
      border-color: rgba(212, 175, 55, 0.3);
    }

    /* Thumbnail */
    .prop-img-box {
      position: relative;
      height: 125px;
      border-radius: 10px;
      overflow: hidden;
      background: #0B1118;
    }

    .prop-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .plan-pill {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(14, 165, 233, 0.9);
      color: #FFFFFF;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    /* Info */
    .meta-top {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 0.35rem;
    }

    .cat-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: #D4AF37;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .submitted-date {
      font-size: 0.75rem;
      color: #64748B;
    }

    .prop-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.35rem;
    }

    .location-line {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.82rem;
      color: #94A3B8;
      margin-bottom: 0.6rem;
    }

    .specs-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .spec-chip {
      background: #0B1118;
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.72rem;
      color: #CBD5E1;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Price & Status */
    .prop-status-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
      gap: 6px;
      padding-left: 1rem;
      border-left: 1px solid rgba(255, 255, 255, 0.06);
    }

    .price-display {
      font-size: 1.25rem;
      font-weight: 800;
      color: #D4AF37;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .status-bullet {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .status-badge.pending {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #FCD34D;
    }
    .status-badge.pending .status-bullet { background: #F59E0B; box-shadow: 0 0 6px #F59E0B; }

    .status-badge.approved {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #6EE7B7;
    }
    .status-badge.approved .status-bullet { background: #10B981; box-shadow: 0 0 6px #10B981; }

    .status-badge.rejected {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #FCA5A5;
    }
    .status-badge.rejected .status-bullet { background: #EF4444; }

    .status-explanation {
      font-size: 0.72rem;
      line-height: 1.35;
      max-width: 220px;
      margin-top: 2px;
    }

    .hint-amber { color: #FCD34D; }
    .hint-green { color: #6EE7B7; }
    .hint-red { color: #FCA5A5; }

    .btn-view-live {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #38BDF8;
      font-size: 0.76rem;
      font-weight: 700;
      text-decoration: none;
      margin-top: 4px;
    }

    .btn-view-live:hover {
      text-decoration: underline;
    }

    @media (max-width: 900px) {
      .prop-card {
        grid-template-columns: 1fr;
        text-align: left;
      }
      .prop-status-box {
        align-items: flex-start;
        text-align: left;
        padding-left: 0;
        border-left: none;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 1rem;
      }
      .page-heading-row {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class SellerPropertiesComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  properties = signal<SellerPropertyItem[]>([]);
  loading = signal(true);
  selectedFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  sellerName = signal('Seller');

  filteredProperties = computed(() => {
    const list = this.properties();
    const filter = this.selectedFilter();
    if (filter === 'ALL') return list;
    return list.filter(p => (p.status || 'PENDING').toUpperCase() === filter);
  });

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const seller = this.authService.currentSeller();
    if (seller?.fullName) {
      this.sellerName.set(seller.fullName);
    }

    this.loadProperties();
  }

  async loadProperties(): Promise<void> {
    this.loading.set(true);
    const seller = this.authService.currentSeller();
    const sellerId = (seller as any)?.seller_id || seller?.id || '';
    const sellerEmail = seller?.email || '';
    const sellerPhone = seller?.mobile || '';

    // 1. Immediate load from local storage
    let localList: any[] = [];
    try {
      const stored = localStorage.getItem('aura_seller_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        localList = sellerId
          ? parsed.filter((p: any) => p.seller_id === sellerId || p.seller_email === sellerEmail || !p.seller_id)
          : parsed;
        this.properties.set(localList);
      }
    } catch {
      localList = [];
    }

    // 2. Fetch live status from backend PostgreSQL
    try {
      const query = new URLSearchParams();
      if (sellerId) query.set('sellerId', sellerId);
      if (sellerEmail) query.set('email', sellerEmail);
      if (sellerPhone) query.set('phone', sellerPhone);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${getApiBaseUrl()}/properties/seller/listings${qs}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.properties)) {
          const apiList = data.properties;

          // Merge: update status of properties matching backend
          const combinedMap = new Map<string, any>();

          // Ground truth from backend (Admin approved/pending/rejected)
          for (const ap of apiList) {
            const key = ap.id || ap.property_id || ap.title;
            combinedMap.set(key, ap);
          }

          // Local properties not yet in backend
          for (const lp of localList) {
            const key = lp.id || lp.property_id || lp.title;
            if (!combinedMap.has(key)) {
              combinedMap.set(key, lp);
            } else {
              const existing = combinedMap.get(key);
              combinedMap.set(key, { ...lp, ...existing });
            }
          }

          const merged = Array.from(combinedMap.values());
          this.properties.set(merged);

          // Update local cache safely
          try {
            const cacheable = merged.map(m => ({
              ...m,
              image_urls: m.image_urls ? m.image_urls.slice(0, 1) : []
            }));
            localStorage.setItem('aura_seller_properties', JSON.stringify(cacheable));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Backend sync error:', err);
    } finally {
      this.loading.set(false);
    }
  }

  countStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): number {
    return this.properties().filter(p => (p.status || 'PENDING').toUpperCase() === status).length;
  }

  setFilter(filter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    this.selectedFilter.set(filter);
  }

  getStatusClass(status: string): string {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'APPROVED') return 'approved';
    if (s === 'REJECTED') return 'rejected';
    return 'pending';
  }

  getStatusLabel(status: string): string {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'APPROVED') return 'APPROVED';
    if (s === 'REJECTED') return 'REJECTED';
    return 'PENDING APPROVAL';
  }

  getThumbnail(prop: SellerPropertyItem): string {
    if (prop.image_urls && prop.image_urls.length > 0) {
      return prop.image_urls[0];
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';
  }

  formatCategory(slug: string): string {
    if (!slug) return 'Real Estate';
    const map: Record<string, string> = {
      'plots': 'Plot / Land',
      'plots-land': 'Plot / Land',
      'villas': 'Villa & Estates',
      'villas-estates': 'Villa & Estates',
      'apartments': 'Apartment / Flats',
      'independent-houses': 'Independent House',
      'commercial': 'Commercial Space',
      'commercial-spaces': 'Commercial Space',
      'farm-lands': 'Farm Land'
    };
    return map[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatDate(isoString: string): string {
    if (!isoString) return 'Recently';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  }

  logout(): void {
    this.authService.logoutSeller();
    this.router.navigate(['/seller/login']);
  }
}

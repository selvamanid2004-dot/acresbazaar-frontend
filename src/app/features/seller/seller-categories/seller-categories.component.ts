import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface Category {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: string;
  display_order: number;
}

@Component({
  selector: 'app-seller-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="seller-category-page">
      <!-- Top Seller Header -->
      <div class="seller-top-bar">
        <div class="container top-bar-inner">
          <div class="brand-badge-wrap">
            <span class="seller-badge">
              <span class="pulse-dot"></span>
              SELLER PORTAL
            </span>
            <span class="welcome-text">
              Welcome, <strong>{{ sellerName() }}</strong>
            </span>
          </div>

          <div class="top-actions">
            <a routerLink="/seller/properties" class="btn-top-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>My Submitted Properties</span>
            </a>
            <button (click)="logout()" class="btn-logout-clean" title="Logout">
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

      <!-- Main Category Selection View -->
      <div class="container main-content">
        <div class="category-hero">
          <div class="platinum-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            DIRECT PLATINUM LISTING PIPELINE
          </div>
          <h1>Choose Property Category</h1>
          <p class="hero-desc">
            Select the category of property you want to sell. Your submission form will dynamically adapt with category-specific specifications.
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="loading-state">
          <div class="spinner"></div>
          <p>Loading real-time property categories...</p>
        </div>

        <!-- Categories Grid (Dynamic from Database) -->
        <div *ngIf="!loading()" class="categories-grid">
          <div
            *ngFor="let cat of categories()"
            class="category-card"
            (click)="selectCategory(cat)"
          >
            <div class="card-icon-header">
              <div class="icon-circle">
                <span class="category-emoji">{{ getCategoryIcon(cat.slug) }}</span>
              </div>
              <span class="platinum-tag">PLATINUM</span>
            </div>

            <div class="card-body">
              <h2 class="category-title">{{ cat.name }}</h2>
              <p class="category-description">
                {{ cat.description || getFallbackDescription(cat.slug) }}
              </p>
            </div>

            <div class="card-footer">
              <span class="btn-select">
                Post {{ cat.name }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Help Note -->
        <div class="help-callout">
          <div class="help-icon">💡</div>
          <div class="help-text">
            <strong>What happens after you submit?</strong>
            <p>Every seller property is assigned <strong>status = PENDING</strong> and routed directly to the Executive Admin Panel for title & documentation review. Once approved, your listing goes live immediately under Platinum Plan search.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-category-page {
      min-height: 85vh;
      background: #0B1118;
      color: #F8FAFC;
      padding-bottom: 4rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Top Bar */
    .seller-top-bar {
      background: #111A24;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.9rem 0;
    }

    .top-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .brand-badge-wrap {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .seller-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #D4AF37;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #D4AF37;
      box-shadow: 0 0 6px #D4AF37;
    }

    .welcome-text {
      font-size: 0.88rem;
      color: #94A3B8;
    }

    .welcome-text strong {
      color: #F8FAFC;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-top-secondary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #F8FAFC;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-top-secondary:hover {
      background: rgba(212, 175, 55, 0.15);
      border-color: rgba(212, 175, 55, 0.4);
      color: #D4AF37;
    }

    .btn-logout-clean {
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

    .btn-logout-clean:hover {
      background: rgba(239, 68, 68, 0.15);
    }

    /* Main Content */
    .main-content {
      padding-top: 3rem;
    }

    .category-hero {
      text-align: center;
      max-width: 760px;
      margin: 0 auto 3rem;
    }

    .platinum-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      color: #38BDF8;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 1rem;
    }

    .category-hero h1 {
      font-size: 2.3rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 0.75rem;
      letter-spacing: -0.02em;
    }

    .hero-desc {
      font-size: 1.05rem;
      color: #94A3B8;
      line-height: 1.6;
      margin: 0;
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      color: #94A3B8;
      gap: 1rem;
    }

    .spinner {
      width: 38px;
      height: 38px;
      border: 3px solid rgba(212, 175, 55, 0.2);
      border-top-color: #D4AF37;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .category-card {
      background: #131E2A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .category-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #D4AF37, #F59E0B);
      opacity: 0;
      transition: opacity 0.25s;
    }

    .category-card:hover {
      transform: translateY(-4px);
      background: #182635;
      border-color: rgba(212, 175, 55, 0.4);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
    }

    .category-card:hover::before {
      opacity: 1;
    }

    .card-icon-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }

    .platinum-tag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #38BDF8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .category-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.5rem;
    }

    .category-description {
      font-size: 0.88rem;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0;
      min-height: 42px;
    }

    .card-footer {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #D4AF37;
      font-size: 0.88rem;
      font-weight: 700;
      transition: gap 0.2s;
    }

    .category-card:hover .btn-select {
      color: #F59E0B;
    }

    /* Help Callout */
    .help-callout {
      background: rgba(212, 175, 55, 0.06);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      max-width: 800px;
      margin: 0 auto;
    }

    .help-icon {
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .help-text strong {
      display: block;
      color: #F8FAFC;
      font-size: 0.95rem;
      margin-bottom: 0.35rem;
    }

    .help-text p {
      color: #94A3B8;
      font-size: 0.86rem;
      line-height: 1.5;
      margin: 0;
    }

    .help-text strong span {
      color: #D4AF37;
    }

    @media (max-width: 768px) {
      .category-hero h1 { font-size: 1.8rem; }
      .categories-grid { grid-template-columns: 1fr; }
      .top-bar-inner { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class SellerCategoriesComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  loading = signal(true);
  sellerName = signal('Seller');

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const seller = this.authService.currentSeller();
    if (seller?.fullName) {
      this.sellerName.set(seller.fullName);
    }

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.loadFallbackCategories();
    this.loading.set(false);
  }

  loadFallbackCategories(): void {
    this.categories.set([
      { category_id: 'cat_plots', name: 'Plots / Land', slug: 'plots-land', description: 'Residential layouts, gated communities, corner sites, and agricultural land parcels.', image: '', status: 'ACTIVE', display_order: 1 },
      { category_id: 'cat_villas', name: 'Villas & Estates', slug: 'villas-estates', description: 'Independent luxury villas, duplex homes, row houses, and private residences.', image: '', status: 'ACTIVE', display_order: 2 },
      { category_id: 'cat_apts', name: 'Apartments / Flats', slug: 'apartments', description: 'High-rise apartments, penthouses, gated societies, and modern studio flats.', image: '', status: 'ACTIVE', display_order: 3 },
      { category_id: 'cat_houses', name: 'Independent Houses', slug: 'independent-houses', description: 'Standalone residential buildings, multi-floor builder floors, and bungalows.', image: '', status: 'ACTIVE', display_order: 4 },
      { category_id: 'cat_comm', name: 'Commercial Spaces', slug: 'commercial-spaces', description: 'Retail stores, corporate offices, showroom spaces, and commercial plots.', image: '', status: 'ACTIVE', display_order: 5 },
      { category_id: 'cat_farms', name: 'Farm Lands', slug: 'farm-lands', description: 'Managed farmland investments, organic estates, farmhouses, and plantations.', image: '', status: 'ACTIVE', display_order: 6 }
    ]);
  }

  selectCategory(cat: Category): void {
    this.router.navigate(['/seller/property/new'], {
      queryParams: {
        category: cat.slug,
        categoryId: cat.category_id,
        categoryName: cat.name
      }
    });
  }

  getCategoryIcon(slug: string): string {
    const map: Record<string, string> = {
      'plots': '📐',
      'plots-land': '📐',
      'villas': '🏰',
      'villas-estates': '🏰',
      'apartments': '🏢',
      'independent-houses': '🏡',
      'commercial': '🏬',
      'commercial-spaces': '🏬',
      'farm-lands': '🌾',
      'all-residential': '🏘️'
    };
    return map[slug] || '🏛️';
  }

  getFallbackDescription(slug: string): string {
    const map: Record<string, string> = {
      'plots-land': 'Residential layouts, gated communities, corner sites, and land parcels.',
      'villas-estates': 'Independent luxury villas, duplex residences, and private estates.',
      'apartments': 'High-rise apartments, gated societies, and luxury penthouses.',
      'independent-houses': 'Standalone family homes, multi-story buildings, and bungalows.',
      'commercial-spaces': 'Retail shops, offices, warehouse facilities, and commercial plots.',
      'farm-lands': 'Agricultural land, managed farms, and organic retreat acreage.'
    };
    return map[slug] || 'Certified real estate listings for verified Platinum buyers.';
  }

  logout(): void {
    this.authService.logoutSeller();
    this.router.navigate(['/seller/login']);
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { SellerAccount } from '../../../core/models/buyer.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- Top Banner / Greeting -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-badge">
            <span class="pulse-dot"></span>
            SELLER PORTAL ACTIVE
          </div>
          <h1>Welcome, <span class="gold-text">{{ seller()?.fullName || 'Seller' }}</span></h1>
          <p class="subtitle">Manage your luxury listings, track verification status, and publish high-yield Platinum properties.</p>
        </div>

        <div class="header-actions">
          <a routerLink="/seller/add-property" class="cta-btn primary-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Add Property
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

      <!-- Quick Stats Grid (4 Required Statistics) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon gold-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Total Properties</span>
            <span class="stat-val">{{ totalCount() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon amber-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Pending Properties</span>
            <span class="stat-val">{{ pendingCount() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Approved Properties</span>
            <span class="stat-val">{{ approvedCount() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Rejected Properties</span>
            <span class="stat-val">{{ rejectedCount() }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Navigation Tabs -->
      <div class="dashboard-nav-bar">
        <div class="nav-links">
          <a routerLink="/seller/dashboard" class="nav-tab active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard Overview
          </a>
          <a routerLink="/seller/my-properties" class="nav-tab">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            My Properties ({{ myProperties().length }})
          </a>
          <a routerLink="/seller/add-property" class="nav-tab">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Add Property
          </a>
        </div>
      </div>

      <!-- Platinum Integration Notice -->
      <div class="platinum-banner">
        <div class="platinum-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          PLATINUM PLAN EXCLUSIVE
        </div>
        <div class="platinum-text">
          <h3>All properties posted from this account automatically become Platinum Properties!</h3>
          <p>Your listings are featured in their respective category's Platinum Plan tier with verified badge, locked details protection, and direct high-intent buyer inquiries.</p>
        </div>
        <a routerLink="/seller/add-property" class="platinum-cta">Post New Platinum Property →</a>
      </div>

      <!-- My Properties Section -->
      <div class="content-section">
        <div class="section-header">
          <div>
            <h2>My Properties</h2>
            <p>All properties submitted by your seller account ({{ myProperties().length }} total)</p>
          </div>
          <a routerLink="/seller/my-properties" class="view-all-link">Manage in Full View &rarr;</a>
        </div>

        <div *ngIf="myProperties().length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h3>No properties submitted yet</h3>
          <p>List your property now to have it published in the Platinum Plan category page.</p>
          <a routerLink="/seller/add-property" class="cta-btn empty-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Add Property
          </a>
        </div>

        <div *ngIf="myProperties().length > 0" class="property-cards-grid">
          <div *ngFor="let prop of myProperties()" class="prop-card">
            <div class="prop-img-wrap">
              <img [src]="prop.imageUrl" [alt]="prop.title" class="prop-img" />
              <div class="status-tag" [ngClass]="prop.submissionStatus ? prop.submissionStatus.toLowerCase().replace(' ', '-') : 'pending'">
                {{ prop.submissionStatus || 'PENDING' }}
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
                <a [routerLink]="['/seller/my-properties']" [queryParams]="{ edit: prop.id }" class="btn-action edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Property
                </a>
                <a [routerLink]="['/category', prop.category]" class="btn-action view">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View in Platinum
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 40px 24px 80px 24px;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F8FAFC;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 32px;
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
      margin-bottom: 12px;
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
      font-size: 2.2rem;
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
      max-width: 600px;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .primary-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 13px 26px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
      transition: all 0.25s ease;
    }

    .primary-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(212, 175, 55, 0.45);
      background: linear-gradient(135deg, #E2C044 0%, #C4970E 100%);
    }

    .logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #15202B;
      color: #94A3B8;
      border: 1px solid #243447;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      color: #F87171;
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.08);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: #15202B;
      border: 1px solid #1E2D3D;
      border-radius: 16px;
      padding: 20px 22px;
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .gold-icon {
      background: rgba(212, 175, 55, 0.12);
      color: #D4AF37;
    }

    .amber-icon {
      background: rgba(245, 158, 11, 0.12);
      color: #F59E0B;
    }

    .green-icon {
      background: rgba(34, 197, 94, 0.12);
      color: #22C55E;
    }

    .blue-icon {
      background: rgba(59, 130, 246, 0.12);
      color: #3B82F6;
    }

    .stat-meta {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .stat-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: #FFFFFF;
      margin-top: 2px;
    }

    .status-active {
      font-size: 1.1rem;
      color: #22C55E;
    }

    .dashboard-nav-bar {
      border-bottom: 1px solid #1E2D3D;
      margin-bottom: 28px;
    }

    .nav-links {
      display: flex;
      gap: 10px;
      overflow-x: auto;
    }

    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      color: #94A3B8;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.92rem;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .nav-tab:hover {
      color: #CBD5E1;
    }

    .nav-tab.active {
      color: #D4AF37;
      border-bottom-color: #D4AF37;
    }

    .platinum-banner {
      background: linear-gradient(135deg, rgba(21, 32, 43, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 16px;
      padding: 24px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 36px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
      flex-wrap: wrap;
    }

    .platinum-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 6px 14px;
      border-radius: 20px;
    }

    .platinum-text {
      flex: 1;
      min-width: 260px;
    }

    .platinum-text h3 {
      font-size: 1.1rem;
      color: #FFFFFF;
      margin: 0 0 6px 0;
      font-weight: 700;
    }

    .platinum-text p {
      font-size: 0.88rem;
      color: #94A3B8;
      margin: 0;
      line-height: 1.4;
    }

    .platinum-cta {
      color: #D4AF37;
      font-weight: 700;
      font-size: 0.92rem;
      text-decoration: none;
      transition: color 0.2s;
      white-space: nowrap;
    }

    .platinum-cta:hover {
      color: #F3E5AB;
      text-decoration: underline;
    }

    .content-section {
      background: #111A24;
      border: 1px solid #1E2D3D;
      border-radius: 20px;
      padding: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .section-header h2 {
      font-size: 1.35rem;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .section-header p {
      font-size: 0.88rem;
      color: #94A3B8;
      margin: 0;
    }

    .view-all-link {
      color: #D4AF37;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    .empty-state {
      text-align: center;
      padding: 48px 20px;
      background: #15202B;
      border: 1px dashed #243447;
      border-radius: 16px;
    }

    .empty-icon {
      color: #475569;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 1.2rem;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 0.9rem;
      color: #94A3B8;
      margin: 0 0 20px 0;
    }

    .empty-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      padding: 12px 24px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .property-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .prop-card {
      background: #15202B;
      border: 1px solid #1E2D3D;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }

    .prop-card:hover {
      transform: translateY(-4px);
      border-color: rgba(212, 175, 55, 0.4);
    }

    .prop-img-wrap {
      position: relative;
      height: 200px;
      background: #0B1118;
    }

    .prop-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .status-tag.pending-verification {
      background: rgba(245, 158, 11, 0.9);
      color: #FFFFFF;
    }

    .status-tag.approved {
      background: rgba(34, 197, 94, 0.9);
      color: #FFFFFF;
    }

    .status-tag.draft {
      background: rgba(148, 163, 184, 0.9);
      color: #0B1118;
    }

    .status-tag.rejected {
      background: rgba(239, 68, 68, 0.9);
      color: #FFFFFF;
    }

    .tier-tag {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .prop-info {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .prop-category {
      font-size: 0.72rem;
      color: #D4AF37;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }

    .prop-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #FFFFFF;
      line-height: 1.35;
    }

    .prop-loc {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: #94A3B8;
      margin-bottom: 12px;
    }

    .prop-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #D4AF37;
      margin-top: auto;
      margin-bottom: 16px;
    }

    .prop-actions {
      display: flex;
      gap: 10px;
      padding-top: 14px;
      border-top: 1px solid #1E2D3D;
    }

    .btn-action {
      flex: 1;
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

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
      }
      .header-actions {
        flex-direction: column;
      }
      .primary-cta, .logout-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SellerDashboardComponent implements OnInit {
  seller = signal<SellerAccount | null>(null);
  myProperties = signal<Property[]>([]);
  totalCount = signal<number>(0);
  pendingCount = signal<number>(0);
  approvedCount = signal<number>(0);
  rejectedCount = signal<number>(0);

  constructor(
    private authService: AuthService,
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const current = this.authService.currentSeller();
    if (!current) {
      this.router.navigate(['/seller/login']);
      return;
    }
    this.seller.set(current);
    this.loadProperties(current.id);
  }

  async loadProperties(ownerId: string): Promise<void> {
    const currentSeller = this.authService.currentSeller();
    const email = currentSeller?.email || '';
    const phone = currentSeller?.mobile || '';

    // 1. Get from local store
    let props = this.propertyService.getPropertiesByOwner(ownerId);

    // Also include properties submitted locally by seller
    try {
      const stored = localStorage.getItem('aura_seller_properties');
      if (stored) {
        const localSellerProps = JSON.parse(stored);
        const filtered = localSellerProps.filter((p: any) => !p.seller_id || p.seller_id === ownerId || p.seller_email === email);
        for (const lp of filtered) {
          if (!props.some(p => p.id === (lp.id || lp.property_id))) {
            props.push({
              id: lp.id || lp.property_id,
              title: lp.title,
              price: lp.price,
              location: lp.location || `${lp.locality}, ${lp.city}`,
              type: lp.category,
              category: lp.category,
              tier: 'platinum',
              imageUrl: (lp.image_urls && lp.image_urls[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
              galleryImages: lp.image_urls || [],
              specs: lp.category_specs || {},
              description: lp.description || '',
              address: lp.full_address || lp.location,
              submissionDate: lp.created_at ? new Date(lp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
              submissionStatus: lp.status || 'PENDING',
              ownerId: lp.seller_id,
              ownerRole: 'seller'
            });
          }
        }
      }
    } catch {}

    // 2. Fetch live status from backend
    try {
      const query = new URLSearchParams();
      if (ownerId) query.set('sellerId', ownerId);
      if (email) query.set('email', email);
      if (phone) query.set('phone', phone);
      const res = await fetch(`http://localhost:5001/api/properties/seller/listings?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.properties)) {
          for (const bp of data.properties) {
            const found = props.find(p => p.id === bp.id || p.id === bp.property_id || p.title === bp.title);
            if (found) {
              found.submissionStatus = bp.status;
            } else {
              props.push({
                id: bp.id,
                title: bp.title,
                price: bp.price,
                location: bp.location,
                type: bp.category,
                category: bp.category,
                tier: bp.plan === 'GOLD' ? 'gold' : 'platinum',
                imageUrl: (bp.image_urls && bp.image_urls[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                galleryImages: bp.image_urls || [],
                specs: bp.category_specs || {},
                description: bp.description || '',
                address: bp.location,
                submissionDate: bp.created_at ? new Date(bp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
                submissionStatus: bp.status,
                ownerId: bp.seller_id,
                ownerRole: 'seller'
              });
            }
          }
        }
      }
    } catch {}

    this.myProperties.set(props);
    this.totalCount.set(props.length);
    this.pendingCount.set(props.filter(p => !p.submissionStatus || p.submissionStatus.toUpperCase() === 'PENDING' || p.submissionStatus === 'Pending Verification').length);
    this.approvedCount.set(props.filter(p => p.submissionStatus?.toUpperCase() === 'APPROVED').length);
    this.rejectedCount.set(props.filter(p => p.submissionStatus?.toUpperCase() === 'REJECTED').length);
  }

  logout(): void {
    this.authService.logoutSeller();
    this.router.navigate(['/']);
  }
}

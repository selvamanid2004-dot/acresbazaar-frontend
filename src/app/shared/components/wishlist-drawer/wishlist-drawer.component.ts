import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-wishlist-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div 
      class="wishlist-backdrop" 
      *ngIf="wishlistService.isLoggedIn && wishlistService.isDrawerOpen()" 
      (click)="close()"
    ></div>

    <!-- Slide-out Drawer Panel -->
    <aside 
      class="wishlist-drawer" 
      [class.open]="wishlistService.isLoggedIn && wishlistService.isDrawerOpen()"
      aria-label="Wishlist Drawer"
    >
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="header-left">
          <div class="wishlist-icon-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div>
            <h3 class="drawer-title">My Wishlist</h3>
            <span class="drawer-subtitle">{{ wishlistService.wishlistCount() }} Saved {{ wishlistService.wishlistCount() === 1 ? 'Property' : 'Properties' }}</span>
          </div>
        </div>

        <button type="button" class="btn-close-drawer" (click)="close()" aria-label="Close wishlist drawer">
          ✕
        </button>
      </div>

      <!-- Drawer Body -->
      <div class="drawer-body">
        
        <!-- EMPTY STATE -->
        <div *ngIf="wishlistService.wishlistCount() === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h4 class="empty-title">Your Wishlist is Empty</h4>
          <p class="empty-desc">
            Save properties you like and find them here later.
          </p>
          <button type="button" class="btn-browse-properties" (click)="exploreProperties()">
            Browse Properties
          </button>
        </div>

        <!-- LIST OF CLEAN WISHLIST CARDS -->
        <div *ngIf="wishlistService.wishlistCount() > 0" class="wishlist-cards-grid">
          <div 
            *ngFor="let item of wishlistService.getWishlistProperties()" 
            class="wishlist-clean-card"
          >
            <!-- Card Image Area with Top Heart Remove Action -->
            <div class="card-image-box" (click)="viewDetails(item)">
              <img 
                [src]="item.imageUrl" 
                (error)="onImgError($event, item.category)" 
                [alt]="item.title" 
                class="card-img" 
                loading="lazy"
              />
              
              <!-- Property Type Badge if available -->
              <span class="property-type-tag" *ngIf="item.category || item.type">
                {{ formatCategory(item.category || item.type) }}
              </span>

              <!-- Heart / Remove from Wishlist Button -->
              <button 
                type="button" 
                class="wishlist-heart-btn" 
                (click)="removeItem($event, item.id)" 
                title="Remove from Wishlist"
                aria-label="Remove from Wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <!-- Card Content Body -->
            <div class="card-content">
              <h4 class="property-title" (click)="viewDetails(item)" [title]="item.title">
                {{ item.title }}
              </h4>

              <div class="property-location" [title]="(item.location || '') + (item.city ? ', ' + item.city : '')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ item.location }}{{ item.city ? ', ' + item.city : '' }}</span>
              </div>

              <div class="property-price">
                {{ item.priceDisplay }}
              </div>

              <!-- View Property Action -->
              <button 
                type="button" 
                class="btn-view-property" 
                (click)="viewDetails(item)"
              >
                View Property
              </button>
            </div>

          </div>
        </div>

      </div>

      <!-- Drawer Footer -->
      <div class="drawer-footer" *ngIf="wishlistService.wishlistCount() > 0">
        <button type="button" class="btn-clear-all" (click)="clearAll()">
          Clear All
        </button>
        <button type="button" class="btn-browse-more" (click)="exploreProperties()">
          Browse Properties
        </button>
      </div>

    </aside>
  `,
  styles: [`
    .wishlist-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 9995;
      animation: fadeIn 200ms ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .wishlist-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      color: #0f172a;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.25);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
      border-left: 1px solid #e2e8f0;
    }

    .wishlist-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wishlist-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drawer-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .drawer-subtitle {
      font-size: 0.8rem;
      color: #64748b;
    }

    .btn-close-drawer {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .btn-close-drawer:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: scale(1.05);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
    }

    /* EMPTY STATE */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 3.5rem 1.5rem;
    }

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .empty-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
    }

    .empty-desc {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
      max-width: 280px;
    }

    .btn-browse-properties {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    }

    .btn-browse-properties:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }

    /* WISHLIST CARDS */
    .wishlist-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .wishlist-clean-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .wishlist-clean-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    /* CARD IMAGE */
    .card-image-box {
      position: relative;
      width: 100%;
      height: 175px;
      background: #e2e8f0;
      overflow: hidden;
      cursor: pointer;
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .wishlist-clean-card:hover .card-img {
      transform: scale(1.03);
    }

    .property-type-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      padding: 3px 8px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
      text-transform: capitalize;
    }

    .wishlist-heart-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 2;
    }

    .wishlist-heart-btn:hover {
      transform: scale(1.1);
      background: #fef2f2;
    }

    /* CARD CONTENT */
    .card-content {
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .property-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .property-title:hover {
      color: #2563eb;
    }

    .property-location {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .property-price {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }

    .btn-view-property {
      width: 100%;
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.35rem;
    }

    .btn-view-property:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }

    /* FOOTER */
    .drawer-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .btn-clear-all {
      background: none;
      border: none;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
      padding: 4px 8px;
    }

    .btn-clear-all:hover {
      color: #ef4444;
      text-decoration: underline;
    }

    .btn-browse-more {
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 0.55rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-browse-more:hover {
      background: #e2e8f0;
    }
  `]
})
export class WishlistDrawerComponent {
  wishlistService = inject(WishlistService);
  private router = inject(Router);

  close(): void {
    this.wishlistService.closeDrawer();
  }

  removeItem(event: Event, propertyId: string): void {
    event.stopPropagation();
    this.wishlistService.removeFromWishlist(propertyId);
  }

  clearAll(): void {
    this.wishlistService.clearWishlist();
  }

  viewDetails(item: Property): void {
    this.close();
    this.router.navigate([], {
      queryParams: { property: item.id },
      queryParamsHandling: 'merge'
    });
  }

  exploreProperties(): void {
    this.close();
    this.router.navigate(['/buyers']);
  }

  formatCategory(cat?: string): string {
    if (!cat) return 'Property';
    return cat.replace(/-/g, ' ');
  }

  onImgError(e: Event, category?: string) {
    const target = e.target as HTMLImageElement;
    if (target) {
      const cat = (category || '').toLowerCase();
      if (cat.includes('plot') || cat.includes('land')) {
        target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('villa') || cat.includes('estate') || cat.includes('house')) {
        target.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('apartment') || cat.includes('flat')) {
        target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('commercial') || cat.includes('office') || cat.includes('retail')) {
        target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
      } else if (cat.includes('farm')) {
        target.src = 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80';
      } else {
        target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
      }
    }
  }
}

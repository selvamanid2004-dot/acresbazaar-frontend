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

    <!-- Slide-out Drawer Panel (Flipkart Style) -->
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
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h4>Your Wishlist is Empty</h4>
          <p>
            Explore our curated residential plots, luxury villas, and high-yield commercial assets, then tap "Add to Wishlist" to save them here.
          </p>
          <button type="button" class="btn btn-gold btn-explore" (click)="exploreProperties()">
            Explore Properties
          </button>
        </div>

        <!-- LIST OF WISHLIST ITEMS -->
        <div *ngIf="wishlistService.wishlistCount() > 0" class="wishlist-items-list">
          <div 
            *ngFor="let item of wishlistService.getWishlistProperties()" 
            class="wishlist-item-card"
          >
            <!-- Thumbnail Image -->
            <div class="item-img-box" (click)="viewDetails(item)">
              <img [src]="item.imageUrl" [alt]="item.title" class="item-img" />
              <span class="tier-pill" [class.tier-gold]="item.tier === 'gold'" [class.tier-plat]="item.tier === 'platinum'">
                {{ item.tier | uppercase }}
              </span>
            </div>

            <!-- Details -->
            <div class="item-info">
              <h5 class="item-title" (click)="viewDetails(item)">{{ item.title }}</h5>
              <div class="item-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ item.location }}</span>
              </div>
              <div class="item-price">{{ item.priceDisplay }}</div>

              <div class="item-actions">
                <button type="button" class="btn-view-details" (click)="viewDetails(item)">
                  View Details
                </button>
                <button type="button" class="btn-remove-item" (click)="removeItem(item.id)" title="Remove from Wishlist">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Drawer Footer -->
      <div class="drawer-footer" *ngIf="wishlistService.wishlistCount() > 0">
        <button type="button" class="btn-clear-all" (click)="clearAll()">
          Clear Wishlist
        </button>
        <button type="button" class="btn btn-gold btn-close-bottom" (click)="close()">
          Continue Browsing
        </button>
      </div>

    </aside>
  `,
  styles: [`
    .wishlist-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 13, 30, 0.75);
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
      background: #0f172a;
      color: #f8fafc;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.6);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .wishlist-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.95);
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
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drawer-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }

    .drawer-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .btn-close-drawer {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
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
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      transform: scale(1.08);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
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
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .empty-state h4 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
    }

    .btn-explore {
      padding: 0.75rem 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
    }

    /* ITEMS LIST */
    .wishlist-items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .wishlist-item-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .wishlist-item-card:hover {
      border-color: rgba(212, 175, 55, 0.4);
      background: rgba(30, 41, 59, 0.8);
      transform: translateY(-1px);
    }

    .item-img-box {
      width: 100px;
      height: 90px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      cursor: pointer;
    }

    .item-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .wishlist-item-card:hover .item-img {
      transform: scale(1.05);
    }

    .tier-pill {
      position: absolute;
      bottom: 4px;
      left: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .tier-gold {
      background: rgba(234, 179, 8, 0.9);
      color: #000;
    }

    .tier-plat {
      background: rgba(168, 85, 247, 0.9);
      color: #fff;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
    }

    .item-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 4px 0;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-title:hover {
      color: #facc15;
    }

    .item-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-price {
      font-size: 1rem;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-view-details {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      color: #070d1e;
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-view-details:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .btn-remove-item {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: color 0.2s ease;
      padding: 4px;
    }

    .btn-remove-item:hover {
      color: #f87171;
    }

    /* FOOTER */
    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.95);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .btn-clear-all {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.8rem;
      text-decoration: underline;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .btn-clear-all:hover {
      color: #f87171;
    }

    .btn-close-bottom {
      padding: 0.6rem 1.2rem;
      font-size: 0.85rem;
      font-weight: 700;
    }
  `]
})
export class WishlistDrawerComponent {
  wishlistService = inject(WishlistService);
  private router = inject(Router);

  close(): void {
    this.wishlistService.closeDrawer();
  }

  removeItem(propertyId: string): void {
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
}

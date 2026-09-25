import { Component, HostListener, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WishlistService } from '../../../../core/services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="marketplace-header" [class.scrolled]="isScrolled">
      <div class="container header-inner">
        
        <!-- Left: Menu Bar on LEFT side of logo + Brand Logo & Tagline -->
        <div class="header-brand-wrap">
          <button 
            type="button" 
            class="left-menu-bar" 
            [class.active]="mobileMenuOpen"
            (click)="toggleMenu()" 
            title="Explore Menu & Categories"
            aria-label="Navigation Menu Bar">
            <div class="menu-bar-icon-box">
              <span class="m-bar"></span>
              <span class="m-bar"></span>
              <span class="m-bar"></span>
            </div>
            <span class="menu-bar-text">Menu</span>
          </button>

          <a href="#" class="brand-block" (click)="onNavClick($event, 'Home')">
            <div class="brand-icon" *ngIf="!websiteLogo()">
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <img *ngIf="websiteLogo()" [src]="websiteLogo()" alt="Logo" class="custom-brand-logo" />
            <div class="brand-text">
              <span class="brand-name">{{ brandName() }}</span>
              <span class="brand-sub">PREMIUM PROPERTIES</span>
            </div>
          </a>
        </div>

        <!-- Center: Main Navigation (Home, About, For Buyers, For Dealers, Services, Contact) -->
        <nav class="center-nav" aria-label="Main navigation">
          <ul class="nav-list">
            <li *ngFor="let item of navLinks">
              <a 
                [href]="item.href" 
                class="nav-link" 
                [class.active]="activeNav === item.label"
                (click)="onNavClick($event, item.label)">
                {{ item.label }}
              </a>
            </li>
          </ul>
        </nav>

        <!-- Right: Login, Register, or User Profile when logged in, and Post Property -->
        <div class="right-actions">
          <!-- When NO account is logged in -->
          <ng-container *ngIf="!authService.isAuthenticated() && !authService.isSellerAuthenticated() && !authService.isDealerAuthenticated() && !isSpotterAuthenticated()">
            <div class="login-wrapper">
              <button type="button" class="btn-auth login-link" (click)="toggleLoginDropdown()">
                <span>Login</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="login-dropdown" *ngIf="loginDropdownOpen">
                <a routerLink="/login" (click)="closeLoginDropdown()" class="login-dropdown-item">
                  <div class="drop-icon buyer-i">👤</div>
                  <div>
                    <div class="drop-title">Buyer Login</div>
                    <div class="drop-sub">Unlock property dossiers & contacts</div>
                  </div>
                </a>
                <a routerLink="/seller/login" (click)="closeLoginDropdown()" class="login-dropdown-item">
                  <div class="drop-icon seller-i">🏠</div>
                  <div>
                    <div class="drop-title">Seller Login</div>
                    <div class="drop-sub">Sell property & manage Platinum listings</div>
                  </div>
                </a>
                <a routerLink="/dealer/login" (click)="closeLoginDropdown()" class="login-dropdown-item">
                  <div class="drop-icon dealer-i">🏢</div>
                  <div>
                    <div class="drop-title">Dealer Login</div>
                    <div class="drop-sub">Agency dashboard & commercial inventory</div>
                  </div>
                </a>
                <a routerLink="/snap-property/login" (click)="closeLoginDropdown()" class="login-dropdown-item">
                  <div class="drop-icon spotter-i">📸</div>
                  <div>
                    <div class="drop-title">Spotter Login</div>
                    <div class="drop-sub">Track snaps, earn points & claim rewards</div>
                  </div>
                </a>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-sm register-btn" (click)="onAuth('Register')">
              Register
            </button>
          </ng-container>

          <!-- When SELLER is logged in -->
          <ng-container *ngIf="authService.isSellerAuthenticated()">
            <a routerLink="/seller/dashboard" class="user-profile-badge seller-theme" title="Go to Seller Dashboard">
              <div class="user-avatar seller-avatar">
                S
              </div>
              <div class="user-meta">
                <span class="user-name">{{ authService.currentSeller()?.fullName?.split(' ')?.at(0) || 'Seller' }}</span>
                <span class="user-tier-tag seller-tag">SELLER DASHBOARD</span>
              </div>
            </a>
            <button type="button" class="btn-logout" (click)="onSellerLogout()" title="Logout Seller">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </ng-container>

          <!-- When DEALER is logged in -->
          <ng-container *ngIf="authService.isDealerAuthenticated()">
            <a routerLink="/dealer/dashboard" class="user-profile-badge dealer-theme" title="Go to Dealer Dashboard">
              <div class="user-avatar dealer-avatar">
                D
              </div>
              <div class="user-meta">
                <span class="user-name">{{ authService.currentDealer()?.businessName || authService.currentDealer()?.fullName?.split(' ')?.at(0) || 'Dealer' }}</span>
                <span class="user-tier-tag dealer-tag">AGENCY DASHBOARD</span>
              </div>
            </a>
            <button type="button" class="btn-logout" (click)="onDealerLogout()" title="Logout Dealer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </ng-container>

          <!-- When BUYER is logged in -->
          <ng-container *ngIf="authService.isAuthenticated()">
            <div class="user-profile-badge">
              <div class="user-avatar">
                {{ getUserInitial() }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ getFirstName() }}</span>
                <span 
                  class="user-tier-tag" 
                  [class.gold-tier]="authService.activeMembership() === 'gold'"
                  [class.plat-tier]="authService.activeMembership() === 'platinum'">
                  {{ getTierLabel() }}
                </span>
              </div>
            </div>
            <button type="button" class="btn-logout" (click)="onLogout()" title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </ng-container>

          <!-- When SPOTTER is logged in -->
          <ng-container *ngIf="isSpotterAuthenticated()">
            <a routerLink="/snap-property/dashboard" class="user-profile-badge spotter-theme" title="Go to Spotter Dashboard & Rewards">
              <div class="user-avatar spotter-avatar">
                📸
              </div>
              <div class="user-meta">
                <span class="user-name">{{ getSpotterName() }}</span>
                <span class="user-tier-tag spotter-tag">SPOTTER DASHBOARD</span>
              </div>
            </a>
            <button type="button" class="btn-logout" (click)="onSpotterLogout()" title="Logout Spotter">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </ng-container>

          <!-- Top Wishlist Option (Flipkart Style - Symbol Only) - Visible ONLY for logged-in Buyers -->
          <button 
            *ngIf="authService.isAuthenticated()"
            type="button" 
            class="top-wishlist-btn" 
            [class.has-items]="wishlistService.wishlistCount() > 0"
            (click)="wishlistService.toggleDrawer()" 
            title="Wishlist ({{ wishlistService.wishlistCount() }})"
            aria-label="Wishlist">
            <div class="wishlist-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="wishlistService.wishlistCount() > 0 ? '#ef4444' : 'none'" [attr.stroke]="wishlistService.wishlistCount() > 0 ? '#ef4444' : 'currentColor'" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span class="wishlist-counter-badge" *ngIf="wishlistService.wishlistCount() > 0">
                {{ wishlistService.wishlistCount() }}
              </span>
            </div>
          </button>

          <button type="button" class="btn btn-gold btn-sm post-property-btn" (click)="onSnapProperty()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>Snap Property</span>
            <span class="free-badge">FREE</span>
          </button>


        </div>

      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer" [class.open]="mobileMenuOpen">
        <div class="drawer-header">
          <span class="brand-name">AcresBazaar</span>
          <button type="button" class="drawer-close" (click)="closeMenu()">✕</button>
        </div>
        <div class="drawer-body">
          <ul class="drawer-nav">
            <li *ngFor="let item of navLinks">
              <a 
                [href]="item.href" 
                class="drawer-link" 
                [class.active]="activeNav === item.label"
                (click)="onNavClick($event, item.label)">
                {{ item.label }}
              </a>
            </li>
            <!-- Mobile Drawer Wishlist Item - Visible ONLY for logged-in Buyers -->
            <li *ngIf="authService.isAuthenticated()">
              <button 
                type="button" 
                class="drawer-wishlist-item-btn" 
                (click)="wishlistService.openDrawer(); closeMenu()">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="wishlistService.wishlistCount() > 0 ? '#ef4444' : 'none'" [attr.stroke]="wishlistService.wishlistCount() > 0 ? '#ef4444' : 'currentColor'" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>My Wishlist</span>
                </div>
                <span class="drawer-wishlist-count" *ngIf="wishlistService.wishlistCount() > 0">
                  {{ wishlistService.wishlistCount() }}
                </span>
              </button>
            </li>
          </ul>
          <div class="drawer-auth">
            <!-- No active login -->
            <ng-container *ngIf="!authService.isAuthenticated() && !authService.isSellerAuthenticated() && !authService.isDealerAuthenticated() && !isSpotterAuthenticated()">
              <div class="drawer-login-links">
                <a routerLink="/login" (click)="closeMenu()" class="drawer-link-btn">Buyer Login</a>
                <a routerLink="/seller/login" (click)="closeMenu()" class="drawer-link-btn">Seller Login</a>
                <a routerLink="/dealer/login" (click)="closeMenu()" class="drawer-link-btn">Dealer Login</a>
                <a routerLink="/snap-property/login" (click)="closeMenu()" class="drawer-link-btn">Spotter Login</a>
              </div>
              <button type="button" class="btn btn-primary btn-full mb-2 mt-2" (click)="onAuth('Register')">Register</button>
            </ng-container>

            <!-- Seller active -->
            <ng-container *ngIf="authService.isSellerAuthenticated()">
              <div class="drawer-user-info mb-2">
                <strong>{{ authService.currentSeller()?.fullName }}</strong>
                <span class="drawer-tier-pill seller-pill">SELLER PORTAL</span>
              </div>
              <a routerLink="/seller/dashboard" (click)="closeMenu()" class="btn btn-outline btn-full mb-2">Seller Dashboard</a>
              <button type="button" class="btn btn-outline btn-full mb-2" (click)="onSellerLogout()">Logout</button>
            </ng-container>

            <!-- Dealer active -->
            <ng-container *ngIf="authService.isDealerAuthenticated()">
              <div class="drawer-user-info mb-2">
                <strong>{{ authService.currentDealer()?.businessName || authService.currentDealer()?.fullName }}</strong>
                <span class="drawer-tier-pill dealer-pill">DEALER PORTAL</span>
              </div>
              <a routerLink="/dealer/dashboard" (click)="closeMenu()" class="btn btn-outline btn-full mb-2">Dealer Dashboard</a>
              <button type="button" class="btn btn-outline btn-full mb-2" (click)="onDealerLogout()">Logout</button>
            </ng-container>

            <!-- Buyer active -->
            <ng-container *ngIf="authService.isAuthenticated()">
              <div class="drawer-user-info mb-2">
                <strong>{{ authService.currentBuyer()?.fullName }}</strong>
                <span class="drawer-tier-pill">{{ getTierLabel() }}</span>
              </div>
              <button type="button" class="btn btn-outline btn-full mb-2" (click)="onLogout()">Logout</button>
            </ng-container>

            <!-- Spotter active -->
            <ng-container *ngIf="isSpotterAuthenticated()">
              <div class="drawer-user-info mb-2">
                <strong>{{ getSpotterName() }}</strong>
                <span class="drawer-tier-pill spotter-pill">SPOTTER DASHBOARD</span>
              </div>
              <a routerLink="/snap-property/dashboard" (click)="closeMenu()" class="btn btn-outline btn-full mb-2">My Snaps & Rewards</a>
              <button type="button" class="btn btn-outline btn-full mb-2" (click)="onSpotterLogout()">Logout</button>
            </ng-container>

            <button type="button" class="btn btn-gold btn-full post-drawer-btn mt-2" (click)="onSnapProperty()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="me-1">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>Snap Property</span>
              <span class="free-badge ms-1">FREE</span>
            </button>
          </div>
        </div>
      </div>
      <div class="drawer-backdrop" *ngIf="mobileMenuOpen" (click)="closeMenu()"></div>
    </header>
  `,
  styles: [`
    .marketplace-header {
      position: sticky;
      top: 0;
      left: 0;
      width: 100%;
      height: 74px;
      background: #FFFFFF;
      border-bottom: 1px solid var(--slate-200);
      z-index: 1000;
      transition: box-shadow var(--transition-base);
    }

    .marketplace-header.scrolled {
      box-shadow: 0 4px 16px rgba(11, 19, 43, 0.08);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      gap: 1.25rem;
      flex-wrap: nowrap;
      max-width: 100% !important;
      padding-left: 1.75rem !important;
      padding-right: 2rem !important;
    }

    /* Left Brand */
    .brand-block {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      user-select: none;
      flex-shrink: 0;
    }

    .custom-brand-logo {
      height: 52px;
      max-width: 220px;
      object-fit: contain;
      border-radius: 6px;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 11px;
      background: var(--primary-900);
      color: var(--gold-400);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    .brand-name {
      font-family: var(--font-display);
      font-size: 1.52rem;
      font-weight: 800;
      color: var(--primary-900);
      line-height: 1.08;
      letter-spacing: -0.015em;
    }

    .brand-sub {
      font-size: 0.66rem;
      letter-spacing: 0.18em;
      color: var(--slate-500);
      font-weight: 700;
      margin-top: 3px;
    }

    /* Navigation shifted into left side */
    .center-nav {
      display: flex;
      align-items: center;
      margin-left: 1.75rem;
      margin-right: auto;
    }

    /* Brand Wrap */
    .header-brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-shrink: 0;
    }

    /* Left Side Menu Option - Compact */
    .left-menu-bar {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 32px;
      padding: 0 8px;
      background: var(--primary-900);
      border: 1px solid var(--primary-800);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }

    .left-menu-bar:hover {
      background: var(--gold-400);
      border-color: var(--gold-400);
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(212, 175, 55, 0.25);
    }

    .left-menu-bar:hover .m-bar {
      background: var(--primary-900);
    }

    .left-menu-bar:hover .menu-bar-text {
      color: var(--primary-900);
    }

    .left-menu-bar.active {
      background: var(--gold-400);
      border-color: var(--gold-400);
    }

    .left-menu-bar.active .m-bar {
      background: var(--primary-900);
    }

    .left-menu-bar.active .menu-bar-text {
      color: var(--primary-900);
    }

    .menu-bar-icon-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2.5px;
    }

    .m-bar {
      display: block;
      width: 13px;
      height: 1.8px;
      background: #ffffff;
      border-radius: 1px;
      transition: all 0.22s ease;
    }

    .m-bar:nth-child(1) { width: 10px; }
    .m-bar:nth-child(3) { width: 8px; }

    .left-menu-bar:hover .m-bar:nth-child(1),
    .left-menu-bar.active .m-bar:nth-child(1) { width: 13px; }
    .left-menu-bar:hover .m-bar:nth-child(3),
    .left-menu-bar.active .m-bar:nth-child(3) { width: 13px; }

    .menu-bar-text {
      font-size: 0.70rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.04em;
      transition: color 0.22s;
    }



    .nav-list {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--slate-600);
      padding: 0.45rem 0.65rem;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
    }

    .nav-link:hover {
      color: var(--primary-900);
      background: var(--slate-100);
    }

    .nav-link.active {
      color: var(--primary-900);
      background: var(--slate-100);
      font-weight: 700;
    }

    /* Right Actions */
    .right-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    .btn-auth {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--slate-600);
      height: 38px;
      padding: 0 0.65rem;
      display: inline-flex;
      align-items: center;
      transition: color var(--transition-fast);
    }

    .btn-auth:hover {
      color: var(--primary-900);
    }

    .register-btn {
      font-size: 0.85rem;
      height: 38px;
      padding: 0 1rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
    }

    .post-property-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      height: 38px;
      padding: 0 0.95rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
    }

    .login-wrapper {
      position: relative;
    }

    .login-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      background: transparent;
      border: none;
    }

    .login-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 280px;
      background: #15202B;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 14px;
      padding: 8px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
      z-index: 1050;
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: modalIn 0.2s ease-out;
    }

    .login-dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      text-decoration: none;
      transition: background 0.2s;
    }

    .login-dropdown-item:hover {
      background: #1E2D3D;
    }

    .drop-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: #0B1118;
      flex-shrink: 0;
    }

    .drop-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .drop-sub {
      font-size: 0.72rem;
      color: #94A3B8;
      line-height: 1.3;
    }

    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 5px;
      background: var(--slate-100);
      border: 1px solid var(--slate-200);
      border-radius: 30px;
      text-decoration: none;
    }

    .user-profile-badge.seller-theme {
      background: rgba(212, 175, 55, 0.12);
      border-color: rgba(212, 175, 55, 0.35);
    }

    .seller-avatar {
      background: #D4AF37 !important;
      color: #0B1118 !important;
    }

    .seller-tag {
      color: #D4AF37 !important;
      font-weight: 800;
    }

    .user-profile-badge.dealer-theme {
      background: rgba(168, 85, 247, 0.12);
      border-color: rgba(168, 85, 247, 0.35);
    }

    .dealer-avatar {
      background: #A855F7 !important;
      color: #FFFFFF !important;
    }

    .dealer-tag {
      color: #C084FC !important;
      font-weight: 800;
    }

    .user-profile-badge.spotter-theme {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.35);
    }

    .spotter-avatar {
      background: #10b981 !important;
      color: #FFFFFF !important;
    }

    .spotter-tag {
      color: #059669 !important;
      font-weight: 800;
    }

    .spotter-pill {
      background: #10b981;
      color: #FFFFFF;
    }

    .drop-icon.spotter-i {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    .drawer-login-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
    }

    .drawer-link-btn {
      display: block;
      padding: 10px;
      background: var(--slate-100);
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      text-decoration: none;
      color: var(--primary-900);
      font-weight: 600;
      font-size: 0.88rem;
      text-align: center;
    }

    .seller-pill {
      background: #D4AF37;
      color: #0B1118;
    }

    .dealer-pill {
      background: #A855F7;
      color: #FFFFFF;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-900);
      color: #D4AF37;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .user-name {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--primary-950);
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-tier-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .user-tier-tag.gold-tier {
      color: #B45309;
      font-weight: 800;
    }

    .user-tier-tag.plat-tier {
      color: #0284C7;
      font-weight: 800;
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: 1px solid var(--slate-200);
      color: var(--slate-600);
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.3);
      color: #EF4444;
    }

    .drawer-user-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: var(--slate-100);
      border-radius: 8px;
      color: var(--primary-900);
      font-size: 0.9rem;
    }

    .drawer-tier-pill {
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--primary-900);
      color: #D4AF37;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .free-badge {
      font-size: 0.62rem;
      font-weight: 800;
      background: var(--primary-950);
      color: var(--gold-400);
      padding: 0.15rem 0.4rem;
      border-radius: 3px;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .post-drawer-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    /* Top Wishlist Option (Flipkart Style - Symbol Only) */
    .top-wishlist-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.04);
      border: 1px solid var(--slate-200);
      cursor: pointer;
      color: var(--slate-700);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      flex-shrink: 0;
      padding: 0;
    }

    .top-wishlist-btn:hover {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.4);
      color: #ef4444;
      transform: scale(1.06);
    }

    .top-wishlist-btn.has-items {
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.06);
    }

    .wishlist-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wishlist-counter-badge {
      position: absolute;
      top: -8px;
      right: -10px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      min-width: 17px;
      height: 17px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
      line-height: 1;
    }

    .drawer-wishlist-item-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      color: #ef4444;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      margin-top: 6px;
    }

    .drawer-wishlist-count {
      background: #ef4444;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* Mobile Toggle */
    .mobile-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--slate-200);
      gap: 4px;
      cursor: pointer;
    }

    .bar {
      width: 18px;
      height: 2px;
      background: var(--slate-700);
      border-radius: 2px;
      transition: 200ms ease;
    }

    /* Mobile Drawer */
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 290px;
      height: 100vh;
      background: #FFFFFF;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
      z-index: 1050;
      transform: translateX(-100%);
      transition: transform var(--transition-smooth);
      display: flex;
      flex-direction: column;
    }

    .mobile-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--slate-100);
    }

    .drawer-close {
      font-size: 1.2rem;
      color: var(--slate-500);
      padding: 0.25rem;
    }

    .drawer-body {
      padding: 1.25rem 1.5rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .drawer-nav {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 2rem;
    }

    .drawer-link {
      display: block;
      padding: 0.75rem 0.85rem;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 600;
      color: var(--slate-700);
    }

    .drawer-link:hover, .drawer-link.active {
      background: var(--slate-100);
      color: var(--primary-900);
    }

    .drawer-auth {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-full {
      width: 100%;
    }

    .mb-2 { margin-bottom: 0.5rem; }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1040;
    }

    @media (max-width: 1160px) {
      .header-inner {
        gap: 0.65rem;
      }
      .nav-link {
        font-size: 0.82rem;
        padding: 0.35rem 0.45rem;
      }
      .right-actions {
        gap: 0.45rem;
      }
      .register-btn, .post-property-btn {
        padding: 0 0.7rem;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 1040px) {
      .center-nav {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .header-inner {
        padding-left: 0.85rem !important;
        padding-right: 0.85rem !important;
      }
    }

    @media (max-width: 580px) {
      .left-menu-bar .menu-bar-text {
        display: none;
      }
      .left-menu-bar {
        padding: 0 5px;
        width: 30px;
        height: 30px;
        justify-content: center;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  wishlistService = inject(WishlistService);
  router = inject(Router);

  isScrolled = false;
  mobileMenuOpen = false;
  loginDropdownOpen = false;
  websiteLogo = signal<string | null>(null);
  brandName = signal<string>('AcresBazaar');

  private _logoStorageListener = (e: StorageEvent) => {
    // When admin panel updates logo via another tab or localStorage, refresh immediately
    if (e.key === 'aura_website_logo') {
      if (e.newValue) {
        this.websiteLogo.set(e.newValue);
      } else {
        this.websiteLogo.set(null);
      }
    }
  };

  ngOnInit(): void {
    this.loadWebsiteLogo();
    // Listen for logo changes from admin panel (cross-tab storage sync)
    window.addEventListener('storage', this._logoStorageListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this._logoStorageListener);
  }

  loadWebsiteLogo(): void {
    // Always fetch fresh from DB — do NOT use cached localStorage as primary source
    // (localStorage is only used as a quick initial render to avoid flash)
    const cached = localStorage.getItem('aura_website_logo');
    if (cached) {
      this.websiteLogo.set(cached);
    }

    // Add cache-bust timestamp so browser doesn't serve stale logo image
    fetch(`http://localhost:5001/api/settings/group/logo?_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const logo = data?.settings?.website_logo || data?.settings?.logo_url;
        if (logo && logo.trim()) {
          // Add cache-busting param to the image URL itself so <img> always reloads after change
          const bustParam = `?_v=${Date.now()}`;
          const logoWithBust = logo.trim().includes('?') ? logo.trim() : logo.trim() + bustParam;
          this.websiteLogo.set(logoWithBust);
          // Store clean URL (without bust) in localStorage
          localStorage.setItem('aura_website_logo', logo.trim());
        } else if (data?.settings && (data.settings.website_logo === '' || data.settings.logo_url === '')) {
          // Logo was explicitly removed from CMS
          this.websiteLogo.set(null);
          localStorage.removeItem('aura_website_logo');
        }
        const name = data?.settings?.brand_name || data?.settings?.website_name;
        if (name && name.trim()) {
          this.brandName.set(name.trim());
        }
      })
      .catch(() => {
        // Backend offline — keep cached value if any
      });
  }

  get activeNav(): string {
    const url = this.router.url;
    if (url.startsWith('/about')) return 'About';
    if (url.startsWith('/services')) return 'Services';
    if (url.startsWith('/contact')) return 'Contact';
    if (url.startsWith('/buyers')) return 'For Buyers';
    if (url.startsWith('/seller')) return 'For Sellers';
    return 'Home';
  }

  // Exact requested navigation menu items
  navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'For Buyers', href: '/buyers' },
    { label: 'For Sellers', href: '/seller/login' },
    { label: 'For Dealers', href: '/dealer/login' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' }
  ];

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 15;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.login-wrapper')) {
      this.loginDropdownOpen = false;
    }
  }

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenu() {
    this.mobileMenuOpen = false;
  }

  toggleLoginDropdown() {
    this.loginDropdownOpen = !this.loginDropdownOpen;
  }

  closeLoginDropdown() {
    this.loginDropdownOpen = false;
  }

  onSnapProperty() {
    this.closeMenu();
    // Check if user has active session (Common People, Buyer, Seller, Dealer)
    if (this.isSpotterAuthenticated()) {
      this.router.navigate(['/snap-property/dashboard']);
      return;
    }

    const commonSession = localStorage.getItem('aura_common_session');
    const authSession = localStorage.getItem('aura_auth_session');
    const sellerSession = localStorage.getItem('aura_seller_session');
    const dealerSession = localStorage.getItem('aura_dealer_session');

    if (commonSession || authSession || sellerSession || dealerSession || this.authService.isAuthenticated() || this.authService.isSellerAuthenticated() || this.authService.isDealerAuthenticated()) {
      this.router.navigate(['/snap-property/upload']);
    } else {
      this.router.navigate(['/snap-property/register']);
    }
  }

  onPostProperty() {
    this.onSnapProperty();
  }

  onNavClick(event: Event, label: string) {
    event.preventDefault();
    this.closeMenu();

    if (label === 'Home') {
      this.navStateService.setView('home');
      this.router.navigate(['/']);
      return;
    }

    if (label === 'About') {
      this.navStateService.setView('about');
      this.router.navigate(['/about']);
      return;
    }

    if (label === 'Services') {
      this.navStateService.setView('services');
      this.router.navigate(['/services']);
      return;
    }

    if (label === 'For Buyers') {
      this.navStateService.setView('buyers');
      this.router.navigate(['/buyers']);
      return;
    }

    if (label === 'For Sellers') {
      if (this.authService.isSellerAuthenticated()) {
        this.router.navigate(['/seller/dashboard']);
      } else {
        this.router.navigate(['/seller/login']);
      }
      return;
    }

    if (label === 'For Dealers') {
      if (this.authService.isDealerAuthenticated()) {
        this.router.navigate(['/dealer/dashboard']);
      } else {
        this.router.navigate(['/dealer/login']);
      }
      return;
    }

    if (label === 'Contact') {
      this.router.navigate(['/contact']);
      return;
    }

    this.notificationService.show('Navigation', `Navigating to ${label}`, 'info');
  }

  onAuth(type: 'Login' | 'Register') {
    this.closeMenu();
    if (type === 'Register') {
      this.navStateService.openRegister();
      return;
    }
    this.router.navigate(['/login']);
  }

  onLogout() {
    this.closeMenu();
    this.authService.logout();
    this.notificationService.show('Logged Out', 'You have been successfully logged out.', 'info');
    this.router.navigate(['/']);
  }

  onSellerLogout() {
    this.closeMenu();
    this.authService.logoutSeller();
    this.notificationService.show('Logged Out', 'Seller account logged out successfully.', 'info');
    this.router.navigate(['/']);
  }

  onDealerLogout() {
    this.closeMenu();
    this.authService.logoutDealer();
    this.notificationService.show('Logged Out', 'Dealer account logged out successfully.', 'info');
    this.router.navigate(['/']);
  }

  isSpotterAuthenticated(): boolean {
    try {
      const s = localStorage.getItem('aura_common_session');
      return !!s;
    } catch {
      return false;
    }
  }

  getSpotterName(): string {
    try {
      const s = localStorage.getItem('aura_common_session');
      if (s) {
        const u = JSON.parse(s).user;
        return u?.name?.split(' ')[0] || 'Spotter';
      }
    } catch {}
    return 'Spotter';
  }

  onSpotterLogout() {
    this.closeMenu();
    localStorage.removeItem('aura_common_session');
    this.notificationService.show('Logged Out', 'Spotter account logged out successfully.', 'info');
    this.router.navigate(['/']);
  }

  getUserInitial(): string {
    const name = this.authService.currentBuyer()?.fullName || 'B';
    return name.charAt(0).toUpperCase();
  }

  getFirstName(): string {
    const fullName = this.authService.currentBuyer()?.fullName || 'Buyer';
    return fullName.split(' ')[0];
  }

  getTierLabel(): string {
    const tier = this.authService.activeMembership();
    if (tier === 'platinum') return 'Platinum VIP';
    if (tier === 'gold') return 'Gold Member';
    return 'Buyer';
  }
}


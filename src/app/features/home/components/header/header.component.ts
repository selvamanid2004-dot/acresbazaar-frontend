import { Component, HostListener, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { getApiBaseUrl } from '../../../../core/services/api-config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
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
    fetch(`${getApiBaseUrl()}/settings/group/logo?_t=${Date.now()}`)
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


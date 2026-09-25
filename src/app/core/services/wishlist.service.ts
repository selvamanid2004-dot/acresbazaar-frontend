import { Injectable, signal, computed, inject } from '@angular/core';
import { Property } from '../models/property.model';
import { PropertyService } from './property.service';
import { NotificationService } from '../../shared/services/notification.service';

// Keys are now buyer-scoped: aura_wishlist_ids_<buyerId>
// When no buyer is logged in, wishlist is empty and not accessible.
const WISHLIST_PREFIX_IDS   = 'aura_wishlist_ids_';
const WISHLIST_PREFIX_ITEMS = 'aura_wishlist_items_';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private propertyService    = inject(PropertyService);
  private notificationService = inject(NotificationService);

  // Current active buyer ID — null means not logged in (no wishlist)
  private activeBuyerId = signal<string | null>(null);

  // Reactive signal of wishlisted IDs (empty when no buyer is logged in)
  readonly wishlistIds   = signal<string[]>([]);
  readonly wishlistCount = computed(() => this.wishlistIds().length);

  // Drawer / popup toggle state
  readonly isDrawerOpen = signal<boolean>(false);

  constructor() {
    // Listen for storage events across tabs so multiple tabs stay in sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        const buyerId = this.activeBuyerId();
        if (buyerId && e.key === WISHLIST_PREFIX_IDS + buyerId) {
          this.wishlistIds.set(this.loadIdsFromStorage());
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Called by AuthService when buyer logs IN
  // ─────────────────────────────────────────────────────────────────
  initForBuyer(buyerId: string): void {
    this.activeBuyerId.set(buyerId);
    this.wishlistIds.set(this.loadIdsFromStorage());
  }

  // ─────────────────────────────────────────────────────────────────
  // Called by AuthService when buyer logs OUT
  // Clears in-memory wishlist so it doesn't show on the website.
  // Persisted data in localStorage is preserved so it restores on next login.
  // ─────────────────────────────────────────────────────────────────
  clearForLogout(): void {
    this.activeBuyerId.set(null);
    this.wishlistIds.set([]);   // clear in-memory — storage is kept for next login
    this.isDrawerOpen.set(false);
  }

  // ─────────────────────────────────────────────────────────────────
  // INTERNAL HELPERS (scoped to current buyer)
  // ─────────────────────────────────────────────────────────────────
  private idsKey(): string | null {
    const id = this.activeBuyerId();
    return id ? WISHLIST_PREFIX_IDS + id : null;
  }

  private itemsKey(): string | null {
    const id = this.activeBuyerId();
    return id ? WISHLIST_PREFIX_ITEMS + id : null;
  }

  private loadIdsFromStorage(): string[] {
    const key = this.idsKey();
    if (!key) return [];
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveIdsToStorage(ids: string[]): void {
    const key = this.idsKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch (err) {
      console.warn('Could not save wishlist IDs to localStorage:', err);
    }
    this.wishlistIds.set(ids);
  }

  private loadItemsFromStorage(): Property[] {
    const key = this.itemsKey();
    if (!key) return [];
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveItemsToStorage(items: Property[]): void {
    const key = this.itemsKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.warn('Could not cache wishlist items to localStorage:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────

  /** Returns whether the buyer is currently logged in (wishlist is accessible) */
  get isLoggedIn(): boolean {
    return this.activeBuyerId() !== null;
  }

  isInWishlist(propertyId: string): boolean {
    return this.wishlistIds().includes(propertyId);
  }

  toggleWishlist(property: Property): boolean {
    if (!this.isLoggedIn) {
      this.notificationService.show(
        'Login Required',
        'Please login to your Buyer account to save properties to your wishlist.',
        'info'
      );
      return false;
    }

    const current = this.wishlistIds();
    const exists  = current.includes(property.id);

    if (exists) {
      this.removeFromWishlist(property.id);
      this.notificationService.show(
        'Removed from Wishlist',
        `"${property.title}" was removed from your wishlist.`,
        'info'
      );
      return false;
    } else {
      this.addToWishlist(property);
      this.notificationService.show(
        'Saved to Wishlist!',
        `"${property.title}" added to your personal wishlist.`,
        'success'
      );
      return true;
    }
  }

  addToWishlist(property: Property): void {
    if (!this.isLoggedIn) return;
    const current = this.wishlistIds();
    if (!current.includes(property.id)) {
      const updated = [property.id, ...current];
      this.saveIdsToStorage(updated);

      const cached = this.loadItemsFromStorage().filter(p => p.id !== property.id);
      cached.unshift(property);
      this.saveItemsToStorage(cached);
    }
  }

  removeFromWishlist(propertyId: string): void {
    const current = this.wishlistIds();
    const updated = current.filter(id => id !== propertyId);
    this.saveIdsToStorage(updated);

    const cached = this.loadItemsFromStorage().filter(p => p.id !== propertyId);
    this.saveItemsToStorage(cached);
  }

  clearWishlist(): void {
    this.saveIdsToStorage([]);
    this.saveItemsToStorage([]);
    this.notificationService.show('Wishlist Cleared', 'All saved properties were cleared.', 'info');
  }

  getWishlistProperties(): Property[] {
    const ids = this.wishlistIds();
    if (!ids.length) return [];

    const allProps   = this.propertyService.getAllProperties();
    const cachedItems = this.loadItemsFromStorage();

    const result: Property[] = [];
    for (const id of ids) {
      const found = allProps.find(p => p.id === id) || cachedItems.find(p => p.id === id);
      if (found) result.push(found);
    }
    return result;
  }

  openDrawer(): void {
    if (!this.isLoggedIn) {
      this.notificationService.show(
        'Login Required',
        'Please login to your Buyer account to view your wishlist.',
        'info'
      );
      return;
    }
    this.isDrawerOpen.set(true);
  }
  closeDrawer(): void { this.isDrawerOpen.set(false); }
  toggleDrawer(): void {
    if (!this.isLoggedIn) {
      this.notificationService.show(
        'Login Required',
        'Please login to your Buyer account to view your wishlist.',
        'info'
      );
      return;
    }
    this.isDrawerOpen.set(!this.isDrawerOpen());
  }
}

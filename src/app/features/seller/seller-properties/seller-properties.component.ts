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
  templateUrl: './seller-properties.component.html',
  styleUrl: './seller-properties.component.css'
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

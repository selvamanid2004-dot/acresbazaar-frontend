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
  templateUrl: './seller-categories.component.html',
  styleUrl: './seller-categories.component.css'
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

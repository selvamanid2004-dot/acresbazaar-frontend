import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-wishlist-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist-drawer.component.html',
  styleUrl: './wishlist-drawer.component.css'
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

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { SellerAccount } from '../../../core/models/buyer.model';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
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
      const res = await fetch(`${getApiBaseUrl()}/properties/seller/listings?${query.toString()}`);
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

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { DealerAccount } from '../../../core/models/buyer.model';
import { getApiBaseUrl } from '../../../core/services/api-config';

interface DealerBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCategory?: string;
  propertyPrice?: number;
  planType: string;
  dealerName: string;
  dealerCompany?: string;
  dealerEmail: string;
  dealerPhone: string;
  bookingAmount?: number;
  bookingStatus: string;
  notes?: string;
  bookingDate: string;
  property?: any;
}

interface DealerRewardSummary {
  totalEarned: number;
  availablePoints: number;
  activeClaim: any | null;
  history: any[];
}

@Component({
  selector: 'app-dealer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dealer-dashboard.component.html',
  styleUrl: './dealer-dashboard.component.css'
})
export class DealerDashboardComponent implements OnInit {
  activeTab = signal<'overview' | 'buy' | 'my-bookings' | 'sell' | 'rewards'>('overview');
  dealer = signal<DealerAccount | null>(null);
  myProperties = signal<Property[]>([]);
  myBookings = signal<DealerBooking[]>([]);
  marketplaceProperties = signal<any[]>([]);
  filteredMarketplace = signal<any[]>([]);
  selectedCategory = signal<string>('all');
  selectedPlanFilter = signal<string>('all');
  searchQuery = signal<string>('');
  isLoadingMarketplace = signal<boolean>(false);
  successBanner = signal<string | null>(null);

  // Dealer Active Plan signal (e.g. null = locked, 'gold' = gold unlocked, 'platinum' = premium unlocked)
  dealerActivePlan = signal<'gold' | 'platinum' | null>(null);

  // Plan Unlock Modal
  planUnlockModalOpen = signal<boolean>(false);
  selectedUnlockTier = signal<'gold' | 'platinum'>('gold');

  // Rewards signal
  rewardsSummary = signal<DealerRewardSummary>({
    totalEarned: 0,
    availablePoints: 0,
    activeClaim: null,
    history: []
  });

  // Booking Modal
  bookingModalOpen = signal<boolean>(false);
  selectedPropForBooking = signal<any | null>(null);
  bookingForm = {
    planType: 'PREMIUM' as 'GOLD' | 'PREMIUM',
    amount: 50000,
    notes: ''
  };
  isSubmittingBooking = signal<boolean>(false);

  // Claim Modal
  claimModalOpen = signal<boolean>(false);
  claimForm = {
    bankName: '',
    accountNo: '',
    ifsc: '',
    holderName: '',
    upiId: ''
  };
  isSubmittingClaim = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    public propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const current = this.authService.currentDealer();
    if (!current) {
      this.router.navigate(['/dealer/login']);
      return;
    }
    this.dealer.set(current);
    this.claimForm.holderName = current.fullName || current.businessName || '';

    // Load active plan from localStorage (if already unlocked in this session)
    const savedPlan = localStorage.getItem('dealer_active_plan');
    if (savedPlan === 'gold' || savedPlan === 'platinum') {
      this.dealerActivePlan.set(savedPlan);
    } else {
      this.dealerActivePlan.set(null);
    }

    this.loadProperties(current.id);
    this.loadDealerBookings(current.email, current.id);
    this.loadMarketplaceProperties();
    this.loadRewardsSummary(current.email);
  }

  isPropUnlocked(prop: any): boolean {
    const plan = this.dealerActivePlan();
    if (!plan) return false;
    if (plan === 'platinum') return true; // Platinum unlocks everything
    if (plan === 'gold') {
      return (prop.planType || '').toUpperCase().includes('GOLD');
    }
    return false;
  }

  openPlanUnlockModal(tier: 'gold' | 'platinum'): void {
    this.selectedUnlockTier.set(tier);
    this.planUnlockModalOpen.set(true);
  }

  closePlanUnlockModal(): void {
    this.planUnlockModalOpen.set(false);
  }

  activatePlan(tier: 'gold' | 'platinum'): void {
    this.dealerActivePlan.set(tier);
    localStorage.setItem('dealer_active_plan', tier);
    this.closePlanUnlockModal();
    const planName = tier === 'gold' ? this.propertyService.goldPlan().name : this.propertyService.platinumPlan().name;
    this.successBanner.set(`🎉 ${planName} Unlocked Successfully! Property titles, valuation, addresses, and contacts are now revealed.`);
  }

  relockForDemo(): void {
    this.dealerActivePlan.set(null);
    localStorage.removeItem('dealer_active_plan');
    this.successBanner.set('🔒 Buying access relocked for demonstration.');
  }

  switchTab(tab: 'overview' | 'buy' | 'my-bookings' | 'sell' | 'rewards'): void {
    this.activeTab.set(tab);
    if (tab === 'buy' && this.marketplaceProperties().length === 0) {
      this.loadMarketplaceProperties();
    }
    if (tab === 'rewards' && this.dealer()) {
      this.loadRewardsSummary(this.dealer()!.email);
    }
    if (tab === 'my-bookings' && this.dealer()) {
      this.loadDealerBookings(this.dealer()!.email, this.dealer()!.id);
    }
  }

  loadProperties(ownerId: string): void {
    const props = this.propertyService.getPropertiesByOwner(ownerId);
    this.myProperties.set(props);
  }

  async loadDealerBookings(email?: string, dealerId?: string): Promise<void> {
    try {
      const q = email ? `email=${encodeURIComponent(email)}` : `dealerId=${encodeURIComponent(dealerId || '')}`;
      const res = await fetch(`${getApiBaseUrl()}/properties/bookings/my?${q}`);
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) {
          this.myBookings.set(data.bookings);
        }
      }
    } catch (err) {
      console.warn('Failed to load dealer bookings from backend:', err);
    }
  }

  async loadMarketplaceProperties(): Promise<void> {
    this.isLoadingMarketplace.set(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/properties/public`);
      if (res.ok) {
        const data = await res.json();
        const rawProps = data.properties || [];
        const formatted = rawProps.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: (p.category || 'all-residential').toLowerCase().replace(/\s+/g, '-'),
          location: p.location,
          city: p.city,
          price: p.price,
          priceDisplay: p.priceDisplay || `₹${(p.price || 0).toLocaleString('en-IN')}`,
          planType: (p.planType || 'PLATINUM').toUpperCase(),
          sellerName: p.sellerName || p.seller?.name || 'Verified Principal / Developer',
          sellerPhone: p.sellerPhone || p.seller?.mobile || '+91 98450 00000',
          imageUrl: p.images && p.images[0]?.imageUrl ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        }));
        this.marketplaceProperties.set(formatted);
        this.applyFilters();
      }
    } catch (err) {
      console.warn('Failed to fetch public marketplace properties:', err);
    } finally {
      this.isLoadingMarketplace.set(false);
    }
  }

  async loadRewardsSummary(email: string): Promise<void> {
    if (!email) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/rewards/dealer-summary?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        this.rewardsSummary.set({
          totalEarned: data.totalEarned || 0,
          availablePoints: data.availablePoints || 0,
          activeClaim: data.activeClaim || null,
          history: data.history || []
        });
      }
    } catch (err) {
      console.warn('Failed to fetch dealer rewards summary:', err);
    }
  }

  onCategoryChange(cat: string): void {
    this.selectedCategory.set(cat);
    this.applyFilters();
  }

  onPlanFilterChange(plan: string): void {
    this.selectedPlanFilter.set(plan);
    this.applyFilters();
  }

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.selectedPlanFilter.set('all');
    this.searchQuery.set('');
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.marketplaceProperties();
    const cat = this.selectedCategory();
    const plan = this.selectedPlanFilter();
    const q = this.searchQuery().trim().toLowerCase();

    if (cat !== 'all') {
      list = list.filter(p => p.category.includes(cat) || cat.includes(p.category));
    }

    if (plan === 'gold') {
      list = list.filter(p => (p.planType || '').includes('GOLD'));
    } else if (plan === 'platinum') {
      list = list.filter(p => !(p.planType || '').includes('GOLD'));
    }

    if (q) {
      list = list.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
      );
    }

    this.filteredMarketplace.set(list);
  }

  getProgressPercent(): number {
    const pts = this.rewardsSummary().availablePoints;
    return Math.min(100, Math.round(((pts % 1000) / 1000) * 100));
  }

  openBookingModal(prop: any): void {
    this.selectedPropForBooking.set(prop);
    this.bookingForm.planType = (prop.planType || '').includes('GOLD') ? 'GOLD' : 'PREMIUM';
    this.bookingForm.amount = 50000;
    this.bookingForm.notes = '';
    this.bookingModalOpen.set(true);
  }

  closeBookingModal(): void {
    this.bookingModalOpen.set(false);
    this.selectedPropForBooking.set(null);
  }

  async submitPropertyBooking(): Promise<void> {
    const prop = this.selectedPropForBooking();
    const curDealer = this.dealer();
    if (!prop || !curDealer) return;

    this.isSubmittingBooking.set(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/properties/${prop.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookerRole: 'DEALER',
          planType: this.bookingForm.planType,
          dealerId: curDealer.id,
          dealerName: curDealer.businessName || curDealer.fullName || 'Dealer Partner',
          dealerCompany: curDealer.businessName || 'Verified Brokerage',
          dealerEmail: curDealer.email,
          dealerPhone: curDealer.mobile || curDealer.phone || '',
          bookingAmount: this.bookingForm.amount,
          notes: this.bookingForm.notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.closeBookingModal();
        this.successBanner.set(data.message || 'Property booked successfully! +500 Dealer Reward Points added to your account.');
        // Refresh bookings and rewards
        await this.loadDealerBookings(curDealer.email, curDealer.id);
        await this.loadRewardsSummary(curDealer.email);
        this.activeTab.set('my-bookings');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to book property');
      }
    } catch (err: any) {
      alert('Network error booking property: ' + (err.message || ''));
    } finally {
      this.isSubmittingBooking.set(false);
    }
  }

  openClaimModal(): void {
    this.claimModalOpen.set(true);
  }

  closeClaimModal(): void {
    this.claimModalOpen.set(false);
  }

  async submitPayoutClaim(): Promise<void> {
    const curDealer = this.dealer();
    if (!curDealer) return;

    if (!this.claimForm.bankName || !this.claimForm.accountNo || !this.claimForm.ifsc || !this.claimForm.holderName) {
      alert('Please fill all mandatory bank details (Bank Name, Account Number, IFSC, Account Holder Name).');
      return;
    }

    this.isSubmittingClaim.set(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: this.claimForm.holderName,
          userEmail: curDealer.email,
          userRole: 'DEALER',
          mobile: curDealer.mobile || curDealer.phone || '',
          points: 1000,
          bankName: this.claimForm.bankName,
          accountNo: this.claimForm.accountNo,
          ifsc: this.claimForm.ifsc,
          holderName: this.claimForm.holderName,
          upiId: this.claimForm.upiId
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.closeClaimModal();
        this.successBanner.set(data.message || 'Reward claim submitted successfully! Admin will disburse ₹1,000 to your bank account.');
        await this.loadRewardsSummary(curDealer.email);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit claim');
      }
    } catch (err: any) {
      alert('Network error submitting claim: ' + (err.message || ''));
    } finally {
      this.isSubmittingClaim.set(false);
    }
  }

  onImgError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  }

  logout(): void {
    this.authService.logoutDealer();
    this.router.navigate(['/']);
  }
}

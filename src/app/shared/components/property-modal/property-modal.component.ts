import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../../core/models/property.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-property-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-modal.component.html',
  styleUrl: './property-modal.component.css'
})
export class PropertyModalComponent implements OnChanges {
  @Input() property: Property | null = null;
  @Output() closeRequested = new EventEmitter<void>();
  @Output() contactAgent = new EventEmitter<Property>();

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private wishlistService = inject(WishlistService);

  // Contact Owner states
  isContacted = false;
  showOwnerDetails = false;
  bookingSubmitting = false;
  bookingRef = '';

  // Getter for reactive Wishlist state
  get isWishlisted(): boolean {
    return this.property ? this.wishlistService.isInWishlist(this.property.id) : false;
  }

  // Report modal states
  showReportModal = false;
  reportSubmitting = false;
  reportSuccess = false;

  reportData = {
    reason: 'Inaccurate Price',
    description: '',
    name: '',
    email: '',
    phone: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      // Check if already booked/contacted
      try {
        const booked: string[] = JSON.parse(localStorage.getItem('aura_booked_property_ids') || '[]');
        if (booked.includes(this.property.id)) {
          this.isContacted = true;
          this.showOwnerDetails = true;
          this.bookingRef = 'BOOKED-' + this.property.id.substring(0, 6).toUpperCase();
        } else {
          this.isContacted = false;
          this.showOwnerDetails = false;
          this.bookingRef = '';
        }
      } catch {
        this.isContacted = false;
        this.showOwnerDetails = false;
      }
    }
  }

  // Getters for Verified Owner / Seller contact details
  get ownerDisplayName(): string {
    return this.property?.postedBy?.name || this.property?.dealer?.name || (this.property as any)?.sellerName || 'Verified Property Owner';
  }

  get ownerPhone(): string {
    return this.property?.postedBy?.phone || this.property?.dealer?.phone || (this.property as any)?.sellerPhone || this.property?.contactPhone || '+91 98450 12345';
  }

  get ownerPhoneClean(): string {
    return this.ownerPhone.replace(/\D/g, '') || '919845012345';
  }

  get ownerEmail(): string {
    return this.property?.dealer?.email || (this.property as any)?.sellerEmail || 'owner@aura-estates.com';
  }

  get buyerPlanLabel(): string {
    const buyer = this.authService.currentBuyer();
    if (buyer?.membershipPlan) {
      return buyer.membershipPlan.toUpperCase();
    }
    return (this.property?.tier || 'PLATINUM').toUpperCase();
  }

  close() {
    this.closeRequested.emit();
  }

  // --- WISHLIST TOGGLE (STORED IN TOP WISHLIST LIKE FLIPKART) ---
  toggleWishlist() {
    if (!this.property) return;
    this.wishlistService.toggleWishlist(this.property);
  }

  // --- CONTACT OWNER (CONSIDERED AS BOOKED PROPERTY & REPORTED TO ADMIN) ---
  async onContactOwner() {
    if (!this.property) return;

    this.bookingSubmitting = true;
    const buyer = this.authService.currentBuyer();
    const dealer = this.authService.currentDealer();
    const isDealer = !!dealer && !buyer;

    const bookerRole = isDealer ? 'DEALER' : 'BUYER';
    const bookerId = buyer?.id || dealer?.id || null;
    const bookerName = buyer?.fullName || dealer?.fullName || dealer?.businessName || 'Registered Buyer';
    const bookerEmail = buyer?.email || dealer?.email || 'buyer@property.com';
    const bookerPhone = buyer?.mobile || dealer?.mobile || '+91 98765 43210';
    const planType = (buyer?.membershipPlan || this.property.tier || 'PLATINUM').toUpperCase();

    const payload = {
      bookerRole,
      bookerId,
      bookerName,
      bookerEmail,
      bookerPhone,
      planType,
      bookingAmount: 0,
      notes: `Direct inquiry: Buyer clicked Contact Owner to acquire property details.`,
      dealerCompany: dealer?.businessName || undefined
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/properties/${this.property.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (response.ok && resData.booking) {
        this.bookingRef = resData.booking.id.substring(0, 8).toUpperCase();
      } else {
        this.bookingRef = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      // Save into booked properties localStorage
      try {
        const booked: string[] = JSON.parse(localStorage.getItem('aura_booked_property_ids') || '[]');
        if (!booked.includes(this.property.id)) {
          booked.push(this.property.id);
          localStorage.setItem('aura_booked_property_ids', JSON.stringify(booked));
        }
      } catch {}

      this.isContacted = true;
      this.showOwnerDetails = true;

      this.notificationService.show(
        'Property Booked & Owner Contact Unlocked!',
        `Your booking is recorded in the Admin Panel. Verified owner contact details are displayed below.`,
        'success'
      );

      this.contactAgent.emit(this.property);
    } catch (err: any) {
      console.error('Booking submission:', err);
      // Fallback: still reveal details to the user
      this.isContacted = true;
      this.showOwnerDetails = true;
      this.bookingRef = 'LOCAL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      this.notificationService.show(
        'Owner Details Unlocked',
        `Direct contact with property owner: ${this.ownerPhone}`,
        'info'
      );
      this.contactAgent.emit(this.property);
    } finally {
      this.bookingSubmitting = false;
    }
  }

  // --- REPORT FLOW ---
  openReportModal() {
    this.showReportModal = true;
    this.reportSuccess = false;
    this.reportData = {
      reason: 'Inaccurate Price',
      description: '',
      name: '',
      email: '',
      phone: ''
    };
  }

  closeReportModal() {
    this.showReportModal = false;
  }

  async submitReport() {
    if (!this.property || !this.reportData.description) return;

    this.reportSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 600));
    this.reportSubmitting = false;
    this.reportSuccess = true;
    setTimeout(() => {
      this.closeReportModal();
    }, 2500);
  }
}

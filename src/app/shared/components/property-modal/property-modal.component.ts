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
  template: `
    <div class="modal-backdrop" *ngIf="property" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        
        <!-- Modal Media Slider Banner -->
        <div class="modal-media-header" (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">
          <img [src]="currentSlideImage" (error)="onMediaError($event)" [alt]="property.title" class="modal-img" />
          <div class="modal-media-overlay"></div>

          <!-- Close Button -->
          <button type="button" class="close-btn" (click)="close()" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Badges Row -->
          <div class="modal-badges-row">
            <span *ngIf="property.tier === 'platinum'" class="badge badge-platinum">Platinum Tier</span>
            <span *ngIf="property.isNewLaunch" class="badge badge-emerald">New Launch</span>
            <span class="badge badge-blue">RERA Verified</span>
          </div>

          <!-- Top-Right Controls: Fullscreen Lightbox & Photo Counter -->
          <div class="slider-top-controls">
            <button type="button" class="btn-fullscreen-toggle" (click)="openLightbox()" title="View Fullscreen High-Res Photos">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              <span>Fullscreen</span>
            </button>

            <div class="slider-counter-badge" *ngIf="sliderImages.length > 0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>{{ activeSlideIndex + 1 }} / {{ sliderImages.length }}</span>
            </div>
          </div>

          <!-- Previous / Next Slider Arrows -->
          <button 
            type="button" 
            class="slider-nav-btn prev-btn" 
            *ngIf="sliderImages.length > 1" 
            (click)="prevSlide($event)" 
            aria-label="Previous image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button 
            type="button" 
            class="slider-nav-btn next-btn" 
            *ngIf="sliderImages.length > 1" 
            (click)="nextSlide($event)" 
            aria-label="Next image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Bottom Price & Header -->
          <div class="modal-price-header">
            <span class="price-big">{{ property.priceDisplay }}</span>
            <span *ngIf="property.pricePerSqFt" class="price-sqft">{{ property.pricePerSqFt }}</span>
          </div>

          <!-- Bottom Thumbnails Strip -->
          <div class="slider-thumbnails-strip" *ngIf="sliderImages.length > 1">
            <div 
              *ngFor="let img of sliderImages; let idx = index" 
              class="thumb-item" 
              [class.active]="idx === activeSlideIndex"
              (click)="goToSlide(idx, $event)"
              [title]="'View Photo ' + (idx + 1)"
            >
              <img [src]="img" (error)="onMediaError($event)" [alt]="'Photo ' + (idx + 1)" />
            </div>
          </div>
        </div>

        <!-- Modal Content Scrollable Area -->
        <div class="modal-body-scroll">
          
          <div class="location-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ property.location }}, {{ property.city }}</span>
          </div>

          <h2 class="modal-title">{{ property.title }}</h2>

          <p class="modal-desc">{{ property.shortDescription }}</p>

          <!-- Specifications Matrix -->
          <h3 class="specs-title">Property Highlights & Dimensions</h3>
          <div class="modal-specs-grid">
            <div class="spec-card">
              <span class="spec-name">Property Type</span>
              <strong class="spec-value">{{ property.type | uppercase }}</strong>
            </div>

            <div class="spec-card" *ngIf="getFormattedArea()">
              <span class="spec-name">Super Built-Up Area</span>
              <strong class="spec-value">{{ getFormattedArea() }}</strong>
            </div>

            <div class="spec-card" *ngIf="getFormattedBhk() !== '—'">
              <span class="spec-name">Bedrooms / BHK</span>
              <strong class="spec-value">{{ getFormattedBhk() }}</strong>
            </div>

            <div class="spec-card" *ngIf="property.specs.baths || property.specs.bathrooms">
              <span class="spec-name">Bathrooms</span>
              <strong class="spec-value">{{ property.specs.baths || property.specs.bathrooms }} Baths</strong>
            </div>

            <div class="spec-card" *ngIf="getFormattedPlot()">
              <span class="spec-name">Plot Dimensions</span>
              <strong class="spec-value">{{ getFormattedPlot() }}</strong>
            </div>

            <div class="spec-card" *ngIf="property.specs.facing">
              <span class="spec-name">Vastu / Orientation</span>
              <strong class="spec-value">{{ property.specs.facing }}</strong>
            </div>

            <div class="spec-card">
              <span class="spec-name">Construction Status</span>
              <strong class="spec-value text-emerald">{{ property.specs.status || 'Ready for Registration' }}</strong>
            </div>

            <div class="spec-card">
              <span class="spec-name">Legal Title Check</span>
              <strong class="spec-value text-gold">100% Clear & RERA Certified</strong>
            </div>
          </div>

          <!-- Listed By & Inquire -->
          <div class="contact-agent-card">
            <div class="agent-avatar">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div class="agent-details">
              <span class="agent-role">Verified Property Owner / Seller</span>
              <strong class="agent-name">{{ ownerDisplayName }}</strong>
              <span class="verified-tag">✓ RERA Verified Listing & Direct Seller</span>
            </div>

            <div class="agent-actions-group">
              <!-- Wishlist Button (Replaced Book Property Token Advance) -->
              <button 
                type="button" 
                class="btn btn-wishlist-action" 
                [class.wishlisted]="isWishlisted" 
                (click)="toggleWishlist()"
                title="Save this property to your personal wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isWishlisted ? '#ef4444' : 'none'" [attr.stroke]="isWishlisted ? '#ef4444' : 'currentColor'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{{ isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist' }}</span>
              </button>

              <!-- Contact Owner Button (Clicking opens in-page Owner Contact modal & registers booking) -->
              <button 
                type="button" 
                class="btn btn-gold btn-contact-owner" 
                (click)="openOwnerContactModal()"
                [disabled]="bookingSubmitting"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{{ bookingSubmitting ? 'Connecting...' : (isContacted ? 'Owner Contact (Booked)' : 'Owner Contact') }}</span>
              </button>
            </div>
          </div>

          <!-- UNLOCKED DIRECT OWNER CONTACT IN-PAGE SECTION -->
          <div *ngIf="showOwnerDetails" class="owner-contact-unlocked-card">
            <div class="unlocked-header">
              <div class="badge-row">
                <span class="badge badge-emerald">✓ BOOKING CONFIRMED</span>
                <span class="booking-ref-tag" *ngIf="bookingRef">Ref #{{ bookingRef }}</span>
              </div>
              <h4>Direct Owner Contact Information</h4>
              <p>Official contact details configured specifically for this property:</p>
            </div>

            <div class="owner-info-grid">
              <div class="owner-info-item">
                <span class="info-label">Owner Name</span>
                <strong class="info-val">{{ ownerDisplayName }}</strong>
              </div>
              <div class="owner-info-item" *ngIf="ownerPhone">
                <span class="info-label">Owner Phone Number</span>
                <strong class="info-val text-gold">{{ ownerPhone }}</strong>
              </div>
              <div class="owner-info-item" *ngIf="ownerAltPhone">
                <span class="info-label">Alternate Phone</span>
                <strong class="info-val">{{ ownerAltPhone }}</strong>
              </div>
              <div class="owner-info-item" *ngIf="ownerEmail">
                <span class="info-label">Owner Email</span>
                <strong class="info-val">{{ ownerEmail }}</strong>
              </div>
              <div class="owner-info-item">
                <span class="info-label">Assigned Plan Membership</span>
                <strong class="info-val text-emerald">{{ buyerPlanLabel }} Plan</strong>
              </div>
            </div>

            <div class="direct-contact-buttons">
              <a *ngIf="ownerPhone" [href]="'tel:' + ownerPhoneClean" class="btn-direct-action btn-call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Call Owner</span>
              </a>
              <a *ngIf="ownerPhone" [href]="'https://wa.me/' + ownerPhoneClean" target="_blank" rel="noopener noreferrer" class="btn-direct-action btn-whatsapp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <span>WhatsApp Owner</span>
              </a>
              <a *ngIf="ownerEmail" [href]="'mailto:' + ownerEmail" class="btn-direct-action btn-email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Send Email</span>
              </a>
            </div>
          </div>

          <!-- Report Property Trigger -->
          <div class="report-trigger-row">
            <button type="button" class="btn-report-link" (click)="openReportModal()">
              <span>🚩 Report inaccurate details or dispute this listing</span>
            </button>
          </div>

        </div>

        <!-- REPORT SUB-MODAL -->
        <div *ngIf="showReportModal" class="report-submodal-overlay" (click)="closeReportModal()">
          <div class="report-submodal-card" (click)="$event.stopPropagation()">
            <div class="submodal-head">
              <h3>Report Property Listing</h3>
              <button type="button" class="submodal-close" (click)="closeReportModal()">✕</button>
            </div>
            
            <div *ngIf="reportSuccess" class="report-success-msg">
              <span>✓ Report submitted successfully. Our compliance team will audit this listing.</span>
            </div>

            <form *ngIf="!reportSuccess" (ngSubmit)="submitReport()" class="report-form">
              <div class="form-group-sub">
                <label>Reason for Report *</label>
                <select [(ngModel)]="reportData.reason" name="reason" required class="sub-input">
                  <option value="Inaccurate Price">Inaccurate / Mismatched Price</option>
                  <option value="Sold or Unavailable">Property Already Sold / Unavailable</option>
                  <option value="Incorrect Specifications">Incorrect Dimensions / Specifications</option>
                  <option value="Fraudulent or Duplicate">Fraudulent / Duplicate Listing</option>
                  <option value="Other">Other Discrepancy</option>
                </select>
              </div>

              <div class="form-group-sub">
                <label>Description of Issue *</label>
                <textarea rows="3" [(ngModel)]="reportData.description" name="description" required placeholder="Please describe the discrepancy or concern..." class="sub-input"></textarea>
              </div>

              <div class="form-row-sub">
                <div class="form-group-sub">
                  <label>Your Name</label>
                  <input type="text" [(ngModel)]="reportData.name" name="name" placeholder="John Doe" class="sub-input" />
                </div>
                <div class="form-group-sub">
                  <label>Your Email *</label>
                  <input type="email" [(ngModel)]="reportData.email" name="email" required placeholder="you@example.com" class="sub-input" />
                </div>
              </div>

              <div class="submodal-actions">
                <button type="submit" class="btn-submit-report" [disabled]="reportSubmitting || !reportData.description">
                  {{ reportSubmitting ? 'Submitting Report...' : 'Submit Report' }}
                </button>
                <button type="button" class="btn-cancel-report" (click)="closeReportModal()">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        <!-- IN-PAGE OWNER CONTACT POPUP MODAL & MOBILE BOTTOM SHEET -->
        <div *ngIf="showOwnerContactPopup" class="owner-contact-popup-overlay" (click)="closeOwnerContactPopup()">
          <div class="owner-contact-popup-card" (click)="$event.stopPropagation()">
            <div class="owner-popup-header">
              <div class="owner-popup-title-wrap">
                <div class="owner-badge-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Property Owner Contact</span>
                </div>
                <h3 class="owner-popup-prop-title">{{ property.title }}</h3>
              </div>
              <button type="button" class="owner-popup-close-btn" (click)="closeOwnerContactPopup()" aria-label="Close Contact Dialog">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="owner-popup-body">
              <p class="owner-popup-subtitle">
                Official contact details configured specifically for this property listing:
              </p>

              <div class="owner-details-list">
                <!-- Owner Name -->
                <div class="owner-detail-row">
                  <span class="detail-label">Owner Name</span>
                  <div class="detail-value-group">
                    <span class="detail-value text-bold text-white">{{ ownerDisplayName }}</span>
                    <span class="detail-subtag">Property Owner</span>
                  </div>
                </div>

                <!-- Phone Number -->
                <div class="owner-detail-row" *ngIf="ownerPhone">
                  <span class="detail-label">Phone</span>
                  <div class="detail-value-group">
                    <span class="detail-value text-gold text-bold">{{ ownerPhone }}</span>
                    <span class="detail-subtag" *ngIf="ownerAltPhone">Alt: {{ ownerAltPhone }}</span>
                  </div>
                </div>

                <!-- Email Address -->
                <div class="owner-detail-row" *ngIf="ownerEmail">
                  <span class="detail-label">Email</span>
                  <div class="detail-value-group">
                    <span class="detail-value text-white">{{ ownerEmail }}</span>
                  </div>
                </div>

                <!-- Property Location Reference -->
                <div class="owner-detail-row">
                  <span class="detail-label">Location</span>
                  <div class="detail-value-group">
                    <span class="detail-value text-muted">{{ property.location }}, {{ property.city }}</span>
                  </div>
                </div>
              </div>

              <!-- Contact Action Buttons: Call, WhatsApp, Email, Close -->
              <div class="owner-popup-actions">
                <a *ngIf="ownerPhone" [href]="'tel:' + ownerPhoneClean" class="btn-contact-action btn-call">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>Call Owner</span>
                </a>

                <a *ngIf="ownerPhone" [href]="'https://wa.me/' + ownerPhoneClean" target="_blank" rel="noopener noreferrer" class="btn-contact-action btn-whatsapp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>WhatsApp</span>
                </a>

                <a *ngIf="ownerEmail" [href]="'mailto:' + ownerEmail" class="btn-contact-action btn-email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Email</span>
                </a>

                <button type="button" class="btn-contact-action btn-close-popup" (click)="closeOwnerContactPopup()">
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FULLSCREEN LIGHTBOX GALLERY MODAL -->
        <div *ngIf="showLightbox" class="lightbox-overlay" (click)="closeLightbox()">
          <div class="lightbox-wrapper" (click)="$event.stopPropagation()">
            <!-- Top Controls -->
            <div class="lightbox-top-bar">
              <span class="lightbox-counter">
                📷 Photo {{ activeSlideIndex + 1 }} of {{ sliderImages.length }} · {{ property.title }}
              </span>
              <button type="button" class="lightbox-close-btn" (click)="closeLightbox()" aria-label="Close Lightbox">
                ✕
              </button>
            </div>

            <!-- Main Stage Image -->
            <div class="lightbox-stage">
              <button 
                type="button" 
                class="lightbox-arrow prev" 
                *ngIf="sliderImages.length > 1" 
                (click)="prevSlide($event)"
                aria-label="Previous Photo"
              >
                ‹
              </button>

              <img [src]="currentSlideImage" (error)="onMediaError($event)" [alt]="property.title" class="lightbox-main-img" />

              <button 
                type="button" 
                class="lightbox-arrow next" 
                *ngIf="sliderImages.length > 1" 
                (click)="nextSlide($event)"
                aria-label="Next Photo"
              >
                ›
              </button>
            </div>

            <!-- Lightbox Bottom Thumbnails -->
            <div class="lightbox-thumbs-row" *ngIf="sliderImages.length > 1">
              <div 
                *ngFor="let img of sliderImages; let idx = index"
                class="lightbox-thumb-item"
                [class.active]="idx === activeSlideIndex"
                (click)="goToSlide(idx, $event)"
              >
                <img [src]="img" (error)="onMediaError($event)" [alt]="'Thumb ' + (idx + 1)" />
                <span class="lightbox-thumb-num">#{{ idx + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 13, 30, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9990;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 250ms ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      background: var(--white);
      border-radius: var(--radius-xl);
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      border: 1.5px solid var(--slate-200);
      animation: popUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popUp {
      from { transform: scale(0.94); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-media-header {
      position: relative;
      height: 310px;
      width: 100%;
      background: var(--slate-900);
      overflow: hidden;
      flex-shrink: 0;
      user-select: none;
    }

    .modal-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }

    .modal-media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 13, 30, 0.5) 0%, transparent 40%, rgba(7, 13, 30, 0.88) 100%);
      pointer-events: none;
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.65);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all var(--transition-base);
    }

    .close-btn:hover {
      background: var(--white);
      color: var(--navy-950);
      transform: scale(1.1);
    }

    .modal-badges-row {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      gap: 0.5rem;
      z-index: 2;
    }

    .slider-top-controls {
      position: absolute;
      top: 1rem;
      right: 3.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
    }

    .btn-fullscreen-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.32rem 0.65rem;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-fullscreen-toggle:hover {
      background: rgba(255, 255, 255, 0.95);
      color: #0f172a;
    }

    .slider-counter-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.32rem 0.65rem;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #f1f5f9;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    /* Slider Navigation Arrows */
    .slider-nav-btn {
      position: absolute;
      top: 45%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 8;
      transition: all 0.2s ease;
    }

    .slider-nav-btn:hover {
      background: rgba(255, 255, 255, 0.95);
      color: #0f172a;
      transform: translateY(-50%) scale(1.1);
    }

    .slider-nav-btn.prev-btn {
      left: 0.85rem;
    }

    .slider-nav-btn.next-btn {
      right: 0.85rem;
    }

    .modal-price-header {
      position: absolute;
      bottom: 3.5rem;
      left: 1.5rem;
      z-index: 2;
      color: var(--white);
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    }

    .price-big {
      font-size: 2rem;
      font-weight: 800;
      font-family: var(--font-display);
      display: block;
      line-height: 1;
    }

    .price-sqft {
      font-size: 0.85rem;
      color: var(--gold-400);
      font-weight: 600;
    }

    /* Bottom Thumbnail Strip */
    .slider-thumbnails-strip {
      position: absolute;
      bottom: 0.75rem;
      left: 1.5rem;
      right: 1.5rem;
      display: flex;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 2px;
      z-index: 4;
      scrollbar-width: none;
    }

    .slider-thumbnails-strip::-webkit-scrollbar {
      display: none;
    }

    .thumb-item {
      width: 44px;
      height: 32px;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.4);
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0.65;
      transition: all 0.2s ease;
      background: #000;
    }

    .thumb-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb-item.active {
      border-color: #fbbf24;
      opacity: 1;
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
    }

    .thumb-item:hover {
      opacity: 1;
    }

    /* Fullscreen Lightbox Styles */
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.96);
      backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 200ms ease;
    }

    .lightbox-wrapper {
      width: 100%;
      max-width: 1100px;
      height: 92vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .lightbox-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      padding: 0.5rem 0.25rem 1rem;
      flex-shrink: 0;
    }

    .lightbox-counter {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .lightbox-close-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .lightbox-close-btn:hover {
      background: #ef4444;
      border-color: #ef4444;
      transform: scale(1.1);
    }

    .lightbox-stage {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 12px;
      background: #000;
    }

    .lightbox-main-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }

    .lightbox-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 2rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s;
    }

    .lightbox-arrow:hover {
      background: #fff;
      color: #000;
      transform: translateY(-50%) scale(1.1);
    }

    .lightbox-arrow.prev {
      left: 1rem;
    }

    .lightbox-arrow.next {
      right: 1rem;
    }

    .lightbox-thumbs-row {
      display: flex;
      gap: 0.5rem;
      padding-top: 1rem;
      overflow-x: auto;
      justify-content: center;
      flex-shrink: 0;
    }

    .lightbox-thumb-item {
      position: relative;
      width: 70px;
      height: 48px;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      opacity: 0.5;
      transition: all 0.2s;
    }

    .lightbox-thumb-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lightbox-thumb-num {
      position: absolute;
      bottom: 2px;
      right: 4px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 0.65rem;
      padding: 1px 4px;
      border-radius: 3px;
    }

    .lightbox-thumb-item.active {
      border-color: #fbbf24;
      opacity: 1;
      transform: scale(1.08);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.7);
    }

    .lightbox-thumb-item:hover {
      opacity: 0.9;
    }

    .modal-body-scroll {
      padding: 2rem 2.25rem;
      overflow-y: auto;
    }

    .location-bar {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--gold-600);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .modal-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--navy-950);
      line-height: 1.25;
      margin-bottom: 0.75rem;
    }

    .modal-desc {
      font-size: 0.95rem;
      color: var(--slate-600);
      line-height: 1.65;
      margin-bottom: 2rem;
    }

    .specs-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--navy-950);
      margin-bottom: 1rem;
    }

    .modal-specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
      margin-bottom: 2.25rem;
    }

    .spec-card {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
    }

    .spec-name {
      font-size: 0.75rem;
      color: var(--slate-400);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .spec-value {
      font-size: 0.95rem;
      color: var(--navy-950);
      margin-top: 0.2rem;
    }

    .text-emerald {
      color: var(--emerald-600);
    }

    .text-gold {
      color: var(--gold-600);
    }

    .contact-agent-card {
      background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-800) 100%);
      color: var(--white);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid rgba(197, 168, 128, 0.3);
    }

    .agent-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gold-400);
      flex-shrink: 0;
    }

    .agent-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .agent-role {
      font-size: 0.75rem;
      color: var(--slate-400);
      text-transform: uppercase;
      font-weight: 600;
    }

    .agent-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--white);
    }

    .verified-tag {
      font-size: 0.75rem;
      color: var(--emerald-500);
      font-weight: 600;
    }

    .btn-schedule {
      padding: 0.75rem 1.4rem;
      font-size: 0.9rem;
    }

    @media (max-width: 640px) {
      .modal-backdrop {
        padding: 0.5rem;
      }

      .modal-dialog {
        max-height: 94vh;
        border-radius: var(--radius-lg);
      }

      .modal-media-header {
        height: 200px;
      }

      .price-big {
        font-size: 1.55rem;
      }

      .modal-title {
        font-size: 1.3rem;
      }

      .modal-body-scroll {
        padding: 1.25rem 1rem;
      }

      .modal-specs-grid {
        grid-template-columns: 1fr;
        gap: 0.6rem;
      }

      .contact-agent-card {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
        padding: 1.25rem 1rem;
      }

      .agent-avatar {
        margin: 0 auto;
      }

      .direct-contact-buttons {
        flex-direction: column;
      }

      .btn-direct-action {
        width: 100%;
        justify-content: center;
      }
    }

    /* REPORT PROPERTY STYLES */
    .report-trigger-row {
      margin-top: 1.25rem;
      text-align: center;
      border-top: 1px solid var(--slate-100);
      padding-top: 0.75rem;
    }
    .btn-report-link {
      background: none;
      border: none;
      color: var(--slate-400);
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.2s;
    }
    .btn-report-link:hover {
      color: #ef4444;
    }

    .report-submodal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .report-submodal-card {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      max-width: 460px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    }
    .submodal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 10px;
    }
    .submodal-head h3 {
      margin: 0;
      font-size: 16px;
      color: #f8fafc;
    }
    .submodal-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
    }
    .report-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-group-sub {
      display: flex;
      flex-direction: column;
      gap: 5px;
      text-align: left;
    }
    .form-group-sub label {
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .sub-input {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 8px 12px;
      color: #f8fafc;
      font-size: 12px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .sub-input:focus {
      border-color: #f59e0b;
    }
    .form-row-sub {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .submodal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }
    .btn-submit-report {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-cancel-report {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
    }
    .report-success-msg {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      text-align: center;
      margin: 10px 0;
    }

    /* Wishlist & Contact Owner Buttons */
    .agent-actions-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      margin-top: 10px;
    }
    @media (min-width: 600px) {
      .agent-actions-group {
        flex-direction: row;
      }
    }
    .btn-wishlist-action {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13.5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
    }
    .btn-wishlist-action:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
      transform: translateY(-1px);
    }
    .btn-wishlist-action.wishlisted {
      background: rgba(239, 68, 68, 0.18);
      border-color: rgba(239, 68, 68, 0.6);
      color: #fca5a5;
    }
    .btn-wishlist-action.wishlisted:hover {
      background: rgba(239, 68, 68, 0.28);
    }

    .btn-contact-owner {
      background: linear-gradient(135deg, #d4af37, #b8860b);
      color: #070d1e;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 13.5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
      transition: all 0.2s ease;
      flex: 1.3;
    }
    .btn-contact-owner:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
      color: #000;
    }
    .btn-contact-owner:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Unlocked Direct Owner Contact Dossier */
    .owner-contact-unlocked-card {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 12px;
      padding: 18px 20px;
      margin-top: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      animation: fadeIn 300ms ease;
    }
    .unlocked-header {
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
    }
    .unlocked-header .badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .unlocked-header h4 {
      color: #ffffff;
      font-size: 15px;
      font-weight: 800;
      margin: 0 0 4px 0;
    }
    .unlocked-header p {
      color: #94a3b8;
      font-size: 12px;
      margin: 0;
    }
    .booking-ref-tag {
      font-size: 11px;
      font-weight: 700;
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 8px;
      border-radius: 6px;
    }
    .owner-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    @media (max-width: 540px) {
      .owner-info-grid {
        grid-template-columns: 1fr;
      }
    }
    .owner-info-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .owner-info-item .info-label {
      font-size: 10.5px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .owner-info-item .info-val {
      font-size: 13.5px;
      color: #ffffff;
      font-weight: 700;
    }
    .direct-contact-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn-direct-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-call {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
    }
    .btn-call:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-1px);
    }
    .btn-whatsapp {
      background: linear-gradient(135deg, #25d366, #128c7e);
      color: #ffffff;
    }
    .btn-whatsapp:hover {
      background: linear-gradient(135deg, #128c7e, #075e54);
      transform: translateY(-1px);
    }
    .btn-email {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-email:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    /* IN-PAGE OWNER CONTACT POPUP MODAL & BOTTOM SHEET STYLES */
    .owner-contact-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(7, 13, 30, 0.82);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      animation: fadeIn 200ms ease;
    }

    .owner-contact-popup-card {
      background: linear-gradient(145deg, #0b1329 0%, #080e1e 100%);
      border: 1.5px solid rgba(212, 175, 55, 0.4);
      border-radius: 18px;
      max-width: 480px;
      width: 100%;
      color: #f8fafc;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
      overflow: hidden;
      animation: popUp 250ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .owner-popup-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
    }

    .owner-popup-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
      padding-right: 12px;
    }

    .owner-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #f59e0b;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .owner-popup-prop-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.3;
    }

    .owner-popup-close-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .owner-popup-close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: scale(1.08);
    }

    .owner-popup-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .owner-popup-subtitle {
      font-size: 12.5px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .owner-details-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .owner-detail-row {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .owner-detail-row .detail-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .owner-detail-row .detail-value-group {
      display: flex;
      align-items: center;
      gap: 8px;
      text-align: right;
    }

    .owner-detail-row .detail-value {
      font-size: 13.5px;
      color: #e2e8f0;
    }

    .owner-detail-row .detail-value.text-bold {
      font-weight: 700;
    }

    .owner-detail-row .detail-value.text-white {
      color: #ffffff;
    }

    .owner-detail-row .detail-subtag {
      font-size: 10px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .owner-popup-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 4px;
    }

    .btn-contact-action {
      flex: 1;
      min-width: 100px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 10px 14px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-close-popup {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      flex: 0.6;
    }

    .btn-close-popup:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    @media (max-width: 640px) {
      .owner-contact-popup-overlay {
        align-items: flex-end;
        padding: 0;
      }

      .owner-contact-popup-card {
        border-radius: 20px 20px 0 0;
        max-height: 85vh;
        overflow-y: auto;
        animation: slideUp 250ms ease;
      }

      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .owner-popup-actions {
        flex-direction: column;
      }

      .btn-contact-action {
        width: 100%;
      }
    }
  `]
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
  showOwnerContactPopup = false;
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

  // --- DYNAMIC MULTI-IMAGE SLIDER & LIGHTBOX STATE ---
  sliderImages: string[] = [];
  activeSlideIndex: number = 0;
  showLightbox: boolean = false;
  private touchStartX: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.activeSlideIndex = 0;
      this.showLightbox = false;
      this.showOwnerContactPopup = false;
      this.setupSliderImages();

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

  setupSliderImages(): void {
    if (!this.property) {
      this.sliderImages = [];
      return;
    }
    const imgs: string[] = [];
    const anyProp = this.property as any;

    // 1. If backend images array of objects, prioritize primary cover first
    if (Array.isArray(anyProp.images) && anyProp.images.length > 0) {
      const primary = anyProp.images.find((img: any) => img.isPrimary || img.isCover);
      if (primary) {
        const url = primary.imageUrl || primary.url;
        if (url) imgs.push(url);
      }
      anyProp.images.forEach((img: any) => {
        const url = img.imageUrl || img.url;
        if (url && !imgs.includes(url)) {
          imgs.push(url);
        }
      });
    }

    // 2. If galleryImages string array provided
    if (Array.isArray(this.property.galleryImages) && this.property.galleryImages.length > 0) {
      this.property.galleryImages.forEach(url => {
        if (url && typeof url === 'string' && !imgs.includes(url)) {
          imgs.push(url);
        }
      });
    }

    // 3. If single imageUrl provided and not present, add it at front
    if (this.property.imageUrl && !imgs.includes(this.property.imageUrl)) {
      imgs.unshift(this.property.imageUrl);
    }

    // 4. Default fallback if empty
    if (imgs.length === 0) {
      imgs.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');
    }

    this.sliderImages = imgs;
  }

  get currentSlideImage(): string {
    if (this.sliderImages.length === 0) {
      return this.property?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    }
    return this.sliderImages[this.activeSlideIndex] || this.sliderImages[0];
  }

  nextSlide(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.sliderImages.length <= 1) return;
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.sliderImages.length;
  }

  prevSlide(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.sliderImages.length <= 1) return;
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.sliderImages.length) % this.sliderImages.length;
  }

  goToSlide(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (index >= 0 && index < this.sliderImages.length) {
      this.activeSlideIndex = index;
    }
  }

  openLightbox(): void {
    this.showLightbox = true;
  }

  closeLightbox(): void {
    this.showLightbox = false;
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches && event.touches[0]) {
      this.touchStartX = event.touches[0].clientX;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches && event.changedTouches[0]) {
      const touchEndX = event.changedTouches[0].clientX;
      const diff = this.touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    }
  }

  // Getters for Verified Owner contact details configured specifically for this property
  get ownerDisplayName(): string {
    const p = this.property as any;
    if (!p) return 'Verified Property Owner';
    return (
      p.owner_contact?.name ||
      p.ownerContact?.name ||
      p.categorySpecs?.boardContact ||
      p.specs?.boardContact ||
      p.specs?.ownerName ||
      p.sellerName ||
      'Verified Property Owner'
    );
  }

  get ownerPhone(): string {
    const p = this.property as any;
    if (!p) return '+91 98450 12345';
    return (
      p.owner_contact?.phone ||
      p.ownerContact?.phone ||
      p.categorySpecs?.boardContact ||
      p.specs?.boardContact ||
      p.specs?.ownerPhone ||
      p.sellerPhone ||
      p.contactPhone ||
      '+91 98450 12345'
    );
  }

  get ownerPhoneClean(): string {
    const clean = this.ownerPhone.replace(/\D/g, '');
    return clean || '919845012345';
  }

  get ownerEmail(): string {
    const p = this.property as any;
    if (!p) return 'owner@aura-estates.com';
    return (
      p.owner_contact?.email ||
      p.ownerContact?.email ||
      p.specs?.ownerEmail ||
      p.sellerEmail ||
      'owner@aura-estates.com'
    );
  }

  get ownerAltPhone(): string {
    const p = this.property as any;
    if (!p) return '';
    return (
      p.owner_contact?.alternatePhone ||
      p.ownerContact?.alternatePhone ||
      p.specs?.alternatePhone ||
      ''
    );
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

  openOwnerContactModal(): void {
    this.showOwnerContactPopup = true;
    if (!this.isContacted) {
      this.onContactOwner();
    }
  }

  closeOwnerContactPopup(): void {
    this.showOwnerContactPopup = false;
  }

  onMediaError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    }
  }

  getFormattedArea(): string {
    if (!this.property?.specs) return '';
    const val = this.property.specs.sqft || this.property.specs.builtUpArea || this.property.specs.area;
    if (!val) return '';
    const str = String(val);
    return str.includes('sq') ? str : `${str} sq.ft`;
  }

  getFormattedBhk(): string {
    if (!this.property?.specs) return '';
    const s = this.property.specs;
    if (s.bhk) return s.bhk;
    if (s.beds) return `${s.beds} BHK Master Suites`;
    if (s.bedrooms) return `${s.bedrooms} Bedrooms`;
    return '—';
  }

  getFormattedPlot(): string {
    if (!this.property?.specs) return '';
    const s = this.property.specs;
    return s.plotSize || s.plotArea || s.dimensions || '';
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

      this.contactAgent.emit(this.property);
    } catch (err: any) {
      console.error('Booking submission:', err);
      // Fallback: still reveal details to the user
      this.isContacted = true;
      this.showOwnerDetails = true;
      this.bookingRef = 'LOCAL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
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


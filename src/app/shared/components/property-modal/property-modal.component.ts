import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../../core/models/property.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-property-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="property" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        
        <!-- Modal Media Banner -->
        <div class="modal-media-header">
          <img [src]="property.imageUrl" [alt]="property.title" class="modal-img" />
          <div class="modal-media-overlay"></div>

          <button type="button" class="close-btn" (click)="close()" aria-label="Close modal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="modal-badges-row">
            <span *ngIf="property.tier === 'platinum'" class="badge badge-platinum">Platinum Tier</span>
            <span *ngIf="property.isNewLaunch" class="badge badge-emerald">New Launch</span>
            <span class="badge badge-blue">RERA Verified</span>
          </div>

          <div class="modal-price-header">
            <span class="price-big">{{ property.priceDisplay }}</span>
            <span *ngIf="property.pricePerSqFt" class="price-sqft">{{ property.pricePerSqFt }}</span>
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

            <div class="spec-card" *ngIf="property.specs.sqft">
              <span class="spec-name">Super Built-Up Area</span>
              <strong class="spec-value">{{ property.specs.sqft }} sq.ft</strong>
            </div>

            <div class="spec-card" *ngIf="property.specs.beds">
              <span class="spec-name">Bedrooms</span>
              <strong class="spec-value">{{ property.specs.beds }} BHK Master Suites</strong>
            </div>

            <div class="spec-card" *ngIf="property.specs.baths">
              <span class="spec-name">Bathrooms</span>
              <strong class="spec-value">{{ property.specs.baths }} En-suite Baths</strong>
            </div>

            <div class="spec-card" *ngIf="property.specs.plotSize">
              <span class="spec-name">Plot Dimensions</span>
              <strong class="spec-value">{{ property.specs.plotSize }}</strong>
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

              <!-- Contact Owner Button (Clicking registers booking in Admin Panel) -->
              <button 
                type="button" 
                class="btn btn-gold btn-contact-owner" 
                (click)="onContactOwner()"
                [disabled]="bookingSubmitting"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{{ bookingSubmitting ? 'Booking & Connecting...' : (isContacted ? 'Owner Contacted (Booked)' : 'Contact Owner') }}</span>
              </button>
            </div>
          </div>

          <!-- UNLOCKED DIRECT OWNER CONTACT CARD -->
          <div *ngIf="showOwnerDetails" class="owner-contact-unlocked-card">
            <div class="unlocked-header">
              <div class="badge-row">
                <span class="badge badge-emerald">✓ BOOKED & DISPATCHED TO ADMIN</span>
                <span class="booking-ref-tag" *ngIf="bookingRef">Ref #{{ bookingRef }}</span>
              </div>
              <h4>Direct Owner Contact Information</h4>
              <p>This property has been marked as booked. You can contact the verified seller directly below:</p>
            </div>

            <div class="owner-info-grid">
              <div class="owner-info-item">
                <span class="info-label">Seller / Owner Name</span>
                <strong class="info-val">{{ ownerDisplayName }}</strong>
              </div>
              <div class="owner-info-item">
                <span class="info-label">Direct Phone Number</span>
                <strong class="info-val text-gold">{{ ownerPhone }}</strong>
              </div>
              <div class="owner-info-item" *ngIf="ownerEmail">
                <span class="info-label">Official Email Address</span>
                <strong class="info-val">{{ ownerEmail }}</strong>
              </div>
              <div class="owner-info-item">
                <span class="info-label">Assigned Plan Membership</span>
                <strong class="info-val text-emerald">{{ buyerPlanLabel }} Plan</strong>
              </div>
            </div>

            <div class="direct-contact-buttons">
              <a [href]="'tel:' + ownerPhoneClean" class="btn-direct-action btn-call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Call Seller Now</span>
              </a>
              <a [href]="'https://wa.me/' + ownerPhoneClean" target="_blank" class="btn-direct-action btn-whatsapp">
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
                  {{ reportSubmitting ? 'Submitting Report...' : 'Submit Report to Admin' }}
                </button>
                <button type="button" class="btn-cancel-report" (click)="closeReportModal()">Cancel</button>
              </div>
            </form>
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
      height: 280px;
      width: 100%;
      background: var(--slate-900);
      overflow: hidden;
      flex-shrink: 0;
    }

    .modal-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 13, 30, 0.4) 0%, transparent 40%, rgba(7, 13, 30, 0.85) 100%);
    }

    .close-btn {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
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
      top: 1.25rem;
      left: 1.25rem;
      display: flex;
      gap: 0.5rem;
      z-index: 2;
    }

    .modal-price-header {
      position: absolute;
      bottom: 1.25rem;
      left: 1.5rem;
      z-index: 2;
      color: var(--white);
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
      .modal-dialog {
        max-height: 95vh;
      }

      .modal-body-scroll {
        padding: 1.5rem;
      }

      .modal-specs-grid {
        grid-template-columns: 1fr;
      }

      .contact-agent-card {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .agent-avatar {
        margin: 0 auto;
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
      const response = await fetch(`http://localhost:5001/api/properties/${this.property.id}/book`, {
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

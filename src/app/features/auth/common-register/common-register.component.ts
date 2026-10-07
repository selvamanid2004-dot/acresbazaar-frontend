import { Component, OnInit, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { getApiBaseUrl } from '../../../core/services/api-config';
import { RegisterForm } from '../../../core/models/buyer.model';

export type RegisterRoleType = 'BUYER' | 'SELLER' | 'DEALER' | 'SPOTTER';

@Component({
  selector: 'app-common-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-wrapper">
      
      <!-- Top Nav / Back Navigation Bar -->
      <section class="auth-nav-bar">
        <div class="container">
          <div class="nav-bar-inner">
            <button type="button" class="btn-back" (click)="goBack()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>

            <nav class="breadcrumb-nav" aria-label="Breadcrumb">
              <ol class="breadcrumb-list">
                <li><a routerLink="/" class="crumb-link">Home</a></li>
                <li class="crumb-sep">/</li>
                <li><span class="crumb-current">{{ dynamicBreadcrumb }}</span></li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <!-- Auth Form Card Section -->
      <section class="auth-card-section">
        <div class="container">
          <div class="auth-card-container">
            
            <!-- Role Selection Segment / Interactive Tabs -->
            <div class="role-selector-wrapper">
              <div class="role-selector-label">SELECT ACCOUNT TYPE</div>
              <div class="role-tabs-bar">
                <button 
                  type="button" 
                  class="role-tab-btn" 
                  [class.active]="currentRole === 'BUYER'" 
                  (click)="switchRole('BUYER')">
                  <span class="tab-icon">👤</span>
                  <span class="tab-label">Buyer</span>
                  <span class="tab-desc">Search & Buy</span>
                </button>
                <button 
                  type="button" 
                  class="role-tab-btn" 
                  [class.active]="currentRole === 'SELLER'" 
                  (click)="switchRole('SELLER')">
                  <span class="tab-icon">🏠</span>
                  <span class="tab-label">Seller</span>
                  <span class="tab-desc">Post & Sell</span>
                </button>
                <button 
                  type="button" 
                  class="role-tab-btn" 
                  [class.active]="currentRole === 'DEALER'" 
                  (click)="switchRole('DEALER')">
                  <span class="tab-icon">🏢</span>
                  <span class="tab-label">Dealer</span>
                  <span class="tab-desc">Agencies & Hub</span>
                </button>
                <button 
                  type="button" 
                  class="role-tab-btn" 
                  [class.active]="currentRole === 'SPOTTER'" 
                  (click)="switchRole('SPOTTER')">
                  <span class="tab-icon">📸</span>
                  <span class="tab-label">Partner</span>
                  <span class="tab-desc">Spot & Earn</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Header -->
            <div class="auth-header">
              <span class="auth-eyebrow" [ngClass]="eyebrowClass">{{ dynamicEyebrow }}</span>
              <h1 class="auth-title">{{ dynamicTitle }}</h1>
              <p class="auth-sub">{{ dynamicSubtitle }}</p>
            </div>

            <!-- Role Conflict Warning Banner -->
            <div *ngIf="activeConflictRole" class="alert-banner conflict-banner">
              <div class="banner-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="banner-body">
                <div><strong>Active {{ activeConflictRole }} Session:</strong> You are currently signed in as a {{ activeConflictRole }}. Please logout before creating a new account.</div>
                <button type="button" class="btn-conflict-action" (click)="logoutConflict()">
                  Logout {{ activeConflictRole }}
                </button>
              </div>
            </div>

            <!-- Error Banner -->
            <div class="alert-banner error-banner" *ngIf="errorMessage">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Success Banner -->
            <div class="alert-banner success-banner" *ngIf="successMessage">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ successMessage }}</span>
            </div>

            <!-- Single Consolidated Registration Form -->
            <form (ngSubmit)="onSubmit()" #regForm="ngForm" class="auth-form" novalidate>
              
              <!-- DEALER SPECIFIC: Business / Agency Name -->
              <div class="form-group" *ngIf="currentRole === 'DEALER'">
                <label for="dealerBusinessName" class="form-label">
                  Agency / Business Legal Name <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <input 
                    type="text" 
                    id="dealerBusinessName" 
                    name="dealerBusinessName" 
                    [(ngModel)]="dealerBusinessName" 
                    required 
                    placeholder="e.g. Prestige Realty Advisors / Apex Real Estate" 
                    class="form-control" />
                </div>
              </div>

              <!-- 1. Full Name / Contact Person Name -->
              <div class="form-group">
                <label for="fullName" class="form-label">
                  {{ nameFieldLabel }} <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName" 
                    [(ngModel)]="formData.fullName" 
                    required 
                    [placeholder]="nameFieldPlaceholder" 
                    class="form-control" />
                </div>
              </div>

              <!-- 2. Mobile Number -->
              <div class="form-group">
                <label for="mobile" class="form-label">
                  Mobile Number <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input 
                    type="tel" 
                    id="mobile" 
                    name="mobile" 
                    [(ngModel)]="formData.mobile" 
                    required 
                    placeholder="Enter 10-digit mobile number" 
                    class="form-control" 
                    maxlength="10" />
                </div>
              </div>

              <!-- 3. Email Address -->
              <div class="form-group">
                <label for="email" class="form-label">
                  Email / Gmail Address <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    [(ngModel)]="formData.email" 
                    required 
                    placeholder="name@example.com" 
                    class="form-control" />
                </div>
              </div>

              <!-- ROLE DYNAMIC FIELD: Location / Operating City -->
              <div class="form-group" *ngIf="currentRole === 'SELLER' || currentRole === 'DEALER' || currentRole === 'SPOTTER'">
                <label for="city" class="form-label">
                  {{ cityFieldLabel }} <span class="required" *ngIf="currentRole === 'SELLER' || currentRole === 'SPOTTER'">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input 
                    type="text" 
                    id="city" 
                    name="city" 
                    [(ngModel)]="city" 
                    [placeholder]="cityFieldPlaceholder" 
                    class="form-control" />
                </div>
              </div>

              <!-- BUYER SPECIFIC: Preferred Property Category -->
              <div class="form-group" *ngIf="currentRole === 'BUYER'">
                <label for="buyerCategory" class="form-label">
                  Preferred Property Category <span class="optional-tag">(Optional)</span>
                </label>
                <div class="input-wrap select-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <select 
                    id="buyerCategory" 
                    name="buyerCategory" 
                    [(ngModel)]="buyerCategory" 
                    class="form-control form-select">
                    <option value="">All Residential Categories</option>
                    <option value="plots">Plots & Land</option>
                    <option value="villas">Luxury Villas & Estates</option>
                    <option value="apartments">Premium Apartments</option>
                    <option value="independent-houses">Independent Houses</option>
                    <option value="commercial">Commercial Spaces</option>
                  </select>
                </div>
              </div>

              <!-- SELLER SPECIFIC: Primary Property Type to List -->
              <div class="form-group" *ngIf="currentRole === 'SELLER'">
                <label for="sellerPropertyType" class="form-label">
                  Primary Property Type to List <span class="optional-tag">(Optional)</span>
                </label>
                <div class="input-wrap select-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <select 
                    id="sellerPropertyType" 
                    name="sellerPropertyType" 
                    [(ngModel)]="sellerPropertyType" 
                    class="form-control form-select">
                    <option value="Residential Plot / Land">Residential Plot / Land</option>
                    <option value="Independent Villa / House">Independent Villa / House</option>
                    <option value="Premium Apartment">Premium Apartment</option>
                    <option value="Commercial Space">Commercial Space</option>
                    <option value="Farm Land">Farm Land</option>
                  </select>
                </div>
              </div>

              <!-- DEALER SPECIFIC: RERA / Broker License ID -->
              <div class="form-group" *ngIf="currentRole === 'DEALER'">
                <label for="dealerRera" class="form-label">
                  RERA Registration / Broker License No. <span class="optional-tag">(Optional - For Verified Badge)</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <input 
                    type="text" 
                    id="dealerRera" 
                    name="dealerRera" 
                    [(ngModel)]="dealerRera" 
                    placeholder="e.g. TN/AGENT/0123/2026" 
                    class="form-control" />
                </div>
              </div>

              <!-- PARTNER SPECIFIC: UPI ID for Cash Rewards -->
              <div class="form-group" *ngIf="currentRole === 'SPOTTER'">
                <label for="partnerUpi" class="form-label">
                  UPI ID for Reward Payouts <span class="optional-tag">(Optional - Add now or later)</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <input 
                    type="text" 
                    id="partnerUpi" 
                    name="partnerUpi" 
                    [(ngModel)]="partnerUpi" 
                    placeholder="e.g. yourname@oksbi / yourname@okhdfcbank" 
                    class="form-control" />
                </div>
              </div>

              <!-- 4. Password -->
              <div class="form-group">
                <label for="password" class="form-label">
                  Password <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    id="password" 
                    name="password" 
                    [(ngModel)]="formData.password" 
                    required 
                    placeholder="Create a strong password (min. 6 chars)" 
                    class="form-control" />
                  <button type="button" class="btn-toggle-pwd" (click)="showPassword = !showPassword" aria-label="Toggle password visibility">
                    <svg *ngIf="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 5. Confirm Password -->
              <div class="form-group">
                <label for="confirmPassword" class="form-label">
                  Confirm Password <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    [type]="showConfirmPassword ? 'text' : 'password'" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    [(ngModel)]="formData.confirmPassword" 
                    required 
                    placeholder="Re-enter your password" 
                    class="form-control" />
                  <button type="button" class="btn-toggle-pwd" (click)="showConfirmPassword = !showConfirmPassword" aria-label="Toggle confirm password visibility">
                    <svg *ngIf="!showConfirmPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showConfirmPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Terms Checkbox -->
              <div class="form-check-group">
                <label class="check-label">
                  <input type="checkbox" name="agreeTerms" [(ngModel)]="agreeTerms" required />
                  <span>I agree to the <a routerLink="/services" target="_blank">Platform Terms & Guidelines</a> and confirm provided details are accurate.</span>
                </label>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn-auth-submit" 
                [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">{{ submitButtonText }}</span>
                <span *ngIf="isSubmitting" class="submitting-spinner">
                  <svg class="spin-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                  </svg>
                  Creating {{ currentRoleName }} Account...
                </span>
              </button>
            </form>

            <!-- Bottom Switch to Login -->
            <div class="auth-card-footer">
              <span>Already registered as a {{ currentRoleName }}?</span>
              <a [routerLink]="loginLink" class="auth-switch-link">
                {{ currentRoleName }} Login →
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: radial-gradient(circle at top center, #1e293b 0%, #0b0f19 70%, #05070c 100%);
      color: #f8fafc;
      min-height: 100vh;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .auth-nav-bar {
      padding: 1.25rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(11, 15, 25, 0.6);
      backdrop-filter: blur(8px);
    }

    .nav-bar-inner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.85rem;
    }

    .crumb-link {
      color: #94a3b8;
      text-decoration: none;
    }

    .crumb-link:hover {
      color: #f59e0b;
    }

    .crumb-sep {
      color: #64748b;
    }

    .crumb-current {
      color: #f8fafc;
      font-weight: 700;
    }

    .auth-card-section {
      padding: 2.5rem 0 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-card-container {
      max-width: 560px;
      width: 100%;
      margin: 0 auto;
      background: #111827;
      border: 1.5px solid rgba(245, 158, 11, 0.2);
      border-radius: 24px;
      padding: 2.25rem 2rem;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(245, 158, 11, 0.06);
    }

    .role-selector-wrapper {
      margin-bottom: 24px;
    }

    .role-selector-label {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #d4af37;
      margin-bottom: 8px;
      text-align: center;
    }

    .role-tabs-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: rgba(255, 255, 255, 0.04);
      padding: 6px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .role-tab-btn {
      background: none;
      border: 1px solid transparent;
      color: #94a3b8;
      padding: 10px 4px 8px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 700;
      transition: all 0.2s ease;
      user-select: none;
    }

    .role-tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
    }

    .role-tab-btn.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0b0f19;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .tab-icon {
      font-size: 16px;
      line-height: 1;
      margin-bottom: 2px;
    }

    .tab-label {
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .tab-desc {
      font-size: 9.5px;
      font-weight: 600;
      opacity: 0.85;
    }

    .role-tab-btn.active .tab-desc {
      color: #0b0f19;
      font-weight: 700;
      opacity: 0.9;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .auth-eyebrow {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      margin-bottom: 0.75rem;
    }

    .auth-eyebrow.buyer-eye {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .auth-eyebrow.seller-eye {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .auth-eyebrow.dealer-eye {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .auth-eyebrow.spotter-eye {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .auth-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 0.5rem;
    }

    .auth-sub {
      font-size: 0.88rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.45;
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }

    .conflict-banner {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fde68a;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }

    .banner-icon-wrap {
      margin-top: 2px;
    }

    .banner-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-conflict-action {
      align-self: flex-start;
      background: #f59e0b;
      color: #0b0f19;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-conflict-action:hover {
      background: #fbbf24;
    }

    .error-banner {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .success-banner {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label {
      font-size: 0.83rem;
      font-weight: 700;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .required {
      color: #ef4444;
    }

    .optional-tag {
      font-size: 0.75rem;
      font-weight: 500;
      color: #94a3b8;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: #0b0f19;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .input-wrap:focus-within {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
    }

    .field-icon {
      position: absolute;
      left: 0.85rem;
      color: #64748b;
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 0.85rem 0.75rem 2.4rem;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
      font-family: inherit;
    }

    .form-control::placeholder {
      color: #475569;
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.85rem center;
    }

    .form-select option {
      background: #111827;
      color: #f8fafc;
    }

    .btn-toggle-pwd {
      background: none;
      border: none;
      color: #64748b;
      padding: 0.6rem 0.85rem;
      cursor: pointer;
    }

    .btn-toggle-pwd:hover {
      color: #fff;
    }

    .form-check-group {
      margin-top: 0.25rem;
    }

    .check-label {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1.4;
    }

    .check-label input {
      margin-top: 0.15rem;
      accent-color: #f59e0b;
      cursor: pointer;
    }

    .check-label a {
      color: #f59e0b;
      text-decoration: none;
      font-weight: 600;
    }

    .check-label a:hover {
      text-decoration: underline;
    }

    .btn-auth-submit {
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0b0f19;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
      transition: all 0.2s ease;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-auth-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      transform: translateY(-1px);
    }

    .btn-auth-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .submitting-spinner {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .spin-svg {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .auth-card-footer {
      text-align: center;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.85rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .auth-switch-link {
      color: #f59e0b;
      text-decoration: none;
      font-weight: 700;
    }

    .auth-switch-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .role-tabs-bar {
        grid-template-columns: repeat(2, 1fr);
      }

      .auth-card-container {
        padding: 1.5rem 1.15rem;
      }
    }
  `]
})
export class CommonRegisterComponent implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Optional Input from parent component
  @Input() role?: RegisterRoleType | string;

  // Form State
  formData: RegisterForm = {
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER'
  };

  // Role-Specific Dynamic Fields
  city = '';
  dealerBusinessName = '';
  dealerRera = '';
  buyerCategory = '';
  sellerPropertyType = 'Residential Plot / Land';
  partnerUpi = '';

  agreeTerms = true;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '';

  // Role State
  currentRole: RegisterRoleType = 'BUYER';

  ngOnInit(): void {
    if (this.role) {
      this.setRole(this.role);
    } else {
      this.detectRoleFromContext();
    }

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      if (params['role'] && !this.role) {
        this.setRole(params['role']);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role'] && this.role) {
      this.setRole(this.role);
    }
  }

  detectRoleFromContext(): void {
    const dataRole = this.route.snapshot.data['role'];
    if (dataRole) {
      this.setRole(dataRole);
      return;
    }

    const queryRole = this.route.snapshot.queryParams['role'];
    if (queryRole) {
      this.setRole(queryRole);
      return;
    }

    const url = this.router.url.toLowerCase();
    if (url.includes('/seller/') || url.includes('/sellers/')) {
      this.currentRole = 'SELLER';
    } else if (url.includes('/dealer/') || url.includes('/dealers/')) {
      this.currentRole = 'DEALER';
    } else if (url.includes('/snap-property/') || url.includes('/spotter/') || url.includes('/spotters/') || url.includes('/partner') || url.includes('/register/common')) {
      this.currentRole = 'SPOTTER';
    } else {
      this.currentRole = 'BUYER';
    }
  }

  setRole(roleString: string): void {
    const r = (roleString || '').toUpperCase().trim();
    if (r === 'SELLER') this.currentRole = 'SELLER';
    else if (r === 'DEALER') this.currentRole = 'DEALER';
    else if (r === 'SPOTTER' || r === 'PARTNER' || r === 'COMMON_PEOPLE' || r === 'COMMON') this.currentRole = 'SPOTTER';
    else this.currentRole = 'BUYER';
  }

  switchRole(role: RegisterRoleType): void {
    this.currentRole = role;
    this.errorMessage = '';
    this.successMessage = '';
  }

  get activeConflictRole(): string | null {
    const active = this.authService.getActiveRole();
    if (!active) return null;
    const currentDisplay = this.currentRoleName;
    if (active.toLowerCase() === currentDisplay.toLowerCase()) return null;
    return active;
  }

  logoutConflict(): void {
    this.authService.logoutCurrentRole();
    this.errorMessage = '';
  }

  goBack(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  // Dynamic UI Getters
  get currentRoleName(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Seller';
      case 'DEALER': return 'Dealer';
      case 'SPOTTER': return 'Partner';
      default: return 'Buyer';
    }
  }

  get dynamicBreadcrumb(): string {
    return `${this.currentRoleName} Registration`;
  }

  get dynamicEyebrow(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'SELLER ONBOARDING PORTAL';
      case 'DEALER': return 'DEALER & AGENCY NETWORK';
      case 'SPOTTER': return 'COMMUNITY PARTNER · SPOTTER';
      default: return 'VERIFIED BUYER ONBOARDING';
    }
  }

  get eyebrowClass(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'seller-eye';
      case 'DEALER': return 'dealer-eye';
      case 'SPOTTER': return 'spotter-eye';
      default: return 'buyer-eye';
    }
  }

  get dynamicTitle(): string {
    return `Create ${this.currentRoleName} Account`;
  }

  get dynamicSubtitle(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'List residential plots, villas, and apartments directly to thousands of active verified buyers nationwide.';
      case 'DEALER': return 'Join India\'s premier luxury real estate network. Access builder inventory and showcase exclusive properties.';
      case 'SPOTTER': return 'Spot TO-LET boards or property signboards in your neighborhood, snap photos, and earn ₹1,000 cash rewards!';
      default: return 'Register to unlock verified property dossiers, exact addresses, and direct owner/dealer contacts.';
    }
  }

  get nameFieldLabel(): string {
    switch (this.currentRole) {
      case 'DEALER': return 'Authorized Contact Person Name';
      case 'SELLER': return 'Owner / Full Legal Name';
      case 'SPOTTER': return 'Full Name / Partner Name';
      default: return 'Full Name';
    }
  }

  get nameFieldPlaceholder(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'e.g. Ramesh Kumar (Property Owner)';
      case 'DEALER': return 'e.g. Amit Shah (Managing Partner)';
      case 'SPOTTER': return 'e.g. Priya Sundaram (Community Partner)';
      default: return 'e.g. Rahul Sharma';
    }
  }

  get cityFieldLabel(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Property Location / City';
      case 'DEALER': return 'Primary Operating Cities / Region';
      case 'SPOTTER': return 'Operating City / Neighborhood';
      default: return 'City / Location';
    }
  }

  get cityFieldPlaceholder(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'e.g. Chennai, Bangalore, Coimbatore';
      case 'DEALER': return 'e.g. Chennai & Metro Regions';
      case 'SPOTTER': return 'e.g. Anna Nagar, Chennai';
      default: return 'e.g. Chennai';
    }
  }

  get submitButtonText(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Register as Seller & Post Property →';
      case 'DEALER': return 'Register as Verified Dealer →';
      case 'SPOTTER': return 'Register as Partner & Start Snapping →';
      default: return 'Create Buyer Account →';
    }
  }

  get loginLink(): string {
    switch (this.currentRole) {
      case 'SELLER': return '/seller/login';
      case 'DEALER': return '/dealer/login';
      case 'SPOTTER': return '/snap-property/login';
      default: return '/login';
    }
  }

  // Unified Registration Submission
  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    // Check active conflict session
    if (this.activeConflictRole) {
      this.errorMessage = `You are currently logged in as a ${this.activeConflictRole}. Please logout of that account first.`;
      return;
    }

    if (!this.formData.fullName?.trim() || !this.formData.mobile?.trim() || !this.formData.email?.trim() || !this.formData.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.currentRole === 'DEALER' && !this.dealerBusinessName.trim()) {
      this.errorMessage = 'Please enter your Agency / Business Legal Name.';
      return;
    }

    if (this.currentRole === 'SELLER' && !this.city.trim()) {
      this.errorMessage = 'Please enter the Property Location / City.';
      return;
    }

    if (this.currentRole === 'SPOTTER' && !this.city.trim()) {
      this.errorMessage = 'Please enter your Operating City / Neighborhood.';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'Please accept the platform guidelines to continue.';
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.currentRole === 'BUYER') {
        const res = await this.authService.register({
          fullName: this.formData.fullName.trim(),
          mobile: this.formData.mobile.trim(),
          email: this.formData.email.trim(),
          password: this.formData.password,
          confirmPassword: this.formData.confirmPassword,
          role: 'BUYER'
        });

        if (res.success) {
          this.successMessage = 'Buyer account created successfully! Redirecting...';
          setTimeout(() => {
            const target = this.returnUrl || '/';
            this.router.navigateByUrl(target);
          }, 800);
        } else {
          this.errorMessage = res.message;
        }
      } else if (this.currentRole === 'SELLER') {
        const res = await this.authService.registerSeller({
          fullName: this.formData.fullName.trim(),
          mobile: this.formData.mobile.trim(),
          email: this.formData.email.trim(),
          password: this.formData.password,
          confirmPassword: this.formData.confirmPassword
        });

        if (res.success) {
          // Automatically log seller in for seamless onboarding
          await this.authService.loginSeller(this.formData.email.trim(), this.formData.password);
          this.successMessage = 'Seller account created successfully! Redirecting to Seller Dashboard...';
          setTimeout(() => this.router.navigate(['/seller/categories']), 800);
        } else {
          this.errorMessage = res.message;
        }
      } else if (this.currentRole === 'DEALER') {
        const businessName = this.dealerBusinessName.trim() || this.formData.fullName.trim();
        const res = await this.authService.registerDealer({
          businessName: businessName,
          fullName: this.formData.fullName.trim(),
          mobile: this.formData.mobile.trim(),
          email: this.formData.email.trim(),
          password: this.formData.password,
          confirmPassword: this.formData.confirmPassword
        });

        if (res.success) {
          // Automatically log dealer in for seamless onboarding
          await this.authService.loginDealer({
            email: this.formData.email.trim(),
            password: this.formData.password
          });
          this.successMessage = 'Dealer account created successfully! Redirecting to Dealer Dashboard...';
          setTimeout(() => this.router.navigate(['/dealer/dashboard']), 800);
        } else {
          this.errorMessage = res.message;
        }
      } else if (this.currentRole === 'SPOTTER') {
        const payload = {
          name: this.formData.fullName.trim(),
          email: this.formData.email.trim().toLowerCase(),
          mobile: this.formData.mobile.trim(),
          password: this.formData.password,
          role: 'COMMON_PEOPLE'
        };

        this.http.post<any>(`${getApiBaseUrl()}/auth/register`, payload).subscribe({
          next: (res) => {
            this.successMessage = 'Partner account created! Launching camera upload module...';
            const sessionData = {
              token: res.token,
              user: {
                id: res.user?.id || 'partner-' + Date.now(),
                name: res.user?.name || this.formData.fullName,
                email: res.user?.email || this.formData.email,
                mobile: res.user?.mobile || this.formData.mobile,
                city: this.city,
                upi: this.partnerUpi,
                role: 'COMMON_PEOPLE'
              },
              expiresAt: Date.now() + 86400000 * 30
            };
            localStorage.setItem('aura_common_session', JSON.stringify(sessionData));
            this.notificationService.show('Welcome Partner!', 'Registration successful. You can now snap TO-LET boards.', 'success');
            setTimeout(() => this.router.navigate(['/snap-property/upload']), 800);
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Registration failed. An account with this email may already exist.';
            this.isSubmitting = false;
          }
        });
      }
    } catch {
      this.errorMessage = 'An error occurred during registration. Please try again.';
    } finally {
      if (this.currentRole !== 'SPOTTER') {
        this.isSubmitting = false;
      }
    }
  }
}

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
            
            <!-- Interactive Role Switcher Tabs -->
            <div class="role-tabs-bar">
              <button 
                type="button" 
                class="role-tab-btn" 
                [class.active]="currentRole === 'BUYER'" 
                (click)="switchRole('BUYER')">
                <span class="tab-icon">👤</span>
                <span class="tab-label">Buyer</span>
              </button>
              <button 
                type="button" 
                class="role-tab-btn" 
                [class.active]="currentRole === 'SELLER'" 
                (click)="switchRole('SELLER')">
                <span class="tab-icon">🏠</span>
                <span class="tab-label">Seller</span>
              </button>
              <button 
                type="button" 
                class="role-tab-btn" 
                [class.active]="currentRole === 'DEALER'" 
                (click)="switchRole('DEALER')">
                <span class="tab-icon">🏢</span>
                <span class="tab-label">Dealer</span>
              </button>
              <button 
                type="button" 
                class="role-tab-btn" 
                [class.active]="currentRole === 'SPOTTER'" 
                (click)="switchRole('SPOTTER')">
                <span class="tab-icon">📸</span>
                <span class="tab-label">Spotter</span>
              </button>
            </div>

            <!-- Dynamic Header -->
            <div class="auth-header">
              <span class="auth-eyebrow" [ngClass]="eyebrowClass">{{ dynamicEyebrow }}</span>
              <h1 class="auth-title">{{ dynamicTitle }}</h1>
              <p class="auth-sub">{{ dynamicSubtitle }}</p>
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

            <!-- Common Registration Form -->
            <form (ngSubmit)="onSubmit()" #regForm="ngForm" class="auth-form" novalidate>
              
              <!-- 1. Full Name / Business Name -->
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

              <!-- 4. City (Optional / For Spotter & Regional operations) -->
              <div class="form-group" *ngIf="currentRole === 'SPOTTER' || currentRole === 'DEALER'">
                <label for="city" class="form-label">
                  City / Primary Operating Location <span class="required">*</span>
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
                    placeholder="e.g. Chennai, Bangalore, Coimbatore" 
                    class="form-control" />
                </div>
              </div>

              <!-- 5. Password -->
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
                  <button type="button" class="btn-toggle-pwd" (click)="showPassword = !showPassword">
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

              <!-- 6. Confirm Password -->
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
                  <button type="button" class="btn-toggle-pwd" (click)="showConfirmPassword = !showConfirmPassword">
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
                  <span>I agree to the <a routerLink="/services" target="_blank">Platform Terms & Guidelines</a></span>
                </label>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn-auth-submit" 
                [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">{{ submitButtonText }}</span>
                <span *ngIf="isSubmitting">Creating {{ currentRoleName }} Account...</span>
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
      font-family: 'Plus Jakarta Sans', sans-serif;
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
      padding: 3rem 0 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-card-container {
      max-width: 520px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 2.5rem 2.25rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.05);
    }

    .role-tabs-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: rgba(255, 255, 255, 0.04);
      padding: 4px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .role-tab-btn {
      background: none;
      border: none;
      color: #94a3b8;
      padding: 8px 4px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      font-size: 11.5px;
      font-weight: 700;
      transition: all 0.15s ease;
    }

    .role-tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    .role-tab-btn.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0b0f19;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    }

    .tab-icon {
      font-size: 14px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
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
      gap: 1.25rem;
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
    }

    .required {
      color: #ef4444;
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
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 0.85rem 0.75rem 2.4rem;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
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
      line-height: 1.35;
    }

    .check-label input {
      margin-top: 0.15rem;
      accent-color: #f59e0b;
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
    }

    .btn-auth-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      transform: translateY(-1px);
    }

    .btn-auth-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
  city = '';
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

    const url = this.router.url.toLowerCase();
    if (url.includes('/seller/') || url.includes('/sellers/')) {
      this.currentRole = 'SELLER';
    } else if (url.includes('/dealer/') || url.includes('/dealers/')) {
      this.currentRole = 'DEALER';
    } else if (url.includes('/snap-property/') || url.includes('/spotter/') || url.includes('/spotters/') || url.includes('/register/common')) {
      this.currentRole = 'SPOTTER';
    } else {
      this.currentRole = 'BUYER';
    }
  }

  setRole(roleString: string): void {
    const r = (roleString || '').toUpperCase().trim();
    if (r === 'SELLER') this.currentRole = 'SELLER';
    else if (r === 'DEALER') this.currentRole = 'DEALER';
    else if (r === 'SPOTTER' || r === 'COMMON_PEOPLE' || r === 'COMMON') this.currentRole = 'SPOTTER';
    else this.currentRole = 'BUYER';
  }

  switchRole(role: RegisterRoleType): void {
    this.currentRole = role;
    this.errorMessage = '';
    this.successMessage = '';
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
      case 'SPOTTER': return 'Spotter';
      default: return 'Buyer';
    }
  }

  get dynamicBreadcrumb(): string {
    return `${this.currentRoleName} Registration`;
  }

  get dynamicEyebrow(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'SELLER ONBOARDING';
      case 'DEALER': return 'DEALER & AGENCY ONBOARDING';
      case 'SPOTTER': return 'COMMON PEOPLE · SNAP SPOTTER';
      default: return 'BUYER ONBOARDING';
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
      case 'DEALER': return 'Join India\'s premier luxury real estate network. Access builder inventory and earn rewards.';
      case 'SPOTTER': return 'Spot TO-LET boards or property signboards in your neighborhood, snap photos, and earn ₹1,000 cash rewards!';
      default: return 'Register to unlock verified property dossiers, exact addresses, and direct owner/dealer contacts.';
    }
  }

  get nameFieldLabel(): string {
    return this.currentRole === 'DEALER' ? 'Full Name / Agency Business Name' : 'Full Name';
  }

  get nameFieldPlaceholder(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'e.g. Ramesh Kumar (Property Owner)';
      case 'DEALER': return 'e.g. Horizon Realty Advisors / Amit Shah';
      case 'SPOTTER': return 'e.g. Priya Sundaram (Neighborhood Scout)';
      default: return 'e.g. Rahul Sharma';
    }
  }

  get submitButtonText(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Register as Seller';
      case 'DEALER': return 'Register as Verified Dealer';
      case 'SPOTTER': return 'Register as Spotter & Start Snapping';
      default: return 'Create Buyer Account';
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

    if (!this.formData.fullName?.trim() || !this.formData.mobile?.trim() || !this.formData.email?.trim() || !this.formData.password) {
      this.errorMessage = 'Please complete all required fields.';
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
          this.successMessage = 'Seller account created successfully! Redirecting to Seller Login...';
          setTimeout(() => this.router.navigate(['/seller/login']), 800);
        } else {
          this.errorMessage = res.message;
        }
      } else if (this.currentRole === 'DEALER') {
        const res = await this.authService.registerDealer({
          businessName: this.formData.fullName.trim(),
          fullName: this.formData.fullName.trim(),
          mobile: this.formData.mobile.trim(),
          email: this.formData.email.trim(),
          password: this.formData.password,
          confirmPassword: this.formData.confirmPassword
        });

        if (res.success) {
          this.successMessage = 'Dealer account created successfully! Redirecting to Dealer Login...';
          setTimeout(() => this.router.navigate(['/dealer/login']), 800);
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
            this.successMessage = 'Spotter account created! Launching camera upload module...';
            const sessionData = {
              token: res.token,
              user: {
                id: res.user?.id || 'spotter-' + Date.now(),
                name: res.user?.name || this.formData.fullName,
                email: res.user?.email || this.formData.email,
                mobile: res.user?.mobile || this.formData.mobile,
                city: this.city,
                role: 'COMMON_PEOPLE'
              },
              expiresAt: Date.now() + 86400000 * 30
            };
            localStorage.setItem('aura_common_session', JSON.stringify(sessionData));
            this.notificationService.show('Welcome Spotter!', 'Registration successful. You can now snap TO-LET boards.', 'success');
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

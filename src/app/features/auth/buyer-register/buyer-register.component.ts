import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterForm } from '../../../core/models/buyer.model';

@Component({
  selector: 'app-buyer-register',
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
                <li><span class="crumb-current">{{ isCommonPeople ? 'Common People Registration' : 'Buyer Registration' }}</span></li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <!-- Auth Form Card Section -->
      <section class="auth-card-section">
        <div class="container">
          <div class="auth-card-container">
            
            <div class="auth-header">
              <span class="auth-eyebrow">{{ isCommonPeople ? 'COMMUNITY & SCOUT ONBOARDING' : 'BUYER ONBOARDING' }}</span>
              <h1 class="auth-title">{{ isCommonPeople ? 'Create Common People Account' : 'Create Buyer Account' }}</h1>
              <p class="auth-sub">
                {{ isCommonPeople 
                    ? 'Register as an everyday citizen or scout to spot properties, earn cash bounties, and explore local deals.' 
                    : 'Register to unlock verified property dossiers, exact addresses, and direct owner/dealer contacts.' }}
              </p>
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

            <!-- Registration Form -->
            <form (ngSubmit)="onSubmit()" #regForm="ngForm" class="auth-form" novalidate>
              
              <!-- 1. Full Name -->
              <div class="form-group">
                <label for="fullName" class="form-label">
                  Full Name <span class="required">*</span>
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
                    placeholder="Enter your full name" 
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
                    maxlength="15"
                    placeholder="Enter 10-digit mobile number" 
                    class="form-control" />
                </div>
              </div>

              <!-- 3. Gmail / Email -->
              <div class="form-group">
                <label for="email" class="form-label">
                  Gmail / Email Address <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    [(ngModel)]="formData.email" 
                    required 
                    placeholder="name@gmail.com" 
                    class="form-control" />
                </div>
              </div>

              <!-- 4. Password -->
              <div class="form-group">
                <label for="password" class="form-label">
                  Password (min. 6 characters) <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    id="password" 
                    name="password" 
                    [(ngModel)]="formData.password" 
                    required 
                    placeholder="Create a strong password" 
                    class="form-control" />
                  <button type="button" class="btn-toggle-eye" (click)="showPassword = !showPassword" aria-label="Toggle password visibility">
                    <svg *ngIf="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" y1="2" x2="22" y2="22"></line>
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <input 
                    [type]="showConfirmPassword ? 'text' : 'password'" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    [(ngModel)]="formData.confirmPassword" 
                    required 
                    placeholder="Re-enter password" 
                    class="form-control" />
                  <button type="button" class="btn-toggle-eye" (click)="showConfirmPassword = !showConfirmPassword" aria-label="Toggle password visibility">
                    <svg *ngIf="!showConfirmPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showConfirmPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" y1="2" x2="22" y2="22"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Submit CTA -->
              <button 
                type="submit" 
                class="btn btn-primary btn-block btn-submit"
                [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">{{ isCommonPeople ? 'Create Common People Account' : 'Create Buyer Account' }}</span>
                <span *ngIf="isSubmitting">Creating Account...</span>
              </button>

            </form>

            <!-- Card Footer -->
            <div class="auth-card-footer">
              <span>Already have an account?</span>
              <a [routerLink]="['/login']" [queryParams]="{ returnUrl: returnUrl }" class="auth-switch-link">
                Login here →
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .auth-page-wrapper {
      background: #FAF8F5;
      min-height: 85vh;
      display: flex;
      flex-direction: column;
    }

    .auth-nav-bar {
      background: #FFFFFF;
      border-bottom: 1px solid var(--slate-200);
      padding: 0.85rem 0;
    }

    .nav-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--primary-900);
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      padding: 0.45rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-back:hover {
      background: var(--primary-900);
      color: #FFFFFF;
    }

    .breadcrumb-nav {
      font-size: 0.85rem;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .crumb-link {
      color: var(--slate-500);
      font-weight: 600;
      text-decoration: none;
    }

    .crumb-sep {
      color: var(--slate-400);
    }

    .crumb-current {
      color: var(--primary-900);
      font-weight: 700;
    }

    .auth-card-section {
      padding: 3.5rem 0 5rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-card-container {
      max-width: 520px;
      width: 100%;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-xl);
      padding: 3rem 2.5rem;
      box-shadow: 0 10px 30px rgba(11, 19, 43, 0.06);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-eyebrow {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--gold-600);
      background: rgba(197, 168, 128, 0.18);
      border: 1px solid rgba(197, 168, 128, 0.4);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-xs);
      display: inline-block;
      margin-bottom: 0.75rem;
    }

    .auth-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-900);
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    .auth-sub {
      font-size: 0.92rem;
      color: var(--slate-600);
      line-height: 1.5;
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .error-banner {
      background: #FEF2F2;
      border: 1.5px solid #F87171;
      color: #991B1B;
    }

    .success-banner {
      background: #F0FDF4;
      border: 1.5px solid #4ADE80;
      color: #166534;
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
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--primary-900);
    }

    .required {
      color: #DC2626;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 1rem;
      color: var(--slate-400);
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      font-size: 0.92rem;
      font-family: var(--font-body);
      color: var(--slate-800);
      background: #FFFFFF;
      border: 1.5px solid var(--slate-300);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      outline: none;
    }

    .form-control:focus {
      border-color: var(--primary-900);
      box-shadow: 0 0 0 3px rgba(11, 19, 43, 0.1);
    }

    .field-hint {
      font-size: 0.76rem;
      color: var(--slate-500);
    }

    .btn-toggle-eye {
      position: absolute;
      right: 0.85rem;
      background: none;
      border: none;
      color: var(--slate-400);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
    }

    .btn-toggle-eye:hover {
      color: var(--primary-900);
    }

    .btn-submit {
      margin-top: 0.75rem;
      padding: 0.85rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 800;
      background: var(--primary-900);
      color: #FFFFFF;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .btn-submit:hover:not(:disabled) {
      background: #15224D;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }

    .auth-card-footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--slate-200);
      text-align: center;
      font-size: 0.88rem;
      color: var(--slate-600);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .auth-switch-link {
      font-weight: 800;
      color: var(--gold-600);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .auth-switch-link:hover {
      color: var(--primary-900);
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .auth-card-container {
        padding: 2.25rem 1.5rem;
      }
    }
  `]
})
export class BuyerRegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formData: RegisterForm = {
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER'
  };

  isCommonPeople = false;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '';

  constructor() {
    this.route.data.subscribe(data => {
      if (data && data['role'] === 'COMMON_PEOPLE') {
        this.isCommonPeople = true;
        this.formData.role = 'COMMON_PEOPLE';
      }
    });

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      if (params['role'] === 'COMMON_PEOPLE' || params['role'] === 'common') {
        this.isCommonPeople = true;
        this.formData.role = 'COMMON_PEOPLE';
      }
    });
  }

  goBack() {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.fullName || !this.formData.mobile || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isSubmitting = true;
    try {
      const res = await this.authService.register(this.formData);
      if (res.success) {
        this.successMessage = this.isCommonPeople 
          ? 'Common People account created successfully! Redirecting...' 
          : 'Buyer account created successfully! Redirecting...';
        setTimeout(() => {
          const target = this.returnUrl || '/';
          this.router.navigateByUrl(target);
        }, 800);
      } else {
        this.errorMessage = res.message;
      }
    } catch {
      this.errorMessage = 'An error occurred during registration. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}

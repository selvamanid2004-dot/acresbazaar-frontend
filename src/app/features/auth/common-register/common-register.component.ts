import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

export type RoleOption = 'Buyer' | 'Seller' | 'Dealer' | 'Partner';

@Component({
  selector: 'app-common-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-wrapper">
      
      <!-- Top Navigation Bar -->
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
                <li><span class="crumb-current">Register</span></li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <!-- Registration Form Card -->
      <section class="auth-card-section">
        <div class="container">
          <div class="auth-card-container">
            
            <!-- Header -->
            <div class="auth-header">
              <span class="auth-eyebrow">CREATE ACCOUNT</span>
              <h1 class="auth-title">Register</h1>
              <p class="auth-sub">Enter your details to create your account</p>
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
              
              <!-- 1. Name -->
              <div class="form-group">
                <label for="name" class="form-label">
                  Name <span class="required">*</span>
                </label>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    [(ngModel)]="name" 
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
                    [(ngModel)]="mobile" 
                    required 
                    placeholder="Enter 10-digit mobile number" 
                    class="form-control" 
                    maxlength="10" />
                </div>
              </div>

              <!-- 3. Email ID -->
              <div class="form-group">
                <label for="email" class="form-label">
                  Email ID <span class="required">*</span>
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
                    [(ngModel)]="email" 
                    required 
                    placeholder="name@example.com" 
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
                    [(ngModel)]="password" 
                    required 
                    placeholder="Enter password (min. 6 characters)" 
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

              <!-- 5. Role Dropdown -->
              <div class="form-group">
                <label for="role" class="form-label">
                  Role <span class="required">*</span>
                </label>
                <div class="input-wrap select-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  <select 
                    id="role" 
                    name="role" 
                    [(ngModel)]="selectedRole" 
                    required 
                    class="form-control form-select">
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn-auth-submit" 
                [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">Register</span>
                <span *ngIf="isSubmitting" class="submitting-spinner">
                  <svg class="spin-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                  </svg>
                  Creating Account...
                </span>
              </button>
            </form>

            <!-- Bottom Switch to Login -->
            <div class="auth-card-footer">
              <span>Already have an account?</span>
              <a [routerLink]="loginLink" class="auth-switch-link">
                Login →
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
      padding: 3rem 0 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-card-container {
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
      background: #111827;
      border: 1.5px solid rgba(245, 158, 11, 0.2);
      border-radius: 20px;
      padding: 2.25rem 2rem;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(245, 158, 11, 0.06);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-eyebrow {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      margin-bottom: 0.75rem;
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .auth-title {
      font-size: 1.75rem;
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
      gap: 0.45rem;
    }

    .form-label {
      font-size: 0.84rem;
      font-weight: 700;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.35rem;
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
      .auth-card-container {
        padding: 1.75rem 1.25rem;
      }
    }
  `]
})
export class CommonRegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Form Fields
  name = '';
  mobile = '';
  email = '';
  password = '';
  selectedRole: RoleOption = 'Buyer';

  showPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      if (params['role']) {
        this.setRoleFromParam(params['role']);
      }
    });

    const dataRole = this.route.snapshot.data['role'];
    if (dataRole) {
      this.setRoleFromParam(dataRole);
    }
  }

  setRoleFromParam(roleString: string): void {
    const r = (roleString || '').toUpperCase().trim();
    if (r === 'SELLER') this.selectedRole = 'Seller';
    else if (r === 'DEALER') this.selectedRole = 'Dealer';
    else if (r === 'SPOTTER' || r === 'PARTNER' || r === 'COMMON_PEOPLE' || r === 'COMMON') this.selectedRole = 'Partner';
    else this.selectedRole = 'Buyer';
  }

  goBack(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  get loginLink(): string {
    switch (this.selectedRole) {
      case 'Seller': return '/seller/login';
      case 'Dealer': return '/dealer/login';
      case 'Partner': return '/snap-property/login';
      default: return '/login';
    }
  }

  // Registration Submission
  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const cleanName = this.name.trim();
    const cleanMobile = this.mobile.trim().replace(/\D/g, '');
    const cleanEmail = this.email.trim().toLowerCase();
    const cleanPassword = this.password;

    if (!cleanName || !cleanMobile || !cleanEmail || !cleanPassword) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (cleanMobile.length < 10) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (cleanPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.selectedRole === 'Buyer') {
        const res = await this.authService.register({
          fullName: cleanName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: cleanPassword,
          confirmPassword: cleanPassword,
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
      } else if (this.selectedRole === 'Seller') {
        const res = await this.authService.registerSeller({
          fullName: cleanName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: cleanPassword,
          confirmPassword: cleanPassword
        });

        if (res.success) {
          await this.authService.loginSeller(cleanEmail, cleanPassword);
          this.successMessage = 'Seller account created successfully! Redirecting to Seller Dashboard...';
          setTimeout(() => this.router.navigate(['/seller/categories']), 800);
        } else {
          this.errorMessage = res.message;
        }
      } else if (this.selectedRole === 'Dealer') {
        const res = await this.authService.registerDealer({
          businessName: cleanName,
          fullName: cleanName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: cleanPassword,
          confirmPassword: cleanPassword
        });

        if (res.success) {
          await this.authService.loginDealer({
            email: cleanEmail,
            password: cleanPassword
          });
          this.successMessage = 'Dealer account created successfully! Redirecting to Dealer Dashboard...';
          setTimeout(() => this.router.navigate(['/dealer/dashboard']), 800);
        } else {
          this.errorMessage = res.message;
        }
      } else if (this.selectedRole === 'Partner') {
        const payload = {
          name: cleanName,
          email: cleanEmail,
          mobile: cleanMobile,
          password: cleanPassword,
          role: 'COMMON_PEOPLE'
        };

        this.http.post<any>(`${getApiBaseUrl()}/auth/register`, payload).subscribe({
          next: (res) => {
            this.successMessage = 'Partner account created! Redirecting to upload module...';
            const sessionData = {
              token: res.token,
              user: {
                id: res.user?.id || 'partner-' + Date.now(),
                name: res.user?.name || cleanName,
                email: res.user?.email || cleanEmail,
                mobile: res.user?.mobile || cleanMobile,
                role: 'COMMON_PEOPLE'
              },
              expiresAt: Date.now() + 86400000 * 30
            };
            localStorage.setItem('aura_common_session', JSON.stringify(sessionData));
            this.notificationService.show('Welcome Partner!', 'Registration successful.', 'success');
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
      if (this.selectedRole !== 'Partner') {
        this.isSubmitting = false;
      }
    }
  }
}

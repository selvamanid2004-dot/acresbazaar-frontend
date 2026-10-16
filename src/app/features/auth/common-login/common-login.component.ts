import { Component, OnInit, signal, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

export type RoleOption = 'Buyer' | 'Seller' | 'Dealer' | 'Partner';
export type AuthRoleType = 'BUYER' | 'SELLER' | 'DEALER' | 'SPOTTER';

@Component({
  selector: 'app-common-login',
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
                <li><span class="crumb-current">Login</span></li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <!-- Login Form Card Section -->
      <section class="auth-card-section">
        <div class="container">
          <div class="auth-card-container">
            
            <!-- Header -->
            <div class="auth-header">
              <span class="auth-eyebrow">WELCOME BACK</span>
              <h1 class="auth-title">Login</h1>
              <p class="auth-sub">Enter your credentials to access your account</p>
            </div>

            <!-- Role Conflict Warning -->
            <div class="alert-banner warning-banner" *ngIf="activeConflictRole">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div class="conflict-content">
                <span><strong>Active {{ activeConflictRole }} Session:</strong> You are already logged in as a {{ activeConflictRole }}. Please logout first before logging in as a {{ selectedRole }}.</span>
                <button type="button" class="btn-conflict-logout" (click)="logoutConflict()">Logout {{ activeConflictRole }}</button>
              </div>
            </div>

            <!-- Error Banner -->
            <div class="alert-banner error-banner" *ngIf="errorMessage()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>

            <!-- Success Banner -->
            <div class="alert-banner success-banner" *ngIf="successMessage()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ successMessage() }}</span>
            </div>

            <!-- Single Common Login Form -->
            <form (ngSubmit)="handleLogin()" #loginForm="ngForm" class="auth-form" novalidate>
              
              <!-- 1. Email ID -->
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
                    [placeholder]="emailPlaceholder" 
                    class="form-control" 
                    autocomplete="email" />
                </div>
              </div>

              <!-- 2. Password -->
              <div class="form-group">
                <div class="label-with-link">
                  <label for="password" class="form-label">
                    Password <span class="required">*</span>
                  </label>
                  <a *ngIf="selectedRole === 'Buyer'" [routerLink]="['/forgot-password']" [queryParams]="{ returnUrl: returnUrl() }" class="forgot-link">
                    Forgot Password?
                  </a>
                </div>
                <div class="input-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    [type]="showPassword() ? 'text' : 'password'" 
                    id="password" 
                    name="password" 
                    [(ngModel)]="password" 
                    required 
                    placeholder="Enter your password" 
                    class="form-control" 
                    autocomplete="current-password" />
                  <button type="button" class="btn-toggle-pwd" (click)="togglePasswordVisibility()" aria-label="Toggle password visibility">
                    <svg *ngIf="!showPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 3. Role Dropdown with four options: Buyer, Seller, Dealer, Partner -->
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
                    (ngModelChange)="onRoleChange($event)" 
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
                [disabled]="isSubmitting() || !!activeConflictRole">
                <span *ngIf="!isSubmitting()">Login</span>
                <span *ngIf="isSubmitting()" class="submitting-spinner">
                  <svg class="spin-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                  </svg>
                  Logging in...
                </span>
              </button>
            </form>

            <!-- Bottom Switch to Register -->
            <div class="auth-card-footer">
              <span>Don't have an account?</span>
              <a [routerLink]="registerLink" [queryParams]="registerQueryParams" class="auth-switch-link">
                Register as {{ selectedRole }} →
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
      align-items: flex-start;
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

    .warning-banner {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }

    .conflict-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      font-size: 0.82rem;
      line-height: 1.4;
    }

    .btn-conflict-logout {
      align-self: flex-start;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #fbbf24;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-conflict-logout:hover {
      background: #f59e0b;
      color: #0b0f19;
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

    .label-with-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .forgot-link {
      color: #f59e0b;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .forgot-link:hover {
      text-decoration: underline;
      color: #fbbf24;
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
export class CommonLoginComponent implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Optional Input from wrapper components
  @Input() role?: RoleOption | AuthRoleType | string;

  // Form Fields
  email = '';
  password = '';
  selectedRole: RoleOption = 'Buyer';

  showPassword = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  returnUrl = signal<string>('/');

  activeConflictRole: string | null = null;

  ngOnInit(): void {
    if (this.role) {
      this.setRoleFromParam(this.role);
    } else {
      this.detectRoleFromContext();
    }

    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl.set(params['returnUrl']);
      }
      if (params['role'] && !this.role) {
        this.setRoleFromParam(params['role']);
      }
    });

    const dataRole = this.route.snapshot.data['role'];
    if (dataRole && !this.role) {
      this.setRoleFromParam(dataRole);
    }

    this.checkConflictAndRedirect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role'] && this.role) {
      this.setRoleFromParam(this.role);
      this.checkConflictAndRedirect();
    }
  }

  detectRoleFromContext(): void {
    // 1. From route data
    const dataRole = this.route.snapshot.data['role'];
    if (dataRole) {
      this.setRoleFromParam(dataRole);
      return;
    }

    // 2. From URL path
    const url = this.router.url.toLowerCase();
    if (url.includes('/seller/') || url.includes('/sellers/')) {
      this.selectedRole = 'Seller';
    } else if (url.includes('/dealer/') || url.includes('/dealers/')) {
      this.selectedRole = 'Dealer';
    } else if (url.includes('/snap-property/') || url.includes('/spotter/') || url.includes('/spotters/') || url.includes('/partner/')) {
      this.selectedRole = 'Partner';
    } else {
      this.selectedRole = 'Buyer';
    }
  }

  setRoleFromParam(roleString: string): void {
    const r = (roleString || '').toUpperCase().trim();
    if (r === 'SELLER') this.selectedRole = 'Seller';
    else if (r === 'DEALER') this.selectedRole = 'Dealer';
    else if (r === 'SPOTTER' || r === 'PARTNER' || r === 'COMMON_PEOPLE' || r === 'COMMON') this.selectedRole = 'Partner';
    else this.selectedRole = 'Buyer';
  }

  setRole(roleString: string): void {
    this.setRoleFromParam(roleString);
  }

  onRoleChange(newRole: RoleOption): void {
    this.selectedRole = newRole;
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.checkConflictAndRedirect();
  }

  switchRole(role: AuthRoleType | RoleOption): void {
    this.setRoleFromParam(String(role));
    this.onRoleChange(this.selectedRole);
  }

  goBack(): void {
    if (this.returnUrl() && this.returnUrl() !== '/') {
      this.router.navigateByUrl(this.returnUrl());
    } else {
      this.router.navigate(['/']);
    }
  }

  checkConflictAndRedirect(): void {
    this.activeConflictRole = null;

    // If already logged in as this exact role, redirect to corresponding dashboard
    if (this.selectedRole === 'Buyer' && this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl());
      return;
    }
    if (this.selectedRole === 'Seller' && this.authService.isSellerAuthenticated()) {
      this.router.navigate(['/seller/categories']);
      return;
    }
    if (this.selectedRole === 'Dealer' && this.authService.isDealerAuthenticated()) {
      this.router.navigate(['/dealer/dashboard']);
      return;
    }
    if (this.selectedRole === 'Partner' && this.authService.isSpotterAuthenticated()) {
      this.router.navigate(['/snap-property/dashboard']);
      return;
    }

    // Check for role conflicts
    const activeRole = this.authService.getActiveRole();
    const normalizedActiveRole = activeRole === 'Spotter' ? 'Partner' : activeRole;
    if (normalizedActiveRole && normalizedActiveRole.toLowerCase() !== this.selectedRole.toLowerCase()) {
      this.activeConflictRole = normalizedActiveRole;
    }
  }

  logoutConflict(): void {
    this.authService.logoutCurrentRole();
    this.activeConflictRole = null;
    this.errorMessage.set(null);
    this.notificationService.show('Session Ended', 'Previous session cleared. You can now login.', 'info');
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  get currentRole(): AuthRoleType {
    switch (this.selectedRole) {
      case 'Seller': return 'SELLER';
      case 'Dealer': return 'DEALER';
      case 'Partner': return 'SPOTTER';
      default: return 'BUYER';
    }
  }

  get currentRoleName(): string {
    return this.selectedRole;
  }

  get emailPlaceholder(): string {
    switch (this.selectedRole) {
      case 'Seller': return 'seller@example.com';
      case 'Dealer': return 'dealer@example.com';
      case 'Partner': return 'partner@example.com';
      default: return 'buyer@example.com';
    }
  }

  get registerLink(): string {
    switch (this.selectedRole) {
      case 'Seller': return '/seller/register';
      case 'Dealer': return '/dealer/register';
      case 'Partner': return '/snap-property/register';
      default: return '/register/buyer';
    }
  }

  get registerQueryParams(): any {
    return { role: this.selectedRole.toLowerCase() };
  }

  // Unified Login Submission
  async handleLogin(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const cleanEmail = this.email.trim().toLowerCase();
    const cleanPassword = this.password;

    if (!cleanEmail || !cleanPassword) {
      this.errorMessage.set('Please fill in both email and password.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.selectedRole === 'Buyer') {
        const result = await this.authService.login({
          email: cleanEmail,
          password: cleanPassword
        });
        if (result.success) {
          this.successMessage.set('Login successful! Redirecting...');
          setTimeout(() => this.router.navigateByUrl(this.returnUrl()), 600);
        } else {
          this.errorMessage.set(result.message);
        }
      } else if (this.selectedRole === 'Seller') {
        const result = await this.authService.loginSeller(cleanEmail, cleanPassword);
        if (result.success) {
          this.successMessage.set('Seller login successful! Opening Seller Portal...');
          setTimeout(() => this.router.navigate(['/seller/categories']), 600);
        } else {
          this.errorMessage.set(result.message);
        }
      } else if (this.selectedRole === 'Dealer') {
        const result = await this.authService.loginDealer(cleanEmail, cleanPassword);
        if (result.success) {
          this.successMessage.set('Dealer login successful! Opening Dealer Dashboard...');
          setTimeout(() => this.router.navigate(['/dealer/dashboard']), 600);
        } else {
          this.errorMessage.set(result.message);
        }
      } else if (this.selectedRole === 'Partner') {
        this.http.post<any>(`${getApiBaseUrl()}/auth/login`, {
          email: cleanEmail,
          password: cleanPassword
        }).subscribe({
          next: (res) => {
            const userRole = (res.user?.role || '').toUpperCase();
            if (userRole === 'SELLER') {
              this.errorMessage.set('This account is registered as a Seller. Please select Seller in the Role dropdown.');
              this.isSubmitting.set(false);
              return;
            }
            if (userRole === 'DEALER') {
              this.errorMessage.set('This account is registered as a Dealer. Please select Dealer in the Role dropdown.');
              this.isSubmitting.set(false);
              return;
            }

            this.successMessage.set('Partner login successful! Opening Partner Dashboard...');
            const sessionData = {
              token: res.token,
              user: {
                id: res.user?.id,
                name: res.user?.name,
                email: res.user?.email,
                mobile: res.user?.mobile,
                role: 'COMMON_PEOPLE'
              },
              expiresAt: Date.now() + 86400000 * 30
            };
            localStorage.setItem('aura_common_session', JSON.stringify(sessionData));
            this.notificationService.show('Welcome Back Partner!', `Logged in as ${res.user?.name}`, 'success');
            setTimeout(() => this.router.navigate(['/snap-property/dashboard']), 600);
          },
          error: (err) => {
            this.errorMessage.set(err.error?.message || 'Invalid email or password.');
            this.isSubmitting.set(false);
          }
        });
      }
    } catch (err: any) {
      this.errorMessage.set(err.message || 'An unexpected error occurred during login.');
    } finally {
      if (this.selectedRole !== 'Partner') {
        this.isSubmitting.set(false);
      }
    }
  }
}

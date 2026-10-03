import { Component, OnInit, signal, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

export type AuthRoleType = 'BUYER' | 'SELLER' | 'DEALER' | 'SPOTTER';

@Component({
  selector: 'app-common-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-container">
      <div class="auth-card">
        
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
            <span class="tab-label">Partner</span>
          </button>
        </div>

        <!-- Dynamic Brand / Header -->
        <div class="auth-header">
          <div class="role-badge" [ngClass]="roleBadgeClass">
            <span class="badge-icon">{{ roleIcon }}</span>
            <span>{{ roleBadgeText }}</span>
          </div>
          <div class="logo-mark">
            <span class="gold-text">ACRES</span><span class="white-text">Bazaar</span>
          </div>
          <h1 class="dynamic-auth-title">{{ dynamicTitle }}</h1>
          <p class="subtitle">{{ dynamicSubtitle }}</p>
        </div>

        <!-- Role Conflict Warning -->
        <div *ngIf="activeConflictRole" class="alert-box conflict">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div style="flex: 1;">
            <div><strong>Active {{ activeConflictRole }} Session:</strong> You are already logged in as a {{ activeConflictRole }}. Please logout first before logging in as a {{ currentRoleName }}.</div>
            <button type="button" class="btn-conflict-logout" (click)="logoutConflict()">Logout {{ activeConflictRole }}</button>
          </div>
        </div>

        <!-- Global Error Alert -->
        <div *ngIf="errorMessage()" class="alert-box error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Global Success Alert -->
        <div *ngIf="successMessage()" class="alert-box success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage() }}</span>
        </div>

        <!-- Common Login Form -->
        <form (ngSubmit)="handleLogin()" #loginForm="ngForm" class="auth-form" novalidate>
          
          <!-- Email / Username Field -->
          <div class="form-group">
            <label for="email">{{ emailLabel }}</label>
            <div class="input-wrapper" [class.error]="emailCtrl.invalid && (emailCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="email"
                #emailCtrl="ngModel"
                required
                email
                [placeholder]="emailPlaceholder"
                autocomplete="email"
              />
            </div>
            <div class="field-error" *ngIf="emailCtrl.invalid && (emailCtrl.touched || submitted)">
              <span *ngIf="emailCtrl.errors?.['required']">Email address is required</span>
              <span *ngIf="emailCtrl.errors?.['email']">Please enter a valid email address</span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <div class="label-with-link">
              <label for="password">Password</label>
              <a *ngIf="currentRole === 'BUYER'" [routerLink]="['/forgot-password']" [queryParams]="{ returnUrl: returnUrl() }" class="forgot-link">
                Forgot Password?
              </a>
            </div>
            <div class="input-wrapper" [class.error]="passwordCtrl.invalid && (passwordCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                name="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                #passwordCtrl="ngModel"
                required
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="togglePasswordVisibility()"
                tabindex="-1"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
              >
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
            <div class="field-error" *ngIf="passwordCtrl.invalid && (passwordCtrl.touched || submitted)">
              <span *ngIf="passwordCtrl.errors?.['required']">Password is required</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit"
            [class.submitting]="isSubmitting()"
            [disabled]="isSubmitting() || !!activeConflictRole"
          >
            <span *ngIf="!isSubmitting()">{{ submitButtonText }}</span>
            <span *ngIf="isSubmitting()" class="spinner-label">
              <span class="spinner"></span>
              Authenticating {{ currentRoleName }}...
            </span>
          </button>
        </form>

        <!-- Dynamic Switch to Register Link -->
        <div class="auth-footer">
          <p>
            Don't have a {{ currentRoleName }} account?
            <a [routerLink]="registerLink" [queryParams]="registerQueryParams" class="register-link">
              Register as {{ currentRoleName }} →
            </a>
          </p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: radial-gradient(circle at top center, #1e293b 0%, #0b0f19 70%, #05070c 100%);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .auth-page-container {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .auth-card {
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 32px 36px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.05);
      position: relative;
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
      margin-bottom: 24px;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 12px;
    }

    .role-badge.buyer-badge {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .role-badge.seller-badge {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .role-badge.dealer-badge {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .role-badge.spotter-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .logo-mark {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .gold-text { color: #f59e0b; }
    .white-text { color: #f8fafc; }

    .dynamic-auth-title {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 6px;
      letter-spacing: -0.01em;
    }

    .subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .alert-box {
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 12.5px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 18px;
      line-height: 1.4;
    }

    .alert-box.conflict {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fcd34d;
    }

    .btn-conflict-logout {
      margin-top: 6px;
      background: #f59e0b;
      color: #000;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }

    .alert-box.error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .alert-box.success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .form-group {
      margin-bottom: 18px;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 6px;
    }

    .label-with-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 12px;
      color: #f59e0b;
      text-decoration: none;
      font-weight: 600;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #0b0f19;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
    }

    .input-wrapper.error {
      border-color: #ef4444;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      color: #64748b;
    }

    .input-wrapper input {
      width: 100%;
      padding: 12px 14px 12px 38px;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 14px;
      outline: none;
    }

    .toggle-password {
      background: none;
      border: none;
      color: #64748b;
      padding: 8px 12px;
      cursor: pointer;
    }

    .toggle-password:hover {
      color: #fff;
    }

    .field-error {
      color: #f87171;
      font-size: 11.5px;
      margin-top: 4px;
    }

    .btn-submit {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0b0f19;
      border: none;
      border-radius: 10px;
      font-size: 14.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
      transition: all 0.2s ease;
      margin-top: 8px;
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 13px;
      color: #94a3b8;
    }

    .register-link {
      color: #f59e0b;
      text-decoration: none;
      font-weight: 700;
      margin-left: 4px;
    }

    .register-link:hover {
      text-decoration: underline;
    }
  `]
})
export class CommonLoginComponent implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Optional Input from parent component
  @Input() role?: AuthRoleType | string;

  // Form State
  email = '';
  password = '';
  submitted = false;
  showPassword = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  returnUrl = signal<string>('/');

  // Role State
  currentRole: AuthRoleType = 'BUYER';
  activeConflictRole: string | null = null;

  ngOnInit(): void {
    if (this.role) {
      this.setRole(this.role);
    } else {
      this.detectRoleFromContext();
    }

    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl.set(params['returnUrl']);
      }
      if (params['role'] && !this.role) {
        this.setRole(params['role']);
      }
    });

    this.checkConflictAndRedirect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role'] && this.role) {
      this.setRole(this.role);
      this.checkConflictAndRedirect();
    }
  }

  detectRoleFromContext(): void {
    // 1. From route data
    const dataRole = this.route.snapshot.data['role'];
    if (dataRole) {
      this.setRole(dataRole);
      return;
    }

    // 2. From URL path
    const url = this.router.url.toLowerCase();
    if (url.includes('/seller/') || url.includes('/sellers/')) {
      this.currentRole = 'SELLER';
    } else if (url.includes('/dealer/') || url.includes('/dealers/')) {
      this.currentRole = 'DEALER';
    } else if (url.includes('/snap-property/') || url.includes('/spotter/') || url.includes('/spotters/')) {
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

  switchRole(role: AuthRoleType): void {
    this.currentRole = role;
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.checkConflictAndRedirect();
  }

  checkConflictAndRedirect(): void {
    this.activeConflictRole = null;

    // If already logged in as this exact role, redirect to corresponding dashboard
    if (this.currentRole === 'BUYER' && this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl());
      return;
    }
    if (this.currentRole === 'SELLER' && this.authService.isSellerAuthenticated()) {
      this.router.navigate(['/seller/categories']);
      return;
    }
    if (this.currentRole === 'DEALER' && this.authService.isDealerAuthenticated()) {
      this.router.navigate(['/dealer/dashboard']);
      return;
    }
    if (this.currentRole === 'SPOTTER' && this.authService.isSpotterAuthenticated()) {
      this.router.navigate(['/snap-property/dashboard']);
      return;
    }

    // Check for role conflicts
    const activeRole = this.authService.getActiveRole();
    if (activeRole && activeRole.toUpperCase() !== this.currentRole && !(activeRole === 'Spotter' && this.currentRole === 'SPOTTER')) {
      this.activeConflictRole = activeRole;
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

  // Dynamic Getters for UI
  get currentRoleName(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Seller';
      case 'DEALER': return 'Dealer';
      case 'SPOTTER': return 'Partner';
      default: return 'Buyer';
    }
  }

  get dynamicTitle(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Seller Login';
      case 'DEALER': return 'Dealer Login';
      case 'SPOTTER': return 'Partner Login';
      default: return 'Buyer Login';
    }
  }

  get dynamicSubtitle(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Access your seller dashboard, manage Platinum properties & verify listings';
      case 'DEALER': return 'Access your agency dashboard, property allocations & earn reward commissions';
      case 'SPOTTER': return 'Sign in to upload TO-LET signboards, track points & redeem cash rewards';
      default: return 'Access premium property details, legal records & dealer contacts';
    }
  }

  get roleBadgeText(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'SELLER PORTAL';
      case 'DEALER': return 'DEALER PORTAL';
      case 'SPOTTER': return 'PARTNER PORTAL';
      default: return 'BUYER PORTAL';
    }
  }

  get roleBadgeClass(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'seller-badge';
      case 'DEALER': return 'dealer-badge';
      case 'SPOTTER': return 'spotter-badge';
      default: return 'buyer-badge';
    }
  }

  get roleIcon(): string {
    switch (this.currentRole) {
      case 'SELLER': return '🏠';
      case 'DEALER': return '🏢';
      case 'SPOTTER': return '📸';
      default: return '👤';
    }
  }

  get emailLabel(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Seller Email / Gmail Address';
      case 'DEALER': return 'Dealer Email / Business Address';
      case 'SPOTTER': return 'Partner Email / Gmail Address';
      default: return 'Email / Gmail Address';
    }
  }

  get emailPlaceholder(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'seller@example.com';
      case 'DEALER': return 'dealer@agency.com';
      case 'SPOTTER': return 'partner@example.com';
      default: return 'buyer@example.com';
    }
  }

  get submitButtonText(): string {
    switch (this.currentRole) {
      case 'SELLER': return 'Login to Seller Portal';
      case 'DEALER': return 'Login to Dealer Portal';
      case 'SPOTTER': return 'Login & Start Snapping';
      default: return 'Login to Buyer Portal';
    }
  }

  get registerLink(): string {
    switch (this.currentRole) {
      case 'SELLER': return '/seller/register';
      case 'DEALER': return '/dealer/register';
      case 'SPOTTER': return '/snap-property/register';
      default: return '/register/buyer';
    }
  }

  get registerQueryParams(): any {
    return { role: this.currentRole.toLowerCase() };
  }

  // Unified Login Submission
  async handleLogin(): Promise<void> {
    this.submitted = true;
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in both email and password.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.currentRole === 'BUYER') {
        const result = await this.authService.login({
          email: this.email,
          password: this.password
        });
        if (result.success) {
          this.successMessage.set('Login successful! Redirecting...');
          setTimeout(() => this.router.navigateByUrl(this.returnUrl()), 600);
        } else {
          this.errorMessage.set(result.message);
        }
      } else if (this.currentRole === 'SELLER') {
        const result = await this.authService.loginSeller(this.email, this.password);
        if (result.success) {
          this.successMessage.set('Seller login successful! Opening Seller Portal...');
          setTimeout(() => this.router.navigate(['/seller/categories']), 600);
        } else {
          this.errorMessage.set(result.message);
        }
      } else if (this.currentRole === 'DEALER') {
        const result = await this.authService.loginDealer(this.email, this.password);
        if (result.success) {
          this.successMessage.set('Dealer login successful! Opening Dealer Dashboard...');
          setTimeout(() => this.router.navigate(['/dealer/dashboard']), 600);
        } else {
          this.errorMessage.set(result.message);
        }
      } else if (this.currentRole === 'SPOTTER') {
        this.http.post<any>(`${getApiBaseUrl()}/auth/login`, {
          email: this.email.trim().toLowerCase(),
          password: this.password
        }).subscribe({
          next: (res) => {
            const userRole = (res.user?.role || '').toUpperCase();
            if (userRole === 'SELLER') {
              this.errorMessage.set('This account is registered as a Seller. Please use Seller Login to access your Seller Dashboard.');
              this.isSubmitting.set(false);
              return;
            }
            if (userRole === 'DEALER') {
              this.errorMessage.set('This account is registered as a Dealer. Please use Dealer Login.');
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
      if (this.currentRole !== 'SPOTTER') {
        this.isSubmitting.set(false);
      }
    }
  }
}

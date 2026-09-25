import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-buyer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-container">
      <div class="auth-card">
        <!-- Brand / Header -->
        <div class="auth-header">
          <div class="logo-mark">
            <span class="gold-text">ACRES</span><span class="white-text">Bazaar</span>
          </div>
          <h1>Buyer Portal Login</h1>
          <p class="subtitle">Access premium property details, legal records & dealer contacts</p>
        </div>

        <!-- Role Conflict Warning -->
        <div *ngIf="activeConflictRole" class="alert-box conflict">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div style="flex: 1;">
            <div><strong>Active {{ activeConflictRole }} Session:</strong> You are already logged in as a {{ activeConflictRole }}. Please logout first before logging in as a Buyer.</div>
            <button type="button" class="btn-conflict-logout" (click)="logoutConflict()">Logout {{ activeConflictRole }}</button>
          </div>
        </div>

        <!-- Global Error -->
        <div *ngIf="errorMessage()" class="alert-box error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Global Success -->
        <div *ngIf="successMessage()" class="alert-box success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage() }}</span>
        </div>

        <form (ngSubmit)="handleLogin()" #loginForm="ngForm" class="auth-form" novalidate>
          <!-- Email / Gmail -->
          <div class="form-group">
            <label for="email">Email / Gmail Address</label>
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
                placeholder="name@example.com"
                autocomplete="email"
              />
            </div>
            <div class="field-error" *ngIf="emailCtrl.invalid && (emailCtrl.touched || submitted)">
              <span *ngIf="emailCtrl.errors?.['required']">Email address is required</span>
              <span *ngIf="emailCtrl.errors?.['email']">Please enter a valid email address</span>
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <div class="label-with-link">
              <label for="password">Password</label>
              <a [routerLink]="['/forgot-password']" [queryParams]="{ returnUrl: returnUrl() }" class="forgot-link">
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
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="pwd-toggle"
                (click)="togglePasswordVisibility()"
                tabindex="-1"
                aria-label="Toggle password visibility"
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
              <span>Password is required</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" [disabled]="isSubmitting()">
            <span *ngIf="!isSubmitting()">Login to Account</span>
            <span *ngIf="isSubmitting()" class="loading-state">
              <span class="spinner"></span> Logging In...
            </span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="auth-footer">
          <p>
            Don't have a buyer account?
            <a [routerLink]="['/register/buyer']" [queryParams]="{ returnUrl: returnUrl() }" class="register-link">
              Register as Buyer
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-container {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #0B1118 0%, #111A24 100%);
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .auth-card {
      width: 100%;
      max-width: 460px;
      background: #15202B;
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 20px;
      padding: 42px 36px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .logo-mark {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    }

    .gold-text {
      color: #D4AF37;
    }

    .white-text {
      color: #FFFFFF;
    }

    .auth-header h1 {
      color: #FFFFFF;
      font-size: 1.7rem;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }

    .subtitle {
      color: #94A3B8;
      font-size: 0.88rem;
      margin: 0;
      line-height: 1.5;
    }

    .alert-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.88rem;
      margin-bottom: 22px;
    }

    .alert-box.error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
    }

    .alert-box.success {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ADE80;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .label-with-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      color: #D4AF37;
      font-size: 0.82rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .forgot-link:hover {
      text-decoration: underline;
      color: #F3E5AB;
    }

    label {
      color: #CBD5E1;
      font-size: 0.86rem;
      font-weight: 500;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #0E1620;
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: #D4AF37;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
      background: #141F2C;
    }

    .input-wrapper.error {
      border-color: #EF4444;
    }

    .input-icon {
      margin-left: 14px;
      color: #64748B;
      flex-shrink: 0;
    }

    .input-wrapper:focus-within .input-icon {
      color: #D4AF37;
    }

    input {
      width: 100%;
      background: transparent;
      border: none;
      padding: 13px 14px 13px 10px;
      color: #FFFFFF;
      font-size: 0.94rem;
      outline: none;
    }

    input::placeholder {
      color: #64748B;
    }

    .pwd-toggle {
      background: none;
      border: none;
      color: #64748B;
      cursor: pointer;
      padding: 0 14px;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .pwd-toggle:hover {
      color: #D4AF37;
    }

    .field-error {
      color: #F87171;
      font-size: 0.8rem;
    }

    .submit-btn {
      margin-top: 10px;
      padding: 14px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border: none;
      border-radius: 10px;
      font-size: 0.98rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.25);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 26px rgba(212, 175, 55, 0.38);
      background: linear-gradient(135deg, #E2C04D 0%, #C4971A 100%);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-state {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(11, 17, 24, 0.3);
      border-top-color: #0B1118;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert-box.conflict {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 0.88rem;
      line-height: 1.5;
    }

    .btn-conflict-logout {
      margin-top: 8px;
      padding: 5px 14px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #fbbf24;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-conflict-logout:hover {
      background: rgba(245, 158, 11, 0.35);
    }

    .auth-footer {
      text-align: center;
      margin-top: 26px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.9rem;
      color: #94A3B8;
    }

    .register-link {
      color: #D4AF37;
      text-decoration: none;
      font-weight: 600;
      margin-left: 4px;
    }

    .register-link:hover {
      text-decoration: underline;
    }
  `]
})
export class BuyerLoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  returnUrl = signal<string>('/');

  showPassword = signal<boolean>(false);
  submitted: boolean = false;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  activeConflictRole: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl.set(params['returnUrl'] || '/');
      if (params['registered'] === 'true') {
        this.successMessage.set('Account created successfully! Please log in.');
      }
    });

    // If already logged in as buyer, redirect
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl());
      return;
    }

    // Check for conflicting active role
    const role = this.authService.getActiveRole();
    if (role && role !== 'Buyer') {
      this.activeConflictRole = role;
    }
  }

  logoutConflict(): void {
    this.authService.logoutCurrentRole();
    this.activeConflictRole = null;
    this.errorMessage.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

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
      const result = await this.authService.login({
        email: this.email,
        password: this.password
      });

      if (result.success) {
        this.successMessage.set('Login successful! Redirecting...');
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl());
        }, 600);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (err: any) {
      this.errorMessage.set(err.message || 'An unexpected error occurred during login.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

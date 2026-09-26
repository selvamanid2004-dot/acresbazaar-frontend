import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-snap-property-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-wrapper">
      
      <!-- Top Navigation / Breadcrumbs -->
      <section class="auth-nav-bar">
        <div class="container">
          <div class="nav-bar-inner">
            <a routerLink="/" class="btn-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Home</span>
            </a>

            <nav class="breadcrumb-nav" aria-label="Breadcrumb">
              <ol class="breadcrumb-list">
                <li><a routerLink="/" class="crumb-link">Home</a></li>
                <li class="crumb-sep">/</li>
                <li><span class="crumb-current">Spotter Log In</span></li>
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
              <div class="role-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 5px;">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                COMMON PEOPLE · SNAP SPOTTER
              </div>
              <h1 class="auth-title">Spotter Log In</h1>
              <p class="auth-sub">
                Sign in to your account and upload TO-LET board snaps with GPS location.
              </p>
            </div>

            <!-- Active Role Conflict Banner -->
            <div class="alert-banner warning-banner" *ngIf="activeConflictRole">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div style="flex: 1;">
                <div><strong>Active {{ activeConflictRole }} Session:</strong> You are logged in as a {{ activeConflictRole }}. Please logout before logging in as a Spotter.</div>
                <button type="button" class="btn-conflict-logout" (click)="logoutConflict()">Logout {{ activeConflictRole }}</button>
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

            <!-- Form -->
            <form (ngSubmit)="onSubmit()" class="auth-form" novalidate>
              
              <div class="form-group">
                <label for="email" class="form-label">Email Address <span class="required">*</span></label>
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

              <div class="form-group">
                <label for="password" class="form-label">Password <span class="required">*</span></label>
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
                    placeholder="Enter your password" 
                    class="form-control password-input" />
                  <button 
                    type="button" 
                    class="btn-toggle-pw" 
                    (click)="showPassword = !showPassword"
                    [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
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

              <button 
                type="submit" 
                class="btn-submit" 
                [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span>Log In & Start Snapping</span>
                </span>
                <span *ngIf="isSubmitting" class="loading-state">
                  <span class="spinner"></span>
                  <span>Signing In...</span>
                </span>
              </button>

            </form>

            <div class="auth-card-footer">
              <p>
                Don't have a spotter account yet? 
                <a routerLink="/snap-property/register" class="link-highlight">Register as Spotter</a>
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8fafc;
      font-family: inherit;
    }

    .auth-page-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .auth-nav-bar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 0;
    }

    .container {
      width: 100%;
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 1.25rem;
    }

    .nav-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }

    .btn-back:hover {
      color: #0f172a;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.82rem;
    }

    .crumb-link {
      color: #64748b;
      text-decoration: none;
    }

    .crumb-sep {
      color: #cbd5e1;
    }

    .crumb-current {
      color: #0f172a;
      font-weight: 600;
    }

    .auth-card-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
    }

    .auth-card-container {
      max-width: 460px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      padding: 2.5rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.85rem;
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin-bottom: 0.85rem;
    }

    .auth-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }

    .auth-sub {
      color: #64748b;
      font-size: 0.92rem;
      line-height: 1.5;
      margin: 0;
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }

    .warning-banner {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      color: #92400e;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .btn-conflict-logout {
      margin-top: 8px;
      padding: 6px 14px;
      background: #d97706;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-conflict-logout:hover {
      background: #b45309;
    }

    .success-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
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
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 1rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      height: 46px;
      padding: 0 1rem 0 2.75rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.92rem;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #10b981;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .password-input {
      padding-right: 2.75rem;
    }

    .btn-toggle-pw {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-toggle-pw:hover {
      color: #475569;
    }

    .btn-submit {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      transition: all 0.2s;
      margin-top: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }

    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-card-footer {
      text-align: center;
      margin-top: 1.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
      font-size: 0.88rem;
      color: #64748b;
    }

    .link-highlight {
      color: #059669;
      font-weight: 700;
      text-decoration: none;
    }

    .link-highlight:hover {
      text-decoration: underline;
    }
  `]
})
export class SnapPropertyLoginComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);

  email = '';
  password = '';
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  activeConflictRole: string | null = null;

  ngOnInit(): void {
    const commonSession = localStorage.getItem('aura_common_session');
    if (commonSession) {
      this.router.navigate(['/snap-property/dashboard']);
      return;
    }

    const role = this.authService.getActiveRole();
    if (role && role !== 'Spotter') {
      this.activeConflictRole = role;
    }
  }

  logoutConflict(): void {
    this.authService.logoutCurrentRole();
    this.activeConflictRole = null;
    this.notificationService.show('Session Ended', 'Logged out successfully. You can now login as a Spotter.', 'info');
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    const activeRole = this.authService.getActiveRole();
    if (activeRole && activeRole !== 'Spotter') {
      this.activeConflictRole = activeRole;
      this.errorMessage = `You are currently logged in as a ${activeRole}. You cannot login as a Spotter at the same time. Please logout of your ${activeRole} account first.`;
      return;
    }

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.isSubmitting = true;

    this.http.post<any>(`${getApiBaseUrl()}/auth/login`, {
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = 'Login successful! Opening your snaps & rewards dashboard...';

        const sessionData = {
          token: res.token,
          user: {
            id: res.user?.id,
            name: res.user?.name,
            email: res.user?.email,
            mobile: res.user?.mobile,
            role: res.user?.role || 'COMMON_PEOPLE'
          },
          expiresAt: Date.now() + 86400000 * 30
        };

        localStorage.setItem('aura_common_session', JSON.stringify(sessionData));
        this.notificationService.show('Welcome Back!', `Logged in as ${res.user?.name}`, 'success');

        setTimeout(() => {
          this.router.navigate(['/snap-property/dashboard']);
        }, 600);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }
}

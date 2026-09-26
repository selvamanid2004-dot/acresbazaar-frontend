import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-container">
      <div class="auth-card">
        <!-- Back link -->
        <a [routerLink]="['/login']" [queryParams]="{ returnUrl: returnUrl() }" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Login
        </a>

        <!-- Header -->
        <div class="auth-header">
          <div class="icon-badge">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2">
              <path d="M21 2l-2 2m-1-1l-3 3m-2-2l-3 3m-2-2l-3 3"></path>
              <circle cx="7.5" cy="15.5" r="5.5"></circle>
              <path d="M16 8l4-4"></path>
            </svg>
          </div>
          <h1>Reset Password</h1>
          <p class="subtitle">Enter your registered email address and create a new password</p>
        </div>

        <!-- Global Alert Box -->
        <div *ngIf="errorMessage()" class="alert-box error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <div *ngIf="successMessage()" class="alert-box success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage() }}</span>
        </div>

        <!-- Reset Form -->
        <form (ngSubmit)="handleResetPassword()" class="auth-form" novalidate>
          <div class="form-group">
            <label for="fp-email">Registered Email / Gmail Address</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="fp-email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="name@example.com"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password (min. 6 characters)</label>
            <div class="input-wrapper">
              <input
                id="newPassword"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="newPassword"
                name="newPassword"
                required
                placeholder="Enter new secure password"
              />
              <button type="button" class="pwd-toggle" (click)="togglePassword()">
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <div class="input-wrapper">
              <input
                id="confirmPassword"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="isSubmitting() || !email || !newPassword || !confirmPassword">
            <span *ngIf="!isSubmitting()">Update Password & Login</span>
            <span *ngIf="isSubmitting()" class="loading-state">
              <span class="spinner"></span> Updating...
            </span>
          </button>
        </form>
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
      padding: 40px 36px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #94A3B8;
      font-size: 0.88rem;
      text-decoration: none;
      margin-bottom: 24px;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #D4AF37;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 26px;
    }

    .icon-badge {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .auth-header h1 {
      color: #FFFFFF;
      font-size: 1.65rem;
      font-weight: 700;
      margin: 0 0 8px;
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

    label {
      color: #CBD5E1;
      font-size: 0.86rem;
      font-weight: 500;
    }

    .input-wrapper {
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

    .input-icon {
      margin-left: 14px;
      color: #64748B;
      flex-shrink: 0;
    }

    input {
      width: 100%;
      background: transparent;
      border: none;
      padding: 13px 14px;
      color: #FFFFFF;
      font-size: 0.94rem;
      outline: none;
    }

    .pwd-toggle {
      background: none;
      border: none;
      color: #D4AF37;
      font-size: 0.82rem;
      padding: 0 14px;
      cursor: pointer;
    }

    .submit-btn {
      margin-top: 8px;
      padding: 14px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border: none;
      border-radius: 10px;
      font-size: 0.98rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(212, 175, 55, 0.35);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-state {
      display: inline-flex;
      align-items: center;
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
  `]
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  returnUrl = signal<string>('/');
  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl.set(params['returnUrl'] || '/login');
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  async handleResetPassword(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.email || !this.email.includes('@')) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const result = await this.authService.resetPassword({
        email: this.email,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword
      });

      if (result.success) {
        this.successMessage.set('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.returnUrl() }
          });
        }, 1200);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to update password.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

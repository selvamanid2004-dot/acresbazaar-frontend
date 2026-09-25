import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dealer-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <div class="role-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            DEALER / AGENCY PORTAL
          </div>
          <div class="logo-mark">
            <span class="gold-text">ACRES</span><span class="white-text">Bazaar</span>
          </div>
          <h1>Create Dealer Account</h1>
          <p class="subtitle">Showcase your portfolio, publish verified Platinum listings & reach high-net-worth buyers</p>
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

        <!-- Registration Form -->
        <form (ngSubmit)="handleRegister()" #regForm="ngForm" class="auth-form" novalidate>
          <!-- Full Name / Business Name -->
          <div class="form-group">
            <label for="fullName">Full Name / Business Name <span class="req">*</span></label>
            <div class="input-wrapper" [class.error]="nameCtrl.invalid && (nameCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                id="fullName"
                name="fullName"
                type="text"
                [(ngModel)]="formData.fullName"
                #nameCtrl="ngModel"
                required
                minlength="3"
                placeholder="e.g. Apex Realty Partners / Vikram Mehta"
                autocomplete="name"
              />
            </div>
            <div class="field-error" *ngIf="nameCtrl.invalid && (nameCtrl.touched || submitted)">
              <span *ngIf="nameCtrl.errors?.['required']">Full Name / Business Name is required</span>
              <span *ngIf="nameCtrl.errors?.['minlength']">Minimum 3 characters required</span>
            </div>
          </div>

          <!-- Mobile Number -->
          <div class="form-group">
            <label for="phone">Mobile Number <span class="req">*</span></label>
            <div class="input-wrapper" [class.error]="phoneCtrl.invalid && (phoneCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input
                id="phone"
                name="phone"
                type="tel"
                [(ngModel)]="formData.phone"
                #phoneCtrl="ngModel"
                required
                pattern="^[0-9+\\-\\s]{10,15}$"
                placeholder="10-digit mobile number"
                autocomplete="tel"
              />
            </div>
            <div class="field-error" *ngIf="phoneCtrl.invalid && (phoneCtrl.touched || submitted)">
              <span *ngIf="phoneCtrl.errors?.['required']">Mobile number is required</span>
              <span *ngIf="phoneCtrl.errors?.['pattern']">Please enter a valid 10-digit phone number</span>
            </div>
          </div>

          <!-- Email / Gmail -->
          <div class="form-group">
            <label for="email">Email / Gmail Address <span class="req">*</span></label>
            <div class="input-wrapper" [class.error]="emailCtrl.invalid && (emailCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="formData.email"
                #emailCtrl="ngModel"
                required
                email
                placeholder="agency@example.com"
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
            <label for="password">Password <span class="req">*</span></label>
            <div class="input-wrapper" [class.error]="pwdCtrl.invalid && (pwdCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                name="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="formData.password"
                #pwdCtrl="ngModel"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
                autocomplete="new-password"
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
            <div class="field-error" *ngIf="pwdCtrl.invalid && (pwdCtrl.touched || submitted)">
              <span *ngIf="pwdCtrl.errors?.['required']">Password is required</span>
              <span *ngIf="pwdCtrl.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password <span class="req">*</span></label>
            <div class="input-wrapper" [class.error]="(cpwdCtrl.invalid || passwordsMismatch()) && (cpwdCtrl.touched || submitted)">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="confirmPassword"
                name="confirmPassword"
                [type]="showConfirmPassword() ? 'text' : 'password'"
                [(ngModel)]="formData.confirmPassword"
                #cpwdCtrl="ngModel"
                required
                placeholder="Re-enter password"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="pwd-toggle"
                (click)="toggleConfirmPasswordVisibility()"
                tabindex="-1"
                aria-label="Toggle confirm password visibility"
              >
                <svg *ngIf="!showConfirmPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showConfirmPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div class="field-error" *ngIf="passwordsMismatch() && (cpwdCtrl.touched || submitted)">
              <span>Passwords do not match</span>
            </div>
          </div>

          <!-- Instant notice -->
          <div class="instant-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Instant activation — No email OTP required</span>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" [disabled]="isSubmitting()">
            <span *ngIf="!isSubmitting()">Create Dealer Account</span>
            <span *ngIf="isSubmitting()" class="loading-state">
              <span class="spinner"></span> Creating Account...
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="auth-footer">
          <p>
            Already have a dealer account?
            <a [routerLink]="['/dealer/login']" class="login-link">
              Login to Dealer Portal
            </a>
          </p>
          <div class="other-roles">
            <span>Register as:</span>
            <a [routerLink]="['/register/buyer']">Buyer</a>
            <span class="dot">•</span>
            <a [routerLink]="['/seller/register']">Seller</a>
          </div>
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
      max-width: 500px;
      background: #15202B;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 20px;
      padding: 38px 36px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #E2C044;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 5px 12px;
      border-radius: 20px;
      margin-bottom: 14px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 26px;
    }

    .logo-mark {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .gold-text {
      background: linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #AA820A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .white-text {
      color: #FFFFFF;
    }

    h1 {
      font-size: 1.55rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 0.88rem;
      color: #94A3B8;
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
      margin-bottom: 20px;
    }

    .alert-box.error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #FCA5A5;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #CBD5E1;
      letter-spacing: 0.01em;
    }

    .req {
      color: #D4AF37;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #0B1118;
      border: 1.5px solid #243447;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: #D4AF37;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
    }

    .input-wrapper.error {
      border-color: #EF4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: #64748B;
      pointer-events: none;
      flex-shrink: 0;
    }

    input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: #F8FAFC;
      font-size: 0.95rem;
      padding: 13px 44px 13px 44px;
      font-family: inherit;
    }

    input::placeholder {
      color: #475569;
    }

    .pwd-toggle {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: #64748B;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .pwd-toggle:hover {
      color: #CBD5E1;
    }

    .field-error {
      font-size: 0.78rem;
      color: #F87171;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .instant-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: 8px;
      color: #86EFAC;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .submit-btn {
      width: 100%;
      padding: 14px 20px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
      font-family: inherit;
      margin-top: 4px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(212, 175, 55, 0.4);
      background: linear-gradient(135deg, #E2C044 0%, #C4970E 100%);
    }

    .submit-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid #0B1118;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #1E2D3D;
    }

    .auth-footer p {
      font-size: 0.88rem;
      color: #94A3B8;
      margin: 0 0 12px 0;
    }

    .login-link {
      color: #D4AF37;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .login-link:hover {
      color: #F3E5AB;
      text-decoration: underline;
    }

    .other-roles {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #64748B;
    }

    .other-roles a {
      color: #94A3B8;
      text-decoration: none;
      transition: color 0.2s;
    }

    .other-roles a:hover {
      color: #D4AF37;
    }

    .dot {
      color: #334155;
    }
  `]
})
export class DealerRegisterComponent {
  formData = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  submitted = false;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  passwordsMismatch(): boolean {
    return !!(this.formData.password && this.formData.confirmPassword &&
      this.formData.password !== this.formData.confirmPassword);
  }

  async handleRegister(): Promise<void> {
    this.submitted = true;
    this.errorMessage.set(null);

    const { fullName, phone, email, password, confirmPassword } = this.formData;

    if (!fullName || !phone || !email || !password || !confirmPassword) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const result = await this.authService.registerDealer({
        fullName,
        businessName: fullName,
        phone,
        email,
        password,
        confirmPassword
      });

      this.isSubmitting.set(false);

      if (result.success) {
        // Immediate registration complete - redirect to dealer login
        this.router.navigate(['/dealer/login'], {
          queryParams: { registered: 'true' }
        });
      } else {
        this.errorMessage.set(result.message || 'Registration failed. Please try again.');
      }
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('An error occurred during registration. Please try again.');
    }
  }
}

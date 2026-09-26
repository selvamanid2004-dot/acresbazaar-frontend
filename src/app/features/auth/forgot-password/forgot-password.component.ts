import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
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

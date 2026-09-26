import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-snap-property-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './snap-property-register.component.html',
  styleUrl: './snap-property-register.component.css'
})
export class SnapPropertyRegisterComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  formData = {
    name: '',
    email: '',
    mobile: '',
    city: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  agreeTerms = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    // If already logged in, redirect straight to upload
    const commonSession = localStorage.getItem('aura_common_session');
    if (commonSession || this.authService.isAuthenticated()) {
      this.router.navigate(['/snap-property/upload']);
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.name.trim() || !this.formData.email.trim() || !this.formData.mobile.trim() || !this.formData.password) {
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
      this.errorMessage = 'Please accept the spotter guidelines to continue.';
      return;
    }

    this.isSubmitting = true;

    try {
      const payload = {
        name: this.formData.name.trim(),
        email: this.formData.email.trim().toLowerCase(),
        mobile: this.formData.mobile.trim(),
        password: this.formData.password,
        role: 'COMMON_PEOPLE'
      };

      this.http.post<any>(`${getApiBaseUrl()}/auth/register`, payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.successMessage = 'Spotter account created! Launching camera upload module...';

          const sessionData = {
            token: res.token,
            user: {
              id: res.user?.id || 'spotter-' + Date.now(),
              name: res.user?.name || this.formData.name,
              email: res.user?.email || this.formData.email,
              mobile: res.user?.mobile || this.formData.mobile,
              city: this.formData.city,
              role: 'COMMON_PEOPLE'
            },
            expiresAt: Date.now() + 86400000 * 30
          };

          localStorage.setItem('aura_common_session', JSON.stringify(sessionData));
          this.notificationService.show('Welcome Spotter!', 'Registration successful. You can now snap TO-LET boards.', 'success');

          setTimeout(() => {
            this.router.navigate(['/snap-property/upload']);
          }, 800);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Registration failed. An account with this email may already exist.';
        }
      });
    } catch (e: any) {
      this.isSubmitting = false;
      this.errorMessage = e.message || 'An unexpected error occurred.';
    }
  }
}

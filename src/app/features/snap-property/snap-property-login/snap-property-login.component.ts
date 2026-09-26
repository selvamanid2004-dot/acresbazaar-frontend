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
  templateUrl: './snap-property-login.component.html',
  styleUrl: './snap-property-login.component.css'
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

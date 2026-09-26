import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-buyer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buyer-login.component.html',
  styleUrl: './buyer-login.component.css'
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

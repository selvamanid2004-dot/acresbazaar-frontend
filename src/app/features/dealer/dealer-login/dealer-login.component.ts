import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dealer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dealer-login.component.html',
  styleUrl: './dealer-login.component.css'
})
export class DealerLoginComponent implements OnInit {
  email = '';
  password = '';
  submitted = false;
  showPassword = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  returnUrl = signal<string>('/dealer/dashboard');
  activeConflictRole: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isDealerAuthenticated()) {
      this.router.navigate(['/dealer/dashboard']);
      return;
    }

    const returnUrlParam = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrlParam) {
      this.returnUrl.set(returnUrlParam);
    }

    const regSuccess = this.route.snapshot.queryParams['registered'];
    if (regSuccess) {
      this.successMessage.set('Dealer account created successfully! Please login with your credentials.');
    }

    // Check for conflicting active role
    const role = this.authService.getActiveRole();
    if (role && role !== 'Dealer') {
      this.activeConflictRole = role;
    }
  }

  logoutConflict(): void {
    this.authService.logoutCurrentRole();
    this.activeConflictRole = null;
    this.errorMessage.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }

  async handleLogin(): Promise<void> {
    this.submitted = true;
    this.errorMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in both email and password.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const result = await this.authService.loginDealer(this.email, this.password);
      this.isSubmitting.set(false);

      if (result.success) {
        this.successMessage.set('Login successful! Redirecting to Dealer Dashboard...');
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl());
        }, 600);
      } else {
        this.errorMessage.set(result.message || 'Invalid email or password.');
      }
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('An error occurred during login. Please try again.');
    }
  }
}

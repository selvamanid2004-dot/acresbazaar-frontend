import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dealer-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dealer-register.component.html',
  styleUrl: './dealer-register.component.css'
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

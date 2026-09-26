import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SellerRegisterForm } from '../../../core/models/buyer.model';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './seller-register.component.html',
  styleUrl: './seller-register.component.css'
})
export class SellerRegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  formData: SellerRegisterForm = {
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.fullName || !this.formData.mobile || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isSubmitting = true;
    try {
      const res = await this.authService.registerSeller(this.formData);
      if (res.success) {
        this.successMessage = 'Seller account created successfully! Redirecting to Seller Login...';
        setTimeout(() => {
          this.router.navigate(['/seller/login']);
        }, 1000);
      } else {
        this.errorMessage = res.message;
      }
    } catch {
      this.errorMessage = 'An error occurred during seller registration. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}

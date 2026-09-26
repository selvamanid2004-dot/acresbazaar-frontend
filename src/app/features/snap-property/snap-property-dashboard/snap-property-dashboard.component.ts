import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-snap-property-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './snap-property-dashboard.component.html',
  styleUrl: './snap-property-dashboard.component.css'
})
export class SnapPropertyDashboardComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  spotterUser: any = null;
  snaps: any[] = [];
  selectedTab = 'ALL';
  previewImg: string | null = null;

  existingClaim: any = null;
  submittingClaim = false;
  bankErrorMessage = '';

  bankData = {
    holderName: '',
    bankName: '',
    accountNo: '',
    confirmAccountNo: '',
    ifsc: '',
    upiId: ''
  };

  Math = Math;

  get totalSnaps(): number {
    return this.snaps.length;
  }

  get totalPoints(): number {
    return this.snaps.length * 100;
  }

  get progressPercent(): number {
    return Math.min(100, Math.round((this.totalPoints / 1000) * 100));
  }

  get pendingCount(): number {
    return this.snaps.filter(p => p.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.snaps.filter(p => p.status === 'APPROVED').length;
  }

  get rejectedCount(): number {
    return this.snaps.filter(p => p.status === 'REJECTED').length;
  }

  get filteredSnaps(): any[] {
    if (this.selectedTab === 'ALL') return this.snaps;
    return this.snaps.filter(p => p.status === this.selectedTab);
  }

  ngOnInit(): void {
    const commonSessionStr = localStorage.getItem('aura_common_session');
    const authSessionStr = localStorage.getItem('aura_auth_session');
    const sellerSessionStr = localStorage.getItem('aura_seller_session');

    if (commonSessionStr) {
      try {
        const session = JSON.parse(commonSessionStr);
        this.spotterUser = session.user;
      } catch {}
    } else if (authSessionStr) {
      try {
        const session = JSON.parse(authSessionStr);
        this.spotterUser = {
          id: session.buyer?.id,
          name: session.buyer?.fullName,
          email: session.buyer?.email,
          mobile: session.buyer?.phone,
          role: 'COMMON_PEOPLE'
        };
      } catch {}
    } else if (sellerSessionStr) {
      try {
        const session = JSON.parse(sellerSessionStr);
        this.spotterUser = {
          id: session.user?.id,
          name: session.user?.fullName,
          email: session.user?.email,
          mobile: session.user?.phone,
          role: 'COMMON_PEOPLE'
        };
      } catch {}
    }

    if (!this.spotterUser) {
      this.router.navigate(['/snap-property/login']);
      return;
    }

    this.bankData.holderName = this.spotterUser.name || '';
    this.loadMySnaps();
    this.loadMyClaim();
  }

  loadMySnaps() {
    const email = this.spotterUser?.email || '';
    const sellerId = this.spotterUser?.id || '';

    this.http.get<any>(`${getApiBaseUrl()}/properties/seller/listings?email=${encodeURIComponent(email)}&sellerId=${encodeURIComponent(sellerId)}`)
      .subscribe({
        next: (res) => {
          this.snaps = res.properties || [];
        },
        error: (err) => {
          console.error('Failed to load spotter snaps', err);
        }
      });
  }

  loadMyClaim() {
    const email = this.spotterUser?.email;
    if (!email) return;

    this.http.get<any>(`${getApiBaseUrl()}/rewards/my-claim?email=${encodeURIComponent(email)}`)
      .subscribe({
        next: (res) => {
          this.existingClaim = res.claim || null;
        },
        error: (err) => {
          console.error('Failed to load spotter reward claim', err);
        }
      });
  }

  submitBankDetails() {
    this.bankErrorMessage = '';

    if (!this.bankData.holderName.trim() || !this.bankData.bankName.trim() || !this.bankData.accountNo.trim() || !this.bankData.ifsc.trim()) {
      this.bankErrorMessage = 'Please complete all required bank account fields.';
      return;
    }

    if (this.bankData.accountNo.trim() !== this.bankData.confirmAccountNo.trim()) {
      this.bankErrorMessage = 'Account numbers do not match. Please verify.';
      return;
    }

    this.submittingClaim = true;

    const payload = {
      userName: this.spotterUser.name,
      userEmail: this.spotterUser.email,
      mobile: this.spotterUser.mobile,
      points: this.totalPoints,
      bankName: this.bankData.bankName.trim(),
      accountNo: this.bankData.accountNo.trim(),
      ifsc: this.bankData.ifsc.trim().toUpperCase(),
      holderName: this.bankData.holderName.trim(),
      upiId: this.bankData.upiId.trim()
    };

    this.http.post<any>(`${getApiBaseUrl()}/rewards/claim`, payload).subscribe({
      next: (res) => {
        this.submittingClaim = false;
        this.existingClaim = res.claim || res.reward;
        this.notificationService.show('Reward Claim Submitted!', 'Admin will review and disburse your ₹1,000 reward.', 'success');
      },
      error: (err) => {
        this.submittingClaim = false;
        this.bankErrorMessage = err.error?.message || 'Failed to submit reward claim. Please try again.';
      }
    });
  }

  onLogout() {
    localStorage.removeItem('aura_common_session');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

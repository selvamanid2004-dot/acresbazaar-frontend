import { Component, OnInit, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl } from '../../../core/services/api-config';
import { NotificationService } from '../../services/notification.service';

interface PointsLedgerItem {
  id: string;
  transactionType: string;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface RewardClaimItem {
  id: string;
  claimNumber: string;
  redeemedPoints: number;
  rewardAmount: number;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankAccountHolder: string;
  upiId?: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'REJECTED';
  paymentReference?: string;
  rejectionReason?: string;
  createdAt: string;
}

@Component({
  selector: 'app-partner-rewards-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rewards-wallet-container">
      
      <!-- Top Overview Header -->
      <div class="wallet-header">
        <div class="header-left">
          <div class="wallet-badge">
            <span class="pulse-dot"></span>
            PARTNER POINTS & REWARDS WALLET
          </div>
          <h2 class="wallet-title">Points Wallet & Reward Claims</h2>
          <p class="wallet-sub">
            Earn <strong>+{{ config().pointsPerProperty }} Points</strong> for every property approved by Admin. Accumulate <strong>500+ Points</strong> to claim direct cash payouts to your bank account!
          </p>
        </div>

        <div class="header-right">
          <button 
            type="button"
            class="btn-claim-main"
            [disabled]="wallet().availablePoints < 500"
            (click)="openClaimModal()"
            [class.btn-claim-enabled]="wallet().availablePoints >= 500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Claim Reward Payout</span>
          </button>
          <div *ngIf="wallet().availablePoints < 500" class="claim-req-text">
            ⚠️ You need at least 500 points to claim a reward ({{ 500 - wallet().availablePoints }} pts remaining).
          </div>
        </div>
      </div>

      <!-- 4 Standard Summary Cards -->
      <div class="wallet-stats-grid">
        <!-- 1. Available Points -->
        <div class="stat-card gold-border">
          <div class="stat-icon icon-gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="12 6 13.8 10.2 18.2 10.5 14.8 13.4 15.8 17.8 12 15.4 8.2 17.8 9.2 13.4 5.8 10.5 10.2 10.2 12 6"></polygon>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Available Points</span>
            <span class="stat-val text-gold">{{ wallet().availablePoints.toLocaleString() }} <small>pts</small></span>
            <span class="stat-sub">Ready to redeem</span>
          </div>
        </div>

        <!-- 2. Reserved Points -->
        <div class="stat-card amber-border">
          <div class="stat-icon icon-amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Reserved Points</span>
            <span class="stat-val text-amber">{{ wallet().reservedPoints.toLocaleString() }} <small>pts</small></span>
            <span class="stat-sub">In active claims</span>
          </div>
        </div>

        <!-- 3. Total Earned Points -->
        <div class="stat-card emerald-border">
          <div class="stat-icon icon-emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Total Earned</span>
            <span class="stat-val text-emerald">+{{ wallet().totalEarnedPoints.toLocaleString() }} <small>pts</small></span>
            <span class="stat-sub">Lifetime property points</span>
          </div>
        </div>

        <!-- 4. Total Redeemed Points -->
        <div class="stat-card purple-border">
          <div class="stat-icon icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="stat-meta">
            <span class="stat-label">Total Redeemed</span>
            <span class="stat-val text-purple">{{ wallet().totalRedeemedPoints.toLocaleString() }} <small>pts</small></span>
            <span class="stat-sub">Paid out in cash</span>
          </div>
        </div>
      </div>

      <!-- Rate Banner -->
      <div class="rate-banner">
        <div class="rate-badge">
          <span class="tag-icon">💰</span>
          <span>Reward Conversion Rate: <strong>{{ config().conversionRateText }}</strong></span>
        </div>
        <div class="rule-hint">
          • Minimum claim threshold: <strong>500 Points</strong>
          • Admin property approval: <strong>+{{ config().pointsPerProperty }} Points / Property</strong>
        </div>
      </div>

      <!-- History Tabs (Points History / Ledger vs Reward Claim History) -->
      <div class="wallet-tabs-card">
        <div class="tab-nav">
          <button 
            type="button"
            class="tab-link" 
            [class.active]="activeTab === 'LEDGER'" 
            (click)="activeTab = 'LEDGER'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Points History ({{ history().length }})</span>
          </button>

          <button 
            type="button"
            class="tab-link" 
            [class.active]="activeTab === 'CLAIMS'" 
            (click)="activeTab = 'CLAIMS'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Reward Claim History ({{ claims().length }})</span>
          </button>
        </div>

        <!-- TAB 1: POINTS HISTORY / LEDGER -->
        <div *ngIf="activeTab === 'LEDGER'" class="tab-body">
          <div *ngIf="history().length === 0" class="empty-table-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No points transactions recorded yet. Submit property listings to earn points upon admin approval.</p>
          </div>

          <div *ngIf="history().length > 0" class="table-responsive">
            <table class="wallet-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Transaction Type</th>
                  <th>Description</th>
                  <th>Points</th>
                  <th>Balance (Before → After)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of history()">
                  <td class="text-muted">
                    {{ item.createdAt | date:'medium' }}
                  </td>
                  <td>
                    <span class="tx-badge" [ngClass]="getBadgeClass(item.transactionType)">
                      {{ formatTxType(item.transactionType) }}
                    </span>
                  </td>
                  <td class="text-desc">
                    {{ item.description }}
                  </td>
                  <td>
                    <span class="pts-change" [ngClass]="item.points >= 0 ? 'pts-plus' : 'pts-minus'">
                      {{ item.points >= 0 ? '+' : '' }}{{ item.points }} pts
                    </span>
                  </td>
                  <td class="balance-cell">
                    {{ item.balanceBefore }} → <strong>{{ item.balanceAfter }} pts</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: REWARD CLAIM HISTORY -->
        <div *ngIf="activeTab === 'CLAIMS'" class="tab-body">
          <div *ngIf="claims().length === 0" class="empty-table-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <p>No reward claims submitted yet. Once you accumulate 500+ points, click "Claim Reward Payout".</p>
          </div>

          <div *ngIf="claims().length > 0" class="table-responsive">
            <table class="wallet-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Redeemed Points</th>
                  <th>Reward Amount</th>
                  <th>Bank Account Details</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of claims()">
                  <td>
                    <div class="claim-id-text">{{ c.claimNumber }}</div>
                  </td>
                  <td>
                    <span class="pts-badge-pill">{{ c.redeemedPoints }} Pts</span>
                  </td>
                  <td>
                    <strong class="amount-green">₹{{ c.rewardAmount | number }}</strong>
                  </td>
                  <td>
                    <div class="bank-snippet">
                      <div>🏦 {{ c.bankName }}</div>
                      <small>A/C: {{ c.bankAccountNumber }} | IFSC: {{ c.ifscCode }}</small>
                    </div>
                  </td>
                  <td class="text-muted">
                    {{ c.createdAt | date:'mediumDate' }}
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="getStatusClass(c.status)">
                      {{ c.status }}
                    </span>
                    <div *ngIf="c.paymentReference" class="pay-ref">
                      Ref: {{ c.paymentReference }}
                    </div>
                    <div *ngIf="c.rejectionReason" class="rej-reason" [title]="c.rejectionReason">
                      {{ c.rejectionReason }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- REWARD CLAIM MODAL                                                        -->
      <!-- ========================================================================= -->
      <div class="modal-backdrop" *ngIf="isClaimModalOpen" (click)="closeClaimModal()">
        <div class="claim-modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header-bar">
            <div class="modal-title-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary, #d97706)" stroke-width="2.2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <h3>Claim Partner Cash Reward</h3>
            </div>
            <button type="button" class="btn-close-x" (click)="closeClaimModal()">✕</button>
          </div>

          <form (ngSubmit)="submitClaimForm()" novalidate>
            <div class="modal-body-scroll">
              
              <!-- STEP 1: SELECT REDEMPTION OPTION -->
              <div class="option-select-section">
                <label class="section-title-label">1. Select Points Redemption Option:</label>
                
                <div class="options-grid-2">
                  <!-- Option A: 500 Points -->
                  <div 
                    class="option-card" 
                    [class.selected]="selectedRedeemOption === '500'"
                    (click)="selectedRedeemOption = '500'"
                  >
                    <div class="opt-radio">
                      <input type="radio" name="redeemOpt" [checked]="selectedRedeemOption === '500'" />
                    </div>
                    <div class="opt-content">
                      <div class="opt-head">Redeem 500 Points</div>
                      <div class="opt-reward">₹{{ calculateReward(500) | number }} Cash</div>
                      <div class="opt-sub">
                        Remaining <strong>{{ Math.max(0, wallet().availablePoints - 500) }} pts</strong> will stay safely in your wallet.
                      </div>
                    </div>
                  </div>

                  <!-- Option B: All Available Points -->
                  <div 
                    class="option-card" 
                    [class.selected]="selectedRedeemOption === 'ALL'"
                    (click)="selectedRedeemOption = 'ALL'"
                  >
                    <div class="opt-radio">
                      <input type="radio" name="redeemOpt" [checked]="selectedRedeemOption === 'ALL'" />
                    </div>
                    <div class="opt-content">
                      <div class="opt-head">Redeem All Points</div>
                      <div class="opt-reward">₹{{ calculateReward(wallet().availablePoints) | number }} Cash</div>
                      <div class="opt-sub">
                        Redeems all <strong>{{ wallet().availablePoints }} available points</strong> (Balance → 0).
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payout Summary Callout -->
              <div class="payout-summary-box">
                <div class="summary-line">
                  <span>Available Points:</span>
                  <strong>{{ wallet().availablePoints }} Points</strong>
                </div>
                <div class="summary-line">
                  <span>Selected Redeem Points:</span>
                  <strong class="text-gold">{{ getSelectedPoints() }} Points</strong>
                </div>
                <div class="summary-line highlight-line">
                  <span>Calculated Reward Cash Amount:</span>
                  <strong class="text-emerald">₹{{ calculateReward(getSelectedPoints()) | number }}</strong>
                </div>
                <div class="summary-line">
                  <span>Wallet Balance After Claim:</span>
                  <strong>{{ Math.max(0, wallet().availablePoints - getSelectedPoints()) }} Points</strong>
                </div>
              </div>

              <!-- STEP 2: BANK DETAILS -->
              <div class="bank-details-section">
                <label class="section-title-label">2. Enter / Confirm Bank Details for Payout:</label>

                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Partner Name <span class="req">*</span></label>
                    <input type="text" [(ngModel)]="bankForm.partnerName" name="partnerName" class="form-control" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Mobile Number</label>
                    <input type="text" [(ngModel)]="bankForm.mobileNumber" name="mobileNumber" class="form-control" placeholder="10-digit mobile number" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Bank Account Holder Name <span class="req">*</span></label>
                    <input type="text" [(ngModel)]="bankForm.accountHolderName" name="accountHolderName" class="form-control" placeholder="Name as in bank records" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Bank Name <span class="req">*</span></label>
                    <input type="text" [(ngModel)]="bankForm.bankName" name="bankName" class="form-control" placeholder="e.g. State Bank of India, HDFC" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Account Number <span class="req">*</span></label>
                    <input type="password" [(ngModel)]="bankForm.accountNumber" name="accountNumber" class="form-control" placeholder="Enter bank account number" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Confirm Account Number <span class="req">*</span></label>
                    <input type="text" [(ngModel)]="bankForm.confirmAccountNumber" name="confirmAccountNumber" class="form-control" placeholder="Re-enter bank account number" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">IFSC Code <span class="req">*</span></label>
                    <input type="text" [(ngModel)]="bankForm.ifscCode" name="ifscCode" class="form-control" placeholder="e.g. SBIN0001234" style="text-transform: uppercase;" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">UPI ID (Optional)</label>
                    <input type="text" [(ngModel)]="bankForm.upiId" name="upiId" class="form-control" placeholder="e.g. yourname@okhdfcbank" />
                  </div>
                </div>
              </div>

              <!-- Error Alert -->
              <div *ngIf="claimErrorMessage" class="alert-error-box">
                {{ claimErrorMessage }}
              </div>

            </div>

            <!-- Modal Actions -->
            <div class="modal-footer-bar">
              <button type="button" class="btn-cancel" (click)="closeClaimModal()">Cancel</button>
              <button type="submit" class="btn-submit-claim" [disabled]="submittingClaim">
                <span *ngIf="!submittingClaim">Confirm & Submit Claim (₹{{ calculateReward(getSelectedPoints()) | number }})</span>
                <span *ngIf="submittingClaim">Reserving Points & Submitting...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 1.5rem 0;
      font-family: inherit;
    }

    .rewards-wallet-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .wallet-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .wallet-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fef3c7;
      color: #92400e;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 0.5rem;
      letter-spacing: 0.5px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #d97706;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.25);
    }

    .wallet-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem 0;
    }

    .wallet-sub {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
      max-width: 620px;
      line-height: 1.5;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .btn-claim-main {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #cbd5e1;
      color: #475569;
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      border: none;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: not-allowed;
      transition: all 0.2s ease;
    }

    .btn-claim-enabled {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
    }

    .btn-claim-enabled:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(217, 119, 6, 0.45);
    }

    .claim-req-text {
      font-size: 0.78rem;
      color: #d97706;
      font-weight: 600;
    }

    /* 4 Summary Cards */
    .wallet-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.15rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .gold-border { border-left: 4px solid #d97706; }
    .amber-border { border-left: 4px solid #f59e0b; }
    .emerald-border { border-left: 4px solid #10b981; }
    .purple-border { border-left: 4px solid #8b5cf6; }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-gold { background: #fef3c7; color: #d97706; }
    .icon-amber { background: #fef3c7; color: #b45309; }
    .icon-emerald { background: #dcfce7; color: #10b981; }
    .icon-purple { background: #ede9fe; color: #8b5cf6; }

    .stat-meta {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .stat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin: 2px 0;
    }

    .stat-val small {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .text-gold { color: #d97706; }
    .text-amber { color: #b45309; }
    .text-emerald { color: #059669; }
    .text-purple { color: #7c3aed; }

    .stat-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    /* Rate Banner */
    .rate-banner {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 8px;
    }

    .rate-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      color: #0f172a;
    }

    .rule-hint {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Tabs Card */
    .wallet-tabs-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .tab-nav {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      gap: 4px;
      padding: 6px 10px 0 10px;
    }

    .tab-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.65rem 1.15rem;
      border: 1px solid transparent;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      background: transparent;
      color: #64748b;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-link:hover {
      color: #0f172a;
    }

    .tab-link.active {
      background: #ffffff;
      color: #0f172a;
      border-color: #e2e8f0;
      border-bottom-color: #ffffff;
      margin-bottom: -1px;
    }

    .tab-body {
      padding: 1.25rem;
    }

    .empty-table-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #94a3b8;
    }

    .empty-table-state p {
      font-size: 0.88rem;
      margin: 0.5rem 0 0 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .wallet-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }

    .wallet-table th {
      text-align: left;
      padding: 0.65rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .wallet-table td {
      padding: 0.75rem 0.85rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .wallet-table tr:last-child td {
      border-bottom: none;
    }

    .tx-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      text-transform: uppercase;
    }

    .badge-approved { background: #dcfce7; color: #15803d; }
    .badge-reserved { background: #fef3c7; color: #b45309; }
    .badge-paid { background: #dbeafe; color: #1e40af; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }
    .badge-default { background: #f1f5f9; color: #475569; }

    .pts-change {
      font-weight: 800;
    }
    .pts-plus { color: #16a34a; }
    .pts-minus { color: #dc2626; }

    .balance-cell {
      font-size: 0.82rem;
      color: #64748b;
    }

    .claim-id-text {
      font-weight: 700;
      font-family: monospace;
      color: #d97706;
    }

    .pts-badge-pill {
      background: #fef3c7;
      color: #92400e;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 12px;
    }

    .amount-green {
      color: #059669;
      font-size: 0.95rem;
    }

    .bank-snippet {
      font-size: 0.8rem;
      line-height: 1.3;
    }

    .status-badge {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
      text-transform: uppercase;
    }

    .status-pending { background: #fef3c7; color: #b45309; }
    .status-processing { background: #fef3c7; color: #b45309; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-paid { background: #dbeafe; color: #1e40af; }
    .status-rejected { background: #fee2e2; color: #991b1b; }

    .pay-ref {
      font-size: 0.7rem;
      color: #059669;
      font-weight: 700;
      margin-top: 2px;
    }

    .rej-reason {
      font-size: 0.7rem;
      color: #dc2626;
      margin-top: 2px;
      max-width: 140px;
    }

    /* Claim Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      z-index: 1200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .claim-modal-content {
      background: #ffffff;
      width: 100%;
      max-width: 580px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .modal-header-bar {
      padding: 1.15rem 1.5rem;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-title-wrap h3 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
    }

    .btn-close-x {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
    }

    .btn-close-x:hover { color: #ffffff; }

    .modal-body-scroll {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .section-title-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 0.75rem;
    }

    .options-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .option-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      display: flex;
      gap: 10px;
      align-items: flex-start;
      transition: all 0.2s;
    }

    .option-card:hover {
      border-color: #cbd5e1;
    }

    .option-card.selected {
      border-color: #d97706;
      background: #fffbeb;
    }

    .opt-head {
      font-weight: 800;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .opt-reward {
      font-size: 1.15rem;
      font-weight: 800;
      color: #059669;
      margin: 2px 0;
    }

    .opt-sub {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.3;
    }

    .payout-summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.85rem 1.15rem;
      margin-bottom: 1.5rem;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #475569;
      margin-bottom: 4px;
    }

    .highlight-line {
      border-top: 1px dashed #cbd5e1;
      padding-top: 6px;
      margin-top: 6px;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
    }

    .req { color: #dc2626; }

    .form-control {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.88rem;
      outline: none;
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: #d97706;
    }

    .alert-error-box {
      background: #fee2e2;
      border: 1px solid #f87171;
      color: #991b1b;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-top: 1rem;
    }

    .modal-footer-bar {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-cancel {
      padding: 0.65rem 1.25rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-weight: 700;
      font-size: 0.88rem;
      border-radius: 8px;
      cursor: pointer;
    }

    .btn-submit-claim {
      padding: 0.65rem 1.35rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      font-weight: 800;
      font-size: 0.9rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-submit-claim:hover {
      background: #047857;
    }
  `]
})
export class PartnerRewardsWalletComponent implements OnInit, OnChanges {
  @Input() userEmail: string = '';
  @Input() userName: string = '';
  @Input() userPhone: string = '';
  @Input() userRole: string = 'PARTNER';

  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  Math = Math;

  wallet = signal<{
    availablePoints: number;
    reservedPoints: number;
    totalEarnedPoints: number;
    totalRedeemedPoints: number;
  }>({
    availablePoints: 0,
    reservedPoints: 0,
    totalEarnedPoints: 0,
    totalRedeemedPoints: 0
  });

  config = signal<{
    pointsPerReward: number;
    rewardAmountInInr: number;
    pointsPerProperty: number;
    ratePerPoint: number;
    conversionRateText: string;
  }>({
    pointsPerReward: 500,
    rewardAmountInInr: 500,
    pointsPerProperty: 20,
    ratePerPoint: 1,
    conversionRateText: '500 Points = ₹500'
  });

  history = signal<PointsLedgerItem[]>([]);
  claims = signal<RewardClaimItem[]>([]);

  activeTab: 'LEDGER' | 'CLAIMS' = 'LEDGER';
  isClaimModalOpen = false;
  selectedRedeemOption: '500' | 'ALL' = '500';

  bankForm = {
    partnerName: '',
    mobileNumber: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: ''
  };

  submittingClaim = false;
  claimErrorMessage = '';

  ngOnInit(): void {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userEmail'] && !changes['userEmail'].firstChange) {
      this.initData();
    }
  }

  initData() {
    const email = this.userEmail?.trim().toLowerCase();
    if (!email) return;

    this.bankForm.partnerName = this.userName || '';
    this.bankForm.mobileNumber = this.userPhone || '';
    this.bankForm.accountHolderName = this.userName || '';

    this.loadWalletData();
  }

  loadWalletData() {
    const email = this.userEmail?.trim().toLowerCase();
    if (!email) return;

    const role = this.userRole || 'PARTNER';
    this.http.get<any>(`${getApiBaseUrl()}/rewards/partner-wallet?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`)
      .subscribe({
        next: (res) => {
          if (res.wallet) {
            this.wallet.set({
              availablePoints: res.wallet.availablePoints || 0,
              reservedPoints: res.wallet.reservedPoints || 0,
              totalEarnedPoints: res.wallet.totalEarnedPoints || 0,
              totalRedeemedPoints: res.wallet.totalRedeemedPoints || 0
            });
          }
          if (res.config) {
            this.config.set({
              pointsPerReward: res.config.pointsPerReward || 500,
              rewardAmountInInr: res.config.rewardAmountInInr || 500,
              pointsPerProperty: res.config.pointsPerProperty || 20,
              ratePerPoint: res.config.ratePerPoint || 1,
              conversionRateText: res.config.conversionRateText || '500 Points = ₹500'
            });
          }
          if (res.history) {
            this.history.set(res.history);
          }
          if (res.claims) {
            this.claims.set(res.claims);
          }
          if (res.bankDetail) {
            this.bankForm.accountHolderName = res.bankDetail.accountHolderName || this.bankForm.accountHolderName;
            this.bankForm.bankName = res.bankDetail.bankName || '';
            this.bankForm.accountNumber = res.bankDetail.accountNumber || '';
            this.bankForm.confirmAccountNumber = res.bankDetail.accountNumber || '';
            this.bankForm.ifscCode = res.bankDetail.ifscCode || '';
            this.bankForm.upiId = res.bankDetail.upiId || '';
            this.bankForm.mobileNumber = res.bankDetail.mobileNumber || this.bankForm.mobileNumber;
          }
        },
        error: (err) => {
          console.error('Failed to load partner wallet', err);
        }
      });
  }

  openClaimModal() {
    if (this.wallet().availablePoints < 500) {
      this.notificationService.show('Points Threshold Not Reached', 'You need at least 500 points to claim a reward payout.', 'info');
      return;
    }
    this.claimErrorMessage = '';
    this.selectedRedeemOption = '500';
    this.isClaimModalOpen = true;
  }

  closeClaimModal() {
    this.isClaimModalOpen = false;
    this.claimErrorMessage = '';
  }

  getSelectedPoints(): number {
    if (this.selectedRedeemOption === 'ALL') {
      return this.wallet().availablePoints;
    }
    return 500;
  }

  calculateReward(points: number): number {
    const cfg = this.config();
    const rate = cfg.rewardAmountInInr / (cfg.pointsPerReward || 500);
    return Math.round(points * rate);
  }

  submitClaimForm() {
    this.claimErrorMessage = '';

    if (!this.bankForm.accountHolderName.trim() || !this.bankForm.bankName.trim() || !this.bankForm.accountNumber.trim() || !this.bankForm.ifscCode.trim()) {
      this.claimErrorMessage = 'Please complete all required bank details.';
      return;
    }

    if (this.bankForm.accountNumber.trim() !== this.bankForm.confirmAccountNumber.trim()) {
      this.claimErrorMessage = 'Account numbers do not match. Please verify.';
      return;
    }

    const pointsToRedeem = this.getSelectedPoints();
    if (pointsToRedeem < 500 || pointsToRedeem > this.wallet().availablePoints) {
      this.claimErrorMessage = `Selected points (${pointsToRedeem}) exceed your available balance (${this.wallet().availablePoints}).`;
      return;
    }

    this.submittingClaim = true;

    const payload = {
      email: this.userEmail,
      name: this.bankForm.partnerName || this.userName,
      phone: this.bankForm.mobileNumber || this.userPhone,
      role: this.userRole,
      redeemOption: this.selectedRedeemOption,
      bankDetails: {
        accountHolderName: this.bankForm.accountHolderName.trim(),
        bankName: this.bankForm.bankName.trim(),
        accountNumber: this.bankForm.accountNumber.trim(),
        ifscCode: this.bankForm.ifscCode.trim().toUpperCase(),
        upiId: this.bankForm.upiId ? this.bankForm.upiId.trim() : null,
        mobileNumber: this.bankForm.mobileNumber ? this.bankForm.mobileNumber.trim() : null
      }
    };

    this.http.post<any>(`${getApiBaseUrl()}/rewards/claim-reward`, payload).subscribe({
      next: (res) => {
        this.submittingClaim = false;
        this.closeClaimModal();
        this.notificationService.show('Reward Claim Submitted!', res.message || 'Points reserved and claim sent to Admin.', 'success');
        this.loadWalletData();
        this.activeTab = 'CLAIMS';
      },
      error: (err) => {
        this.submittingClaim = false;
        this.claimErrorMessage = err.error?.message || 'Failed to submit claim. Please try again.';
      }
    });
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'PROPERTY_APPROVED': return 'badge-approved';
      case 'REWARD_RESERVED': return 'badge-reserved';
      case 'REWARD_PAID': return 'badge-paid';
      case 'REWARD_CLAIM_REJECTED': return 'badge-rejected';
      case 'REWARD_POINTS_RELEASED': return 'badge-approved';
      default: return 'badge-default';
    }
  }

  formatTxType(type: string): string {
    if (!type) return 'Points Activity';
    return type.replace(/_/g, ' ');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'status-paid';
      case 'APPROVED': return 'status-approved';
      case 'PROCESSING': return 'status-processing';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }
}

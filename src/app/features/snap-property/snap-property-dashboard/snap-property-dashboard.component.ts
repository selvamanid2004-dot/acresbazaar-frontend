import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';
import { PartnerRewardsWalletComponent } from '../../../shared/components/partner-rewards-wallet/partner-rewards-wallet.component';

@Component({
  selector: 'app-snap-property-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PartnerRewardsWalletComponent],
  template: `
    <div class="dashboard-page-wrapper">
      
      <!-- Top Navigation -->
      <section class="top-nav-bar">
        <div class="container">
          <div class="nav-bar-inner">
            <a routerLink="/" class="btn-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Home</span>
            </a>

            <div class="header-right-actions">
              <a routerLink="/snap-property/upload" class="btn-snap-cta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>+ Snap New Board</span>
              </a>
              <button class="btn-logout" (click)="onLogout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="container py-4">
        
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="welcome-content">
            <div class="role-pill">
              <span class="pulse-dot"></span>
              COMMUNITY PARTNER · DASHBOARD
            </div>
            <h1>Welcome, <span class="highlight-name">{{ spotterUser?.name || 'Partner' }}</span></h1>
            <p class="subtitle">
              Upload TO-LET signboards and property boards across your locality. Receive <strong>+20 Points</strong> for every property approved by Admin and claim direct cash payouts to your bank account!
            </p>
          </div>
          <div class="banner-reward-preview">
            <a routerLink="/snap-property/upload" class="btn-primary-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>+ Snap New Property</span>
            </a>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="stats-grid">
          <!-- 1. Total Snaps -->
          <div class="stat-card">
            <div class="stat-icon icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <div class="stat-meta">
              <span class="stat-label">Total Snaps Uploaded</span>
              <span class="stat-val">{{ totalSnaps }}</span>
            </div>
          </div>

          <!-- 2. Pending Review -->
          <div class="stat-card">
            <div class="stat-icon icon-amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-meta">
              <span class="stat-label">Under Admin Review</span>
              <span class="stat-val">{{ pendingCount }}</span>
            </div>
          </div>

          <!-- 3. Approved Snaps -->
          <div class="stat-card">
            <div class="stat-icon icon-emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="stat-meta">
              <span class="stat-label">Approved & Published</span>
              <span class="stat-val" style="color: #059669;">{{ approvedCount }}</span>
            </div>
          </div>

          <!-- 4. Rejected Snaps -->
          <div class="stat-card">
            <div class="stat-icon icon-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div class="stat-meta">
              <span class="stat-label">Rejected Snaps</span>
              <span class="stat-val" style="color: #dc2626;">{{ rejectedCount }}</span>
            </div>
          </div>
        </div>

        <!-- PARTNER POINTS WALLET & REWARD CLAIM COMPONENT -->
        <app-partner-rewards-wallet 
          *ngIf="spotterUser?.email"
          [userEmail]="spotterUser?.email"
          [userName]="spotterUser?.name"
          [userPhone]="spotterUser?.mobile"
          [userRole]="'SPOTTER'"
        ></app-partner-rewards-wallet>

        <!-- MY SNAPS STATUS SECTION -->
        <div class="my-snaps-section">
          <div class="section-header">
            <div>
              <h2 class="section-heading">My Snapped Properties</h2>
              <p class="section-sub">Review status of your uploaded signboards and track approval progress</p>
            </div>

            <div class="tab-filters">
              <button class="tab-btn" [class.active]="selectedTab === 'ALL'" (click)="selectedTab = 'ALL'">
                All ({{ totalSnaps }})
              </button>
              <button class="tab-btn" [class.active]="selectedTab === 'PENDING'" (click)="selectedTab = 'PENDING'">
                Under Review ({{ pendingCount }})
              </button>
              <button class="tab-btn" [class.active]="selectedTab === 'APPROVED'" (click)="selectedTab = 'APPROVED'">
                Approved ({{ approvedCount }})
              </button>
              <button class="tab-btn" [class.active]="selectedTab === 'REJECTED'" (click)="selectedTab = 'REJECTED'">
                Rejected ({{ rejectedCount }})
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state-card" *ngIf="filteredSnaps.length === 0">
            <div class="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h3>No snap properties found</h3>
            <p>You haven't uploaded any signboards under this category yet.</p>
            <a routerLink="/snap-property/upload" class="btn-snap-empty">
              + Snap & Upload First Board
            </a>
          </div>

          <!-- Snaps Grid -->
          <div class="snaps-grid" *ngIf="filteredSnaps.length > 0">
            <div class="snap-item-card" *ngFor="let p of filteredSnaps">
              <div class="snap-thumb-box" (click)="previewImg = p.image_urls?.[0] || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600'">
                <img [src]="p.image_urls?.[0] || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600'" alt="Signboard" />
                <span class="pts-tag">+100 PTS</span>
              </div>

              <div class="snap-content-box">
                <div class="snap-top-row">
                  <span class="board-type-tag">{{ p.category_specs?.boardType || 'TO-LET' }}</span>
                  
                  <!-- Status Badge -->
                  <span class="badge" [ngClass]="{
                    'badge-pending': p.status === 'PENDING',
                    'badge-approved': p.status === 'APPROVED',
                    'badge-hold': p.status === 'HOLD',
                    'badge-rejected': p.status === 'REJECTED'
                  }">
                    <span *ngIf="p.status === 'PENDING'">🟡 UNDER REVIEW</span>
                    <span *ngIf="p.status === 'APPROVED'">🟢 APPROVED & LIVE</span>
                    <span *ngIf="p.status === 'HOLD'">🟣 ON HOLD</span>
                    <span *ngIf="p.status === 'REJECTED'">🔴 REJECTED</span>
                  </span>
                </div>

                <h3 class="snap-title-text">{{ p.title }}</h3>

                <div class="snap-info-rows">
                  <div class="info-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ p.location }}, {{ p.city }}</span>
                  </div>

                  <div class="info-row" *ngIf="p.category_specs?.boardContact">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #0284c7;">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span style="color: #0284c7; font-weight: 600;">Contact on Board: {{ p.category_specs.boardContact }}</span>
                  </div>

                  <div class="info-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Uploaded: {{ p.created_at | date:'mediumDate' }}</span>
                  </div>
                </div>

                <!-- Status Explanatory Note -->
                <div class="status-note-box" *ngIf="p.status === 'PENDING'">
                  ⏳ Admin verification in progress. Once verified, it will be published to the public marketplace.
                </div>
                <div class="status-note-box approved-note" *ngIf="p.status === 'APPROVED'">
                  ✓ Property approved by admin and published live on AcresBazaar!
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Image Zoom Modal -->
      <div class="modal-backdrop" *ngIf="previewImg" (click)="previewImg = null">
        <div class="modal-body-zoom" (click)="$event.stopPropagation()">
          <button class="btn-close-modal" (click)="previewImg = null">✕</button>
          <img [src]="previewImg" alt="Signboard Full Preview" />
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8fafc;
      font-family: inherit;
    }

    .dashboard-page-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-nav-bar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.85rem 0;
    }

    .container {
      width: 100%;
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 1.25rem;
    }

    .nav-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
    }

    .btn-back:hover {
      color: #0f172a;
    }

    .header-right-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-snap-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.15rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      transition: all 0.2s;
    }

    .btn-snap-cta:hover {
      transform: translateY(-1px);
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 0.9rem;
      background: #ffffff;
      color: #64748b;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-logout:hover {
      color: #ef4444;
      border-color: #fca5a5;
      background: #fef2f2;
    }

    .welcome-banner {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 6px 20px -3px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .role-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.3rem 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
    }

    .welcome-banner h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem;
    }

    .highlight-name {
      color: #059669;
    }

    .subtitle {
      font-size: 0.92rem;
      color: #64748b;
      margin: 0;
      max-width: 620px;
      line-height: 1.5;
    }

    .pts-badge-large {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      padding: 1.25rem 1.75rem;
      border-radius: 14px;
      text-align: center;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.2);
    }

    .pts-number {
      font-size: 2.25rem;
      font-weight: 900;
      color: #b45309;
      line-height: 1;
    }

    .pts-text {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #92400e;
      margin-top: 4px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 900px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 540px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-blue { background: #e0f2fe; color: #0284c7; }
    .icon-gold { background: #fef3c7; color: #d97706; }
    .icon-amber { background: #ffedd5; color: #ea580c; }
    .icon-emerald { background: #dcfce7; color: #059669; }

    .stat-meta {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }

    .stat-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    /* Reward Section */
    .reward-section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 6px 20px -3px rgba(0, 0, 0, 0.05);
    }

    .reward-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .reward-icon-badge {
      width: 46px;
      height: 46px;
      background: #fef3c7;
      color: #b45309;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .reward-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem;
    }

    .reward-desc {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    .milestone-progress-wrap {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #334155;
      margin-bottom: 0.5rem;
    }

    .progress-bar-bg {
      width: 100%;
      height: 12px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 0.65rem;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #f59e0b 0%, #10b981 100%);
      border-radius: 10px;
      transition: width 0.4s ease;
    }

    .progress-sub-info {
      font-size: 0.85rem;
      color: #64748b;
    }

    /* Active Claim Box */
    .active-claim-box {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1.25rem;
    }

    .claim-status-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #bbf7d0;
    }

    .claim-details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .claim-details-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .detail-label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }

    .detail-val {
      font-size: 0.95rem;
      color: #0f172a;
      font-weight: 600;
      margin-top: 2px;
    }

    .claim-footer-msg {
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      line-height: 1.4;
    }

    /* Bank Form */
    .bank-form-container {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .bank-form-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    @media (max-width: 600px) {
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #334155;
    }

    .required { color: #ef4444; }

    .form-control {
      height: 42px;
      padding: 0 0.85rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #0f172a;
      background: #ffffff;
    }

    .form-control:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .btn-submit-bank {
      width: 100%;
      height: 46px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }

    .btn-submit-bank:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    /* My Snaps Section */
    .my-snaps-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 6px 20px -3px rgba(0, 0, 0, 0.05);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-heading {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem;
    }

    .section-sub {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0;
    }

    .tab-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 0.45rem 0.9rem;
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    .snaps-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .snap-item-card {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .snap-item-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    @media (max-width: 600px) {
      .snap-item-card {
        flex-direction: column;
      }
    }

    .snap-thumb-box {
      width: 140px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      cursor: pointer;
      background: #0f172a;
    }

    .snap-thumb-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .pts-tag {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(245, 158, 11, 0.95);
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .snap-content-box {
      flex: 1;
      min-width: 0;
    }

    .snap-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .board-type-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #d97706;
      background: #fef3c7;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .snap-title-text {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .snap-info-rows {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.82rem;
      color: #64748b;
      flex-wrap: wrap;
      margin-bottom: 0.65rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .status-note-box {
      font-size: 0.8rem;
      color: #92400e;
      background: #fef3c7;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      display: inline-block;
    }

    .approved-note {
      color: #166534;
      background: #dcfce7;
    }

    /* Badges */
    .badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .badge-pending { background: #fef3c7; color: #b45309; }
    .badge-approved { background: #dcfce7; color: #15803d; }
    .badge-paid { background: #dbeafe; color: #1d4ed8; }
    .badge-hold { background: #f3e8ff; color: #7e22ce; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }

    .empty-state-card {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .empty-icon {
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    .btn-snap-empty {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.65rem 1.25rem;
      background: #0f172a;
      color: #ffffff;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 700;
    }

    /* Modal Zoom */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 1200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-body-zoom {
      position: relative;
      max-width: 90vw;
      max-height: 85vh;
    }

    .modal-body-zoom img {
      max-width: 100%;
      max-height: 85vh;
      border-radius: 8px;
      object-fit: contain;
    }

    .btn-close-modal {
      position: absolute;
      top: -36px;
      right: 0;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 1.5rem;
      cursor: pointer;
    }
  `]
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
    // If active user is a Seller or Dealer, block access to Partner Dashboard immediately
    if (this.authService.isSellerAuthenticated()) {
      this.notificationService.show('Access Denied', 'Sellers are not authorized to access the Partner Dashboard.', 'info');
      this.router.navigate(['/seller/categories']);
      return;
    }

    if (this.authService.isDealerAuthenticated()) {
      this.notificationService.show('Access Denied', 'Dealers are not authorized to access the Partner Dashboard.', 'info');
      this.router.navigate(['/dealer/dashboard']);
      return;
    }

    // Retrieve verified Partner session
    this.spotterUser = this.authService.getSpotterUser();

    if (!this.spotterUser) {
      this.router.navigate(['/snap-property/login']);
      return;
    }

    this.bankData.holderName = this.spotterUser.name || '';
    this.loadMySnaps();
    this.loadMyClaim();
  }

  loadMySnaps() {
    const email = this.spotterUser?.email?.trim().toLowerCase() || '';
    const sellerId = this.spotterUser?.id || '';

    if (!email && !sellerId) {
      this.snaps = [];
      return;
    }

    this.http.get<any>(`${getApiBaseUrl()}/properties/seller/listings?email=${encodeURIComponent(email)}&sellerId=${encodeURIComponent(sellerId)}&role=COMMON_PEOPLE`)
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
    const email = this.spotterUser?.email?.trim().toLowerCase();
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

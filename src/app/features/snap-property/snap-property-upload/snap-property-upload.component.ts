import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

@Component({
  selector: 'app-snap-property-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="snap-page-wrapper">
      
      <!-- Top Bar -->
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

            <div class="header-user-actions" *ngIf="spotterUser">
              <a routerLink="/snap-property/dashboard" class="btn-dashboard-nav">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>My Snaps & Rewards</span>
              </a>
              <div class="spotter-badge">
                <span class="spotter-dot"></span>
                <span>{{ spotterUser.name }}</span>
                <button class="btn-text-logout" (click)="onLogout()">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Container -->
      <div class="container py-4">
        <div class="snap-card">
          
          <!-- Header Banner -->
          <div class="snap-header">
            <div class="header-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <div>
              <div class="role-pill">COMMON PEOPLE · SNAP MODULE</div>
              <h1 class="snap-title">Snap & Upload TO-LET Board</h1>
              <p class="snap-subtitle">
                Spot a TO-LET or Sale board in any random place? Capture its photo, detect your location, and upload it to AcresBazaar.
              </p>
            </div>
          </div>

          <!-- Success State -->
          <div class="success-screen" *ngIf="submittedSuccessfully">
            <div class="success-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>TO-LET Board Uploaded Successfully!</h2>
            <div style="display: inline-block; background: #fef3c7; border: 1.5px solid #f59e0b; color: #b45309; padding: 6px 14px; border-radius: 20px; font-weight: 800; margin-bottom: 1rem; font-size: 0.95rem;">
              +100 REWARD POINTS EARNED 🏆
            </div>
            <p>
              Your snap has been transmitted to the <strong>Admin Panel Common People Module</strong>. 
              Our verification team will review the signboard details and publish it.
            </p>
            <div class="success-actions">
              <a routerLink="/snap-property/dashboard" class="btn-primary" style="background: #0f172a;">
                <span>View My Snaps & Points →</span>
              </a>
              <button class="btn-primary" (click)="resetForm()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>Snap Another Property</span>
              </button>
            </div>
          </div>

          <!-- Upload Form -->
          <form (ngSubmit)="onSubmit()" *ngIf="!submittedSuccessfully" class="snap-form" novalidate>
            
            <!-- STEP 1: CAMERA & PHOTO CAPTURE -->
            <div class="form-section">
              <div class="section-title">
                <span class="step-num">1</span>
                <span>Camera Option: Capture TO-LET Board Photo</span>
                <span class="required">*</span>
              </div>

              <!-- Hidden inputs for camera capture & file picker -->
              <input 
                #cameraInput 
                type="file" 
                accept="image/*" 
                capture="environment" 
                (change)="onFileSelected($event)" 
                style="display: none" />
              
              <input 
                #galleryInput 
                type="file" 
                accept="image/*" 
                (change)="onFileSelected($event)" 
                style="display: none" />

              <!-- Photo Preview or Trigger Box -->
              <div class="camera-box" *ngIf="!photoPreview">
                <div class="camera-box-inner">
                  <div class="camera-icon-circle">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <h3>Take a Photo of the TO-LET / Signboard</h3>
                  <p>Point your camera at the board and make sure the phone number is clear</p>
                  
                  <div class="camera-btn-group">
                    <button type="button" class="btn-camera" (click)="cameraInput.click()">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span>Open Camera (Snap Now)</span>
                    </button>
                    
                    <button type="button" class="btn-gallery" (click)="galleryInput.click()">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>Upload from Gallery</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Snapped Photo Preview -->
              <div class="photo-preview-wrap" *ngIf="photoPreview">
                <div class="preview-img-box">
                  <img [src]="photoPreview" alt="Snapped TO-LET Board" />
                  <div class="preview-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Board Photo Captured</span>
                  </div>
                </div>
                <div class="preview-actions">
                  <button type="button" class="btn-retake" (click)="cameraInput.click()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span>Retake Photo</span>
                  </button>
                  <button type="button" class="btn-remove" (click)="photoPreview = null">Remove</button>
                </div>
              </div>
            </div>

            <!-- STEP 2: LOCATION INFORMATION -->
            <div class="form-section">
              <div class="section-title">
                <span class="step-num">2</span>
                <span>Location Information</span>
                <span class="required">*</span>
              </div>

              <!-- Auto GPS Detect Button -->
              <div class="location-detect-bar">
                <button type="button" class="btn-detect-gps" (click)="detectGPS()" [disabled]="detectingLocation">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" [class.spinning]="detectingLocation">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                  </svg>
                  <span>{{ detectingLocation ? 'Detecting Current GPS...' : '📍 Auto-Detect My Current GPS Location' }}</span>
                </button>
                <span class="gps-coords-badge" *ngIf="gpsStatus">
                  {{ gpsStatus }}
                </span>
              </div>

              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label">City <span class="required">*</span></label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.city" 
                    name="city" 
                    placeholder="e.g. Chennai, Bangalore" 
                    required 
                    class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label">Area / Locality <span class="required">*</span></label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.locality" 
                    name="locality" 
                    placeholder="e.g. Anna Nagar, Indiranagar" 
                    required 
                    class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label">Street / Landmark <span class="required">*</span></label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.landmark" 
                    name="landmark" 
                    placeholder="e.g. Opp Nilgiris, 2nd Main Road" 
                    required 
                    class="form-control" />
                </div>
              </div>
            </div>

            <!-- STEP 3: DETAILS FROM THE BOARD -->
            <div class="form-section">
              <div class="section-title">
                <span class="step-num">3</span>
                <span>Signboard Details</span>
              </div>

              <div class="form-grid-2">
                <!-- Board Type -->
                <div class="form-group">
                  <label class="form-label">Signboard Type <span class="required">*</span></label>
                  <select [(ngModel)]="formData.boardType" name="boardType" class="form-control select-control" required>
                    <option value="TO-LET / RENT">TO-LET / For Rent</option>
                    <option value="FOR SALE">Property For Sale</option>
                    <option value="PLOT / LAND FOR SALE">Plot / Land Available</option>
                    <option value="COMMERCIAL LEASE">Commercial / Office Space</option>
                  </select>
                </div>

                <!-- Contact on Board -->
                <div class="form-group">
                  <label class="form-label">Contact Phone Number on Board <span class="required">*</span></label>
                  <div class="input-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="field-icon">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <input 
                      type="tel" 
                      [(ngModel)]="formData.boardContact" 
                      name="boardContact" 
                      placeholder="e.g. 98401 23456 (as written on board)" 
                      required 
                      class="form-control with-icon" />
                  </div>
                </div>

                <!-- Property Title / Summary -->
                <div class="form-group">
                  <label class="form-label">Property Title / Type <span class="required">*</span></label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.title" 
                    name="title" 
                    placeholder="e.g. 2 BHK House, Commercial Shop, Corner Plot" 
                    required 
                    class="form-control" />
                </div>

                <!-- Expected Price or Rent -->
                <div class="form-group">
                  <label class="form-label">Price / Rent (If written on board)</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.priceDisplay" 
                    name="priceDisplay" 
                    placeholder="e.g. ₹25,000/month or ₹75 Lakhs (optional)" 
                    class="form-control" />
                </div>
              </div>

              <!-- Notes / Description -->
              <div class="form-group mt-3">
                <label class="form-label">Additional Observations / Text on Board</label>
                <textarea 
                  [(ngModel)]="formData.notes" 
                  name="notes" 
                  rows="3" 
                  placeholder="e.g. Ground floor available, families preferred, contact owner between 9 AM - 6 PM"
                  class="form-control textarea-control"></textarea>
              </div>
            </div>

            <!-- Error Banner -->
            <div class="alert-banner error-banner" *ngIf="errorMessage">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Submit Button -->
            <div class="submit-bar">
              <button type="submit" class="btn-submit" [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span>Upload Snap Property to Admin Panel</span>
                </span>
                <span *ngIf="isSubmitting" class="loading-state">
                  <span class="spinner"></span>
                  <span>Uploading Snap & Syncing to Admin...</span>
                </span>
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
      min-height: 100vh;
      background: #f1f5f9;
      font-family: inherit;
    }

    .snap-page-wrapper {
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
      max-width: 960px;
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
      transition: color 0.2s;
    }

    .btn-back:hover {
      color: #0f172a;
    }

    .header-user-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .btn-dashboard-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #0f172a;
      color: #f8fafc;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.4rem 0.85rem;
      border-radius: 20px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-dashboard-nav:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }

    .spotter-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #065f46;
      padding: 0.35rem 0.85rem;
      border-radius: 20px;
      font-size: 0.82rem;
    }

    .spotter-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
    }

    .btn-text-logout {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      margin-left: 6px;
      text-decoration: underline;
    }

    .snap-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.06);
      padding: 2.25rem;
      margin-bottom: 3rem;
    }

    .snap-header {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 2rem;
    }

    .header-icon-wrap {
      width: 54px;
      height: 54px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 14px rgba(16, 185, 129, 0.3);
    }

    .role-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #059669;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      margin-bottom: 0.35rem;
    }

    .snap-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem;
      letter-spacing: -0.02em;
    }

    .snap-subtitle {
      font-size: 0.92rem;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    .form-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.25rem;
    }

    .step-num {
      width: 24px;
      height: 24px;
      background: #0f172a;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .camera-box {
      border: 2px dashed #cbd5e1;
      border-radius: 14px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: #ffffff;
      transition: all 0.2s;
    }

    .camera-icon-circle {
      width: 68px;
      height: 68px;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .camera-box h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.35rem;
    }

    .camera-box p {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0 0 1.5rem;
    }

    .camera-btn-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-camera {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      transition: all 0.2s;
    }

    .btn-camera:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }

    .btn-gallery {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      background: #ffffff;
      color: #334155;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-gallery:hover {
      border-color: #94a3b8;
      background: #f8fafc;
    }

    .photo-preview-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .preview-img-box {
      width: 100%;
      max-width: 480px;
      height: 280px;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      background: #0f172a;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    .preview-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(16, 185, 129, 0.9);
      color: #ffffff;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    .preview-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-retake {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-remove {
      padding: 0.5rem 1rem;
      background: #fee2e2;
      color: #b91c1c;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    .location-detect-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .btn-detect-gps {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      background: rgba(14, 165, 233, 0.1);
      color: #0284c7;
      border: 1.5px solid rgba(14, 165, 233, 0.3);
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-detect-gps:hover:not(:disabled) {
      background: rgba(14, 165, 233, 0.18);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    .gps-coords-badge {
      font-size: 0.82rem;
      color: #0284c7;
      background: #e0f2fe;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-weight: 600;
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .form-grid-3, .form-grid-2 {
        grid-template-columns: 1fr;
      }
      .snap-card {
        padding: 1.5rem;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .form-control {
      width: 100%;
      height: 44px;
      padding: 0 1rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #0f172a;
      background: #ffffff;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    .select-control {
      cursor: pointer;
    }

    .textarea-control {
      height: auto;
      padding: 0.75rem 1rem;
      resize: vertical;
    }

    .input-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 1rem;
      color: #64748b;
      pointer-events: none;
    }

    .with-icon {
      padding-left: 2.75rem;
    }

    .submit-bar {
      margin-top: 1.5rem;
    }

    .btn-submit {
      width: 100%;
      height: 52px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
      transition: all 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      margin-top: 1rem;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }

    .success-screen {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .success-icon-wrap {
      width: 80px;
      height: 80px;
      background: #dcfce7;
      color: #15803d;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .success-screen h2 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.75rem;
    }

    .success-screen p {
      font-size: 1rem;
      color: #64748b;
      max-width: 520px;
      margin: 0 auto 2rem;
      line-height: 1.6;
    }

    .success-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 1.75rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      padding: 0.85rem 1.5rem;
      background: #ffffff;
      color: #334155;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SnapPropertyUploadComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  spotterUser: any = null;
  photoPreview: string | null = null;
  detectingLocation = false;
  gpsStatus: string | null = null;
  gpsCoords: { lat: number; lng: number } | null = null;

  formData = {
    city: '',
    locality: '',
    landmark: '',
    boardType: 'TO-LET / RENT',
    boardContact: '',
    title: '',
    priceDisplay: '',
    notes: ''
  };

  isSubmitting = false;
  submittedSuccessfully = false;
  errorMessage = '';

  ngOnInit(): void {
    // Check spotter session
    const commonSessionStr = localStorage.getItem('aura_common_session');
    const authSessionStr = localStorage.getItem('aura_auth_session');
    const sellerSessionStr = localStorage.getItem('aura_seller_session');

    if (commonSessionStr) {
      try {
        const session = JSON.parse(commonSessionStr);
        this.spotterUser = session.user;
        if (session.user?.city) this.formData.city = session.user.city;
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
      this.router.navigate(['/snap-property/register']);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  detectGPS() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.detectingLocation = true;
    this.gpsStatus = 'Requesting GPS coordinates...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.detectingLocation = false;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.gpsCoords = { lat, lng };
        this.gpsStatus = `✓ GPS Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        this.notificationService.show('Location Detected', `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
      },
      (error) => {
        this.detectingLocation = false;
        this.gpsStatus = null;
        alert('Could not detect GPS location. Please type the location manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.photoPreview) {
      this.errorMessage = 'Please snap or upload a photo of the TO-LET board.';
      return;
    }

    if (!this.formData.city.trim() || !this.formData.locality.trim() || !this.formData.landmark.trim()) {
      this.errorMessage = 'Please specify City, Area, and Landmark / Street location.';
      return;
    }

    if (!this.formData.boardContact.trim()) {
      this.errorMessage = 'Please provide the contact phone number written on the signboard.';
      return;
    }

    if (!this.formData.title.trim()) {
      this.errorMessage = 'Please enter a property title or type (e.g. 2 BHK House, Commercial Shop).';
      return;
    }

    this.isSubmitting = true;

    // Build specs payload
    const categorySpecs = {
      isSnapProperty: true,
      boardType: this.formData.boardType,
      boardContact: this.formData.boardContact.trim(),
      landmark: this.formData.landmark.trim(),
      gpsLat: this.gpsCoords?.lat || null,
      gpsLng: this.gpsCoords?.lng || null,
      spotterName: this.spotterUser?.name || 'Public Spotter',
      spotterMobile: this.spotterUser?.mobile || '',
      spotterEmail: this.spotterUser?.email || '',
      notes: this.formData.notes.trim()
    };

    // Category mapping
    let category = 'Residential';
    if (this.formData.boardType.includes('PLOT') || this.formData.boardType.includes('LAND')) {
      category = 'Plots';
    } else if (this.formData.boardType.includes('COMMERCIAL')) {
      category = 'Commercial';
    }

    const payload = {
      title: `[${this.formData.boardType}] ${this.formData.title.trim()}`,
      category,
      location: `${this.formData.locality.trim()}, ${this.formData.landmark.trim()}`,
      city: this.formData.city.trim(),
      price: 0,
      priceDisplay: this.formData.priceDisplay.trim() || this.formData.boardType,
      description: `TO-LET board spotted at ${this.formData.locality}, ${this.formData.city}. Contact on board: ${this.formData.boardContact}. Notes: ${this.formData.notes}`,
      sellerId: this.spotterUser?.id || null,
      sellerName: this.spotterUser?.name || 'Public Spotter',
      sellerPhone: this.spotterUser?.mobile || '',
      sellerEmail: this.spotterUser?.email || '',
      categorySpecs,
      images: [this.photoPreview],
      status: 'PENDING'
    };

    this.http.post<any>(`${getApiBaseUrl()}/properties`, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.submittedSuccessfully = true;
        this.notificationService.show('Snap Uploaded!', 'Property submitted to Admin Panel Common People module.', 'success');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to submit snap property. Please try again.';
      }
    });
  }

  resetForm() {
    this.submittedSuccessfully = false;
    this.photoPreview = null;
    this.gpsCoords = null;
    this.gpsStatus = null;
    this.formData.title = '';
    this.formData.boardContact = '';
    this.formData.priceDisplay = '';
    this.formData.notes = '';
  }

  onLogout() {
    localStorage.removeItem('aura_common_session');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

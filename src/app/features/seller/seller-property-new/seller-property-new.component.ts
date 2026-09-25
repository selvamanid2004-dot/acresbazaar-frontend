import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface ImageUploadItem {
  id: string;
  dataUrl: string;
  name: string;
  size: number;
}

@Component({
  selector: 'app-seller-property-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="seller-post-page">
      <!-- Top Seller Header -->
      <div class="seller-top-bar">
        <div class="container top-bar-inner">
          <a routerLink="/seller/categories" class="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Change Category</span>
          </a>

          <div class="top-meta">
            <span class="platinum-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              AUTO-ASSIGNED TO PLATINUM PLAN
            </span>
            <a routerLink="/seller/properties" class="my-props-link">My Submitted Properties</a>
          </div>
        </div>
      </div>

      <!-- =============================================================
           CONFIRMATION SCREEN (AFTER SUCCESSFUL SUBMISSION)
      ============================================================== -->
      <div *ngIf="isSubmitted()" class="container confirmation-container">
        <div class="confirmation-card">
          <div class="success-icon-wrap">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <span class="pending-pill-large">
            <span class="pulse-amber"></span>
            Status: PENDING ADMIN APPROVAL
          </span>

          <h1>Property Submitted Successfully!</h1>
          <p class="confirmation-desc">
            Your property listing has been recorded and is currently waiting for Executive Admin verification. Once approved, it will be published live under the Platinum Plan directory.
          </p>

          <!-- Property Summary Box -->
          <div class="submitted-summary-box">
            <div class="summary-header">
              <span class="summary-title">{{ submittedData?.title }}</span>
              <span class="summary-price">{{ submittedData?.price }}</span>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="item-label">Category</span>
                <span class="item-value">{{ submittedData?.categoryName }}</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Plan Tier</span>
                <span class="item-value platinum-val">PLATINUM</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Location</span>
                <span class="item-value">{{ submittedData?.location }}</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Submission Date</span>
                <span class="item-value">{{ submittedData?.submissionDate }}</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Review Status</span>
                <span class="item-value pending-val">PENDING</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Photos Uploaded</span>
                <span class="item-value">{{ uploadedImages().length }} Photos</span>
              </div>
            </div>
          </div>

          <div class="confirmation-actions">
            <a routerLink="/seller/properties" class="btn-primary-action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              View My Submitted Properties
            </a>
            <button type="button" (click)="resetAndSubmitAnother()" class="btn-secondary-action">
              + Post Another Property
            </button>
          </div>
        </div>
      </div>

      <!-- =============================================================
           MAIN SUBMISSION FORM
      ============================================================== -->
      <div *ngIf="!isSubmitted()" class="container form-main-container">
        <div class="form-header-box">
          <div class="selected-cat-badge">
            <span class="cat-pill">Selected Category: <strong>{{ categoryName() }}</strong></span>
            <a routerLink="/seller/categories" class="btn-change">Change Category</a>
          </div>
          <h1>{{ categoryName() }} Property Form</h1>
          <p class="form-intro">
            Complete the property specifications, upload 4 to 5 photos, and submit for Platinum Admin review.
          </p>
        </div>

        <!-- Global Error Banner -->
        <div *ngIf="errorMessage()" class="alert-banner error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <form (ngSubmit)="handleSubmit()" class="submission-form" novalidate>
          <!-- -----------------------------------------------------------
               SECTION 1: PHOTO UPLOAD (4 to 5 IMAGES REQUIRED)
          ------------------------------------------------------------ -->
          <div class="form-section">
            <div class="section-title-row">
              <div class="section-badge">1</div>
              <div>
                <h2>Upload Property Photos <span class="req">*</span></h2>
                <p class="section-hint">Upload <strong>1 to 5 photos</strong>. First photo will be used as the primary cover.</p>
              </div>
              <div class="photo-counter" [class.valid]="uploadedImages().length >= 1">
                {{ uploadedImages().length }} / 5 Photos
                <span class="counter-status" *ngIf="uploadedImages().length < 1">(Min 1 required)</span>
                <span class="counter-status ready" *ngIf="uploadedImages().length >= 1">✓ Ready</span>
              </div>
            </div>

            <!-- Upload Dropzone (if < 5 photos) -->
            <div *ngIf="uploadedImages().length < 5" class="dropzone" (click)="fileInput.click()">
              <input
                #fileInput
                type="file"
                multiple
                accept="image/*"
                (change)="onFilesSelected($event)"
                style="display: none;"
              />
              <div class="dropzone-icon">📷</div>
              <h3>Click or drag to upload property photos</h3>
              <p>Supports JPG, PNG, WEBP. Minimum 1 photo required (up to 5 photos).</p>
              <button type="button" class="btn-browse">Select Photos from Device</button>
            </div>

            <!-- Preset / Sample Images Helper for Convenience -->
            <div class="sample-btn-wrap" style="margin: 12px 0;">
              <button type="button" (click)="addSamplePhotos()" class="sample-btn" [disabled]="uploadedImages().length >= 5" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; background: rgba(212,175,55,0.15); border: 1px solid #D4AF37; color: #D4AF37; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                + Load Curated Luxury Photos
              </button>
            </div>

            <!-- Image Previews Grid -->
            <div *ngIf="uploadedImages().length > 0" class="previews-grid">
              <div
                *ngFor="let img of uploadedImages(); let i = index"
                class="preview-card"
              >
                <div class="preview-img-wrap">
                  <img [src]="img.dataUrl" [alt]="img.name" class="preview-img" />
                  <span class="index-pill" [class.cover]="i === 0">
                    {{ i === 0 ? 'Cover Photo' : 'Photo ' + (i + 1) }}
                  </span>
                  <button
                    type="button"
                    (click)="removeImage(i)"
                    class="btn-remove-img"
                    title="Remove Photo"
                  >
                    ✕
                  </button>
                </div>
                <div class="img-meta">
                  <span class="img-name">{{ img.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- -----------------------------------------------------------
               SECTION 2: BASIC / COMMON PROPERTY INFORMATION
          ------------------------------------------------------------ -->
          <div class="form-section">
            <div class="section-title-row">
              <div class="section-badge">2</div>
              <div>
                <h2>Common Property Information <span class="req">*</span></h2>
                <p class="section-hint">General property identification, price, and overall sizing.</p>
              </div>
            </div>

            <div class="fields-grid">
              <!-- Title -->
              <div class="form-group span-2">
                <label for="propTitle">Property Title <span class="req">*</span></label>
                <input
                  id="propTitle"
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  placeholder="e.g. Luxury Corner Plot in Gated Community / 4 BHK Modern Villa"
                  class="form-control"
                />
              </div>

              <!-- Price -->
              <div class="form-group">
                <label for="propPrice">Total Price (with units) <span class="req">*</span></label>
                <input
                  id="propPrice"
                  type="text"
                  [(ngModel)]="formData.price"
                  name="price"
                  required
                  placeholder="e.g. ₹ 85 Lakhs / ₹ 2.4 Crores"
                  class="form-control"
                />
              </div>

              <!-- Property Size -->
              <div class="form-group">
                <label for="propSize">Property Size / Area <span class="req">*</span></label>
                <input
                  id="propSize"
                  type="text"
                  [(ngModel)]="formData.propertySize"
                  name="propertySize"
                  required
                  placeholder="e.g. 2400 sq ft / 30x40 / 3 Acres"
                  class="form-control"
                />
              </div>

              <!-- Property Type -->
              <div class="form-group">
                <label for="propType">Property Type</label>
                <select id="propType" [(ngModel)]="formData.propertyType" name="propertyType" class="form-control">
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Mixed Use">Mixed Use</option>
                </select>
              </div>

              <!-- Availability -->
              <div class="form-group">
                <label for="propAvail">Availability Status</label>
                <select id="propAvail" [(ngModel)]="formData.availability" name="availability" class="form-control">
                  <option value="Ready to Move / Register">Ready to Move / Register</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Immediate Possession">Immediate Possession</option>
                  <option value="Resale Property">Resale Property</option>
                </select>
              </div>

              <!-- Description -->
              <div class="form-group span-2">
                <label for="propDesc">Detailed Description <span class="req">*</span></label>
                <textarea
                  id="propDesc"
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="4"
                  required
                  placeholder="Highlight key advantages, documentation approvals, nearby landmarks, road accessibility, and community amenities..."
                  class="form-control"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- -----------------------------------------------------------
               SECTION 3: LOCATION & ADDRESS DETAILS
          ------------------------------------------------------------ -->
          <div class="form-section">
            <div class="section-title-row">
              <div class="section-badge">3</div>
              <div>
                <h2>Location & Address</h2>
                <p class="section-hint">Precise geographical details for certified buyer verification.</p>
              </div>
            </div>

            <div class="fields-grid">
              <!-- Locality / Area -->
              <div class="form-group">
                <label for="propLocation">Area / Locality <span class="req">*</span></label>
                <input
                  id="propLocation"
                  type="text"
                  [(ngModel)]="formData.location"
                  name="location"
                  required
                  placeholder="e.g. Whitefield / Sarjapur Road / Devanahalli"
                  class="form-control"
                />
              </div>

              <!-- City -->
              <div class="form-group">
                <label for="propCity">City</label>
                <input
                  id="propCity"
                  type="text"
                  [(ngModel)]="formData.city"
                  name="city"
                  placeholder="e.g. Bangalore"
                  class="form-control"
                />
              </div>

              <!-- Full Address -->
              <div class="form-group span-2">
                <label for="propAddress">Full Address / Survey Number</label>
                <input
                  id="propAddress"
                  type="text"
                  [(ngModel)]="formData.fullAddress"
                  name="fullAddress"
                  placeholder="e.g. Sy No. 42/2, Chikka Tirupathi Main Road"
                  class="form-control"
                />
              </div>

              <!-- Road Access -->
              <div class="form-group">
                <label for="propRoad">Road Access Width</label>
                <input
                  id="propRoad"
                  type="text"
                  [(ngModel)]="formData.roadAccess"
                  name="roadAccess"
                  placeholder="e.g. 40 Feet Tar Road / 60 Feet Main Road"
                  class="form-control"
                />
              </div>

              <!-- Facing -->
              <div class="form-group">
                <label for="propFacing">Property Facing</label>
                <select id="propFacing" [(ngModel)]="formData.facing" name="facing" class="form-control">
                  <option value="East">East</option>
                  <option value="North">North</option>
                  <option value="North-East">North-East (Ishan)</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="South-East">South-East</option>
                </select>
              </div>

              <!-- Landmark -->
              <div class="form-group span-2">
                <label for="propLandmark">Prominent Landmark</label>
                <input
                  id="propLandmark"
                  type="text"
                  [(ngModel)]="formData.landmark"
                  name="landmark"
                  placeholder="e.g. Behind Prestige Tech Cloud / 500m from Metro Station"
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <!-- -----------------------------------------------------------
               SECTION 4: CATEGORY-SPECIFIC SPECIFICATIONS (DYNAMIC)
          ------------------------------------------------------------ -->
          <div class="form-section">
            <div class="section-title-row">
              <div class="section-badge">4</div>
              <div>
                <h2>{{ categoryName() }} Specifications</h2>
                <p class="section-hint">Technical details tailored specifically for {{ categoryName() }}.</p>
              </div>
            </div>

            <!-- PLOTS & LAND SPECIFIC FIELDS -->
            <div *ngIf="isPlotCategory()" class="fields-grid">
              <div class="form-group">
                <label>Plot Dimensions</label>
                <input type="text" [(ngModel)]="plotSpecs.dimensions" name="dimensions" placeholder="e.g. 30x40, 30x50, 40x60" class="form-control" />
              </div>
              <div class="form-group">
                <label>Approval Authority</label>
                <select [(ngModel)]="plotSpecs.approvalAuthority" name="approvalAuthority" class="form-control">
                  <option value="BMRDA Approved">BMRDA Approved</option>
                  <option value="BDA Approved">BDA Approved</option>
                  <option value="DTCP Approved">DTCP Approved</option>
                  <option value="RERA Registered">RERA Registered</option>
                  <option value="Gram Panchayat DC Converted">Gram Panchayat DC Converted</option>
                  <option value="A-Katha">A-Katha</option>
                  <option value="B-Katha">B-Katha</option>
                </select>
              </div>
              <div class="form-group">
                <label>Corner Plot?</label>
                <select [(ngModel)]="plotSpecs.isCornerPlot" name="isCornerPlot" class="form-control">
                  <option value="Yes">Yes (Corner Site)</option>
                  <option value="No">No (Standard Plot)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Gated Layout / Community?</label>
                <select [(ngModel)]="plotSpecs.isGatedCommunity" name="isGatedCommunity" class="form-control">
                  <option value="Yes">Yes (Gated Layout)</option>
                  <option value="No">No (Standalone Site)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Boundary Wall Constructed?</label>
                <select [(ngModel)]="plotSpecs.boundaryWall" name="boundaryWall" class="form-control">
                  <option value="Constructed">Constructed</option>
                  <option value="Open">Open Boundary</option>
                  <option value="Fenced">Fenced</option>
                </select>
              </div>
              <div class="form-group">
                <label>Water & Underground Drainage?</label>
                <select [(ngModel)]="plotSpecs.utilities" name="utilities" class="form-control">
                  <option value="Fully Available (Cauvery + Borewell)">Fully Available (Cauvery + Borewell)</option>
                  <option value="Borewell + UGD Available">Borewell + UGD Available</option>
                  <option value="Borewell Only">Borewell Only</option>
                </select>
              </div>
            </div>

            <!-- VILLAS & ESTATES SPECIFIC FIELDS -->
            <div *ngIf="isVillaCategory()" class="fields-grid">
              <div class="form-group">
                <label>Bedrooms (BHK)</label>
                <select [(ngModel)]="villaSpecs.bedrooms" name="v_bhk" class="form-control">
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5 BHK">5 BHK</option>
                  <option value="6+ BHK">6+ BHK Luxury Mansion</option>
                </select>
              </div>
              <div class="form-group">
                <label>Bathrooms</label>
                <input type="text" [(ngModel)]="villaSpecs.bathrooms" name="v_baths" placeholder="e.g. 4 En-suite Bathrooms" class="form-control" />
              </div>
              <div class="form-group">
                <label>Built-up Area (sq ft)</label>
                <input type="text" [(ngModel)]="villaSpecs.builtUpArea" name="v_builtUp" placeholder="e.g. 3600 sq ft" class="form-control" />
              </div>
              <div class="form-group">
                <label>Plot Area (sq ft)</label>
                <input type="text" [(ngModel)]="villaSpecs.plotArea" name="v_plotArea" placeholder="e.g. 2400 sq ft" class="form-control" />
              </div>
              <div class="form-group">
                <label>Floors / Levels</label>
                <select [(ngModel)]="villaSpecs.floors" name="v_floors" class="form-control">
                  <option value="Ground + 1 Floor (G+1)">Ground + 1 Floor (G+1)</option>
                  <option value="Ground + 2 Floors (G+2)">Ground + 2 Floors (G+2)</option>
                  <option value="Single Floor Luxury Bungalow">Single Floor Luxury Bungalow</option>
                  <option value="G+3 with Rooftop Terrace">G+3 with Rooftop Terrace</option>
                </select>
              </div>
              <div class="form-group">
                <label>Furnishing Status</label>
                <select [(ngModel)]="villaSpecs.furnishing" name="v_furnish" class="form-control">
                  <option value="Semi-Furnished (Wardrobes & Modular Kitchen)">Semi-Furnished</option>
                  <option value="Fully Furnished (Luxury Interiors)">Fully Furnished</option>
                  <option value="Unfurnished / Raw Shell">Unfurnished</option>
                </select>
              </div>
              <div class="form-group">
                <label>Car Parking Spaces</label>
                <input type="text" [(ngModel)]="villaSpecs.parking" name="v_parking" placeholder="e.g. 2 Covered Car Parks" class="form-control" />
              </div>
              <div class="form-group">
                <label>Private Garden / Pool</label>
                <input type="text" [(ngModel)]="villaSpecs.gardenPool" name="v_pool" placeholder="e.g. Private Landscaped Garden + Plunge Pool" class="form-control" />
              </div>
            </div>

            <!-- APARTMENTS SPECIFIC FIELDS -->
            <div *ngIf="isApartmentCategory()" class="fields-grid">
              <div class="form-group">
                <label>Configuration</label>
                <select [(ngModel)]="aptSpecs.bedrooms" name="a_bhk" class="form-control">
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="2.5 BHK">2.5 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK Luxury Penthouse</option>
                </select>
              </div>
              <div class="form-group">
                <label>Super Built-up Area</label>
                <input type="text" [(ngModel)]="aptSpecs.builtUpArea" name="a_built" placeholder="e.g. 1850 sq ft" class="form-control" />
              </div>
              <div class="form-group">
                <label>Carpet Area</label>
                <input type="text" [(ngModel)]="aptSpecs.carpetArea" name="a_carpet" placeholder="e.g. 1450 sq ft" class="form-control" />
              </div>
              <div class="form-group">
                <label>Floor Number</label>
                <input type="text" [(ngModel)]="aptSpecs.floorNumber" name="a_floor" placeholder="e.g. 12th Floor of 24 Floors" class="form-control" />
              </div>
              <div class="form-group">
                <label>Society / Project Name</label>
                <input type="text" [(ngModel)]="aptSpecs.projectName" name="a_project" placeholder="e.g. Sobha Windsor / Prestige Lakeside" class="form-control" />
              </div>
              <div class="form-group">
                <label>Monthly Maintenance</label>
                <input type="text" [(ngModel)]="aptSpecs.maintenance" name="a_maint" placeholder="e.g. ₹ 4,500 / month" class="form-control" />
              </div>
            </div>

            <!-- COMMERCIAL SPECIFIC FIELDS -->
            <div *ngIf="isCommercialCategory()" class="fields-grid">
              <div class="form-group">
                <label>Suitable For</label>
                <select [(ngModel)]="commercialSpecs.suitableFor" name="c_suitable" class="form-control">
                  <option value="Corporate IT Office">Corporate IT Office</option>
                  <option value="Retail Store / Showroom">Retail Store / Showroom</option>
                  <option value="Clinic / Diagnostic Center">Clinic / Diagnostic Center</option>
                  <option value="Restaurant / Cafe Space">Restaurant / Cafe Space</option>
                  <option value="Warehouse / Logistics">Warehouse / Logistics</option>
                </select>
              </div>
              <div class="form-group">
                <label>Power Backup Capacity</label>
                <input type="text" [(ngModel)]="commercialSpecs.powerBackup" name="c_power" placeholder="e.g. 100% DG Power Backup" class="form-control" />
              </div>
              <div class="form-group">
                <label>Washrooms Available</label>
                <input type="text" [(ngModel)]="commercialSpecs.washrooms" name="c_wash" placeholder="e.g. 2 Private + Common Restrooms" class="form-control" />
              </div>
              <div class="form-group">
                <label>Parking Capacity</label>
                <input type="text" [(ngModel)]="commercialSpecs.parking" name="c_park" placeholder="e.g. 6 Dedicated Car Slots + Visitor" class="form-control" />
              </div>
            </div>

            <!-- FARM LAND SPECIFIC FIELDS -->
            <div *ngIf="isFarmLandCategory()" class="fields-grid">
              <div class="form-group">
                <label>Total Land Acreage</label>
                <input type="text" [(ngModel)]="farmSpecs.acreage" name="f_acre" placeholder="e.g. 2.5 Acres (100 Guntas)" class="form-control" />
              </div>
              <div class="form-group">
                <label>Water Source</label>
                <input type="text" [(ngModel)]="farmSpecs.waterSource" name="f_water" placeholder="e.g. 2 High-Yield Borewells + Canal Touch" class="form-control" />
              </div>
              <div class="form-group">
                <label>Soil Type</label>
                <select [(ngModel)]="farmSpecs.soilType" name="f_soil" class="form-control">
                  <option value="Fertile Red Soil">Fertile Red Soil</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                </select>
              </div>
              <div class="form-group">
                <label>Fencing & Security</label>
                <select [(ngModel)]="farmSpecs.fencing" name="f_fence" class="form-control">
                  <option value="Fully Solar Fenced">Fully Solar Fenced</option>
                  <option value="Barbed Wire Fenced">Barbed Wire Fenced</option>
                  <option value="Open Boundary">Open Boundary</option>
                </select>
              </div>
            </div>

            <!-- GENERIC / FALLBACK FOR OTHER CATEGORIES -->
            <div *ngIf="!isPlotCategory() && !isVillaCategory() && !isApartmentCategory() && !isCommercialCategory() && !isFarmLandCategory()" class="fields-grid">
              <div class="form-group">
                <label>Key Highlight 1</label>
                <input type="text" [(ngModel)]="genericSpecs.h1" name="g_h1" placeholder="e.g. Premium Clear Title Deed" class="form-control" />
              </div>
              <div class="form-group">
                <label>Key Highlight 2</label>
                <input type="text" [(ngModel)]="genericSpecs.h2" name="g_h2" placeholder="e.g. Immediate Registration" class="form-control" />
              </div>
            </div>
          </div>

          <!-- -----------------------------------------------------------
               SECTION 5: SELLER CONTACT INFORMATION
          ------------------------------------------------------------ -->
          <div class="form-section">
            <div class="section-title-row">
              <div class="section-badge">5</div>
              <div>
                <h2>Seller Contact Details</h2>
                <p class="section-hint">Used by Admin compliance officers and verified Platinum buyers.</p>
              </div>
            </div>

            <div class="fields-grid">
              <div class="form-group">
                <label for="sName">Seller Name</label>
                <input id="sName" type="text" [(ngModel)]="formData.sellerName" name="sellerName" class="form-control" />
              </div>
              <div class="form-group">
                <label for="sPhone">Seller Mobile Number</label>
                <input id="sPhone" type="tel" [(ngModel)]="formData.sellerPhone" name="sellerPhone" class="form-control" />
              </div>
              <div class="form-group span-2">
                <label for="sEmail">Seller Email / Gmail</label>
                <input id="sEmail" type="email" [(ngModel)]="formData.sellerEmail" name="sellerEmail" class="form-control" />
              </div>
            </div>
          </div>

          <!-- Submit Button & Disclaimer -->
          <div class="submit-action-area">
            <button
              type="submit"
              [disabled]="isSubmitting() || uploadedImages().length < 4"
              class="btn-submit-platinum"
            >
              <span *ngIf="!isSubmitting()">
                Submit Property for Admin Approval (PENDING)
              </span>
              <span *ngIf="isSubmitting()" class="submitting-label">
                <span class="spinner-sm"></span> Submitting Property & Photos...
              </span>
            </button>
            <p class="submit-note">
              By submitting, your listing is assigned <strong>status = PENDING</strong> and submitted to the Executive Admin Panel. It will not be shown publicly until verified and approved.
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .seller-post-page {
      min-height: 85vh;
      background: #0B1118;
      color: #F8FAFC;
      padding-bottom: 5rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .container {
      max-width: 980px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Top Bar */
    .seller-top-bar {
      background: #111A24;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.85rem 0;
    }

    .top-bar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #94A3B8;
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #D4AF37;
    }

    .top-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .platinum-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      color: #38BDF8;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .my-props-link {
      color: #D4AF37;
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
    }

    .my-props-link:hover {
      text-decoration: underline;
    }

    /* Form Container */
    .form-main-container {
      padding-top: 2.5rem;
    }

    .form-header-box {
      margin-bottom: 2rem;
    }

    .selected-cat-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0.75rem;
    }

    .cat-pill {
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #D4AF37;
      font-size: 0.82rem;
      padding: 4px 12px;
      border-radius: 8px;
    }

    .btn-change {
      color: #94A3B8;
      font-size: 0.78rem;
      text-decoration: underline;
      cursor: pointer;
    }

    .btn-change:hover {
      color: #F8FAFC;
    }

    .form-header-box h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 0.5rem;
    }

    .form-intro {
      font-size: 0.95rem;
      color: #94A3B8;
      margin: 0;
      line-height: 1.5;
    }

    /* Alert Banner */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.88rem;
    }

    .alert-banner.error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #FCA5A5;
    }

    /* Form Sections */
    .form-section {
      background: #131E2A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 1.75rem;
    }

    .section-title-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .section-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #D4AF37;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-title-row h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.25rem;
    }

    .section-hint {
      font-size: 0.84rem;
      color: #94A3B8;
      margin: 0;
    }

    .photo-counter {
      margin-left: auto;
      font-size: 0.82rem;
      font-weight: 700;
      color: #F59E0B;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 4px 10px;
      border-radius: 6px;
    }

    .photo-counter.valid {
      color: #10B981;
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .counter-status {
      font-size: 0.72rem;
      font-weight: normal;
      margin-left: 4px;
    }

    .req {
      color: #EF4444;
    }

    /* Dropzone */
    .dropzone {
      border: 2px dashed rgba(212, 175, 55, 0.35);
      background: rgba(212, 175, 55, 0.03);
      border-radius: 12px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1.25rem;
    }

    .dropzone:hover {
      background: rgba(212, 175, 55, 0.08);
      border-color: #D4AF37;
    }

    .dropzone-icon {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }

    .dropzone h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.35rem;
    }

    .dropzone p {
      font-size: 0.82rem;
      color: #94A3B8;
      margin: 0 0 1rem;
    }

    .btn-browse {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #D4AF37;
      font-size: 0.84rem;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 8px;
      cursor: pointer;
      pointer-events: none;
    }

    /* Previews Grid */
    .previews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .preview-card {
      background: #0B1118;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
    }

    .preview-img-wrap {
      position: relative;
      height: 120px;
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .index-pill {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(0, 0, 0, 0.75);
      color: #FFFFFF;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .index-pill.cover {
      background: #D4AF37;
      color: #0B1118;
    }

    .btn-remove-img {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.85);
      border: none;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .btn-remove-img:hover {
      background: #DC2626;
    }

    .img-meta {
      padding: 6px 8px;
      font-size: 0.7rem;
      color: #94A3B8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .photo-warning {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FCD34D;
      font-size: 0.82rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    /* Fields Grid */
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .span-2 {
      grid-column: span 2;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #CBD5E1;
    }

    .form-control {
      background: #0B1118;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #F8FAFC;
      font-size: 0.88rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #D4AF37;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
    }

    select.form-control {
      cursor: pointer;
    }

    textarea.form-control {
      resize: vertical;
    }

    /* Submit Area */
    .submit-action-area {
      text-align: center;
      padding: 1rem 0;
    }

    .btn-submit-platinum {
      width: 100%;
      max-width: 480px;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #0B1118;
      font-size: 1rem;
      font-weight: 800;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
      transition: all 0.25s;
    }

    .btn-submit-platinum:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(212, 175, 55, 0.35);
    }

    .btn-submit-platinum:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .submit-note {
      font-size: 0.8rem;
      color: #94A3B8;
      margin-top: 0.75rem;
    }

    .submit-note strong {
      color: #FCD34D;
    }

    .submitting-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(0, 0, 0, 0.3);
      border-top-color: #000000;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Confirmation Card */
    .confirmation-container {
      padding-top: 3.5rem;
    }

    .confirmation-card {
      background: #131E2A;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      padding: 3rem 2rem;
      text-align: center;
      max-width: 680px;
      margin: 0 auto;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    .success-icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid rgba(16, 185, 129, 0.4);
      color: #10B981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .pending-pill-large {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #FCD34D;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 6px 16px;
      border-radius: 20px;
      margin-bottom: 1rem;
    }

    .pulse-amber {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #F59E0B;
      box-shadow: 0 0 8px #F59E0B;
    }

    .confirmation-card h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 0.75rem;
    }

    .confirmation-desc {
      font-size: 0.95rem;
      color: #94A3B8;
      line-height: 1.6;
      margin: 0 0 2rem;
    }

    .submitted-summary-box {
      background: #0B1118;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: left;
      margin-bottom: 2rem;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 1rem;
    }

    .summary-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .summary-price {
      font-size: 1.1rem;
      font-weight: 800;
      color: #D4AF37;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .item-label {
      font-size: 0.72rem;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .item-value {
      font-size: 0.88rem;
      font-weight: 600;
      color: #E2E8F0;
    }

    .platinum-val {
      color: #38BDF8;
    }

    .pending-val {
      color: #FCD34D;
    }

    .confirmation-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-primary-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #0B1118;
      font-size: 0.92rem;
      font-weight: 800;
      padding: 0.85rem 1.5rem;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-primary-action:hover {
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
      transform: translateY(-2px);
    }

    .btn-secondary-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #F8FAFC;
      font-size: 0.92rem;
      font-weight: 600;
      padding: 0.85rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary-action:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .fields-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
      .summary-grid { grid-template-columns: 1fr 1fr; }
      .previews-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class SellerPropertyNewComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categorySlug = signal('plots-land');
  categoryId = signal('');
  categoryName = signal('Plot / Land');

  isSubmitted = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  uploadedImages = signal<ImageUploadItem[]>([]);

  submittedData: any = null;

  formData = {
    title: '',
    price: '',
    propertySize: '',
    propertyType: 'Residential',
    availability: 'Ready to Move / Register',
    description: '',
    location: '',
    city: 'Bangalore',
    fullAddress: '',
    roadAccess: '',
    facing: 'East',
    landmark: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: ''
  };

  // Category specific objects
  plotSpecs = {
    dimensions: '30x40',
    approvalAuthority: 'BMRDA Approved',
    isCornerPlot: 'No',
    isGatedCommunity: 'Yes',
    boundaryWall: 'Constructed',
    utilities: 'Fully Available (Cauvery + Borewell)'
  };

  villaSpecs = {
    bedrooms: '4 BHK',
    bathrooms: '4 Bathrooms',
    builtUpArea: '3200 sq ft',
    plotArea: '2400 sq ft',
    floors: 'Ground + 1 Floor (G+1)',
    furnishing: 'Semi-Furnished (Wardrobes & Modular Kitchen)',
    parking: '2 Covered Car Parks',
    gardenPool: 'Private Landscaped Garden'
  };

  aptSpecs = {
    bedrooms: '3 BHK',
    builtUpArea: '1650 sq ft',
    carpetArea: '1350 sq ft',
    floorNumber: '8th Floor',
    projectName: 'Prestige Lakeside',
    maintenance: '₹ 4,000 / month'
  };

  commercialSpecs = {
    suitableFor: 'Corporate IT Office',
    powerBackup: '100% DG Power Backup',
    washrooms: '2 Private Restrooms',
    parking: '4 Dedicated Car Slots'
  };

  farmSpecs = {
    acreage: '2 Acres',
    waterSource: 'Borewell + Drip Irrigation',
    soilType: 'Fertile Red Soil',
    fencing: 'Fully Solar Fenced'
  };

  genericSpecs = {
    h1: 'Clear Legal Documentation',
    h2: 'Immediate Registration Available'
  };

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Pre-fill contact details from logged-in seller
    const seller = this.authService.currentSeller();
    if (seller) {
      this.formData.sellerName = seller.fullName || '';
      this.formData.sellerPhone = seller.mobile || '';
      this.formData.sellerEmail = seller.email || '';
    }

    // Read category from queryParams
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.categorySlug.set(params['category']);
      }
      if (params['categoryId']) {
        this.categoryId.set(params['categoryId']);
      }
      if (params['categoryName']) {
        this.categoryName.set(params['categoryName']);
      } else {
        this.categoryName.set(this.formatSlug(this.categorySlug()));
      }
    });
  }

  isPlotCategory(): boolean {
    const s = this.categorySlug().toLowerCase();
    return s.includes('plot') || s.includes('land');
  }

  isVillaCategory(): boolean {
    const s = this.categorySlug().toLowerCase();
    return s.includes('villa') || s.includes('estate');
  }

  isApartmentCategory(): boolean {
    const s = this.categorySlug().toLowerCase();
    return s.includes('apartment') || s.includes('flat');
  }

  isCommercialCategory(): boolean {
    const s = this.categorySlug().toLowerCase();
    return s.includes('commercial');
  }

  isFarmLandCategory(): boolean {
    const s = this.categorySlug().toLowerCase();
    return s.includes('farm');
  }

  formatSlug(slug: string): string {
    const map: Record<string, string> = {
      'plots': 'Plot / Land',
      'plots-land': 'Plot / Land',
      'villas': 'Villa & Estates',
      'villas-estates': 'Villa & Estates',
      'apartments': 'Apartment / Flats',
      'independent-houses': 'Independent House',
      'commercial': 'Commercial Space',
      'commercial-spaces': 'Commercial Space',
      'farm-lands': 'Farm Land'
    };
    return map[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const remainingSlots = 5 - this.uploadedImages().length;
    const toProcess = files.slice(0, remainingSlots);

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
            const item: ImageUploadItem = {
              id: Math.random().toString(36).substring(2, 9),
              dataUrl: compressedUrl,
              name: file.name,
              size: compressedUrl.length
            };
            this.uploadedImages.update(imgs => [...imgs, item]);
            return;
          }
          const item: ImageUploadItem = {
            id: Math.random().toString(36).substring(2, 9),
            dataUrl: rawUrl,
            name: file.name,
            size: file.size
          };
          this.uploadedImages.update(imgs => [...imgs, item]);
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    this.uploadedImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  addSamplePhotos(): void {
    const samples = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ];
    const current = [...this.uploadedImages()];
    for (const s of samples) {
      if (current.length < 5 && !current.some(c => c.dataUrl === s)) {
        current.push({
          id: Math.random().toString(36).substring(2, 9),
          dataUrl: s,
          name: 'curated-luxury-photo.jpg',
          size: 102400
        });
      }
    }
    this.uploadedImages.set(current);
  }

  async handleSubmit(): Promise<void> {
    this.errorMessage.set(null);

    // Validation: Minimum 1 photo
    if (this.uploadedImages().length < 1) {
      this.errorMessage.set('Please upload at least 1 property photo (maximum 5 photos).');
      return;
    }

    if (this.uploadedImages().length > 5) {
      this.errorMessage.set('Maximum 5 photos allowed. Please remove extra images.');
      return;
    }

    if (!this.formData.title || !this.formData.price || !this.formData.propertySize || !this.formData.description || !this.formData.location) {
      this.errorMessage.set('Please complete all required fields (Title, Price, Size, Description, Location).');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const seller = this.authService.currentSeller();

      // Collect category specific specs
      let categorySpecs: Record<string, any> = {};
      if (this.isPlotCategory()) {
        categorySpecs = { ...this.plotSpecs };
      } else if (this.isVillaCategory()) {
        categorySpecs = { ...this.villaSpecs };
      } else if (this.isApartmentCategory()) {
        categorySpecs = { ...this.aptSpecs };
      } else if (this.isCommercialCategory()) {
        categorySpecs = { ...this.commercialSpecs };
      } else if (this.isFarmLandCategory()) {
        categorySpecs = { ...this.farmSpecs };
      } else {
        categorySpecs = { ...this.genericSpecs };
      }

      const cleanPrice = parseFloat(String(this.formData.price).replace(/[^0-9.]/g, '')) || 0;
      const priceDisplayStr = this.formData.price.startsWith('₹') || this.formData.price.startsWith('$')
        ? this.formData.price
        : `₹${cleanPrice.toLocaleString('en-IN')}`;

      const sellerIdStr = (seller as any)?.seller_id || seller?.id || '';
      const sellerNameStr = this.formData.sellerName.trim() || seller?.fullName || 'Seller';
      const sellerPhoneStr = this.formData.sellerPhone.trim() || seller?.mobile || '';
      const sellerEmailStr = this.formData.sellerEmail.trim() || seller?.email || '';

      let backendPropertyId = '';

      // 1. Live sync to NestJS REST API backend first
      try {
        const response = await fetch('http://localhost:5001/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: this.formData.title.trim(),
            category: this.categoryName(),
            location: this.formData.location.trim(),
            city: this.formData.city.trim(),
            price: cleanPrice,
            priceDisplay: priceDisplayStr,
            description: this.formData.description.trim(),
            status: 'PENDING',
            planType: 'PLATINUM',
            sellerId: sellerIdStr,
            sellerName: sellerNameStr,
            sellerPhone: sellerPhoneStr,
            sellerEmail: sellerEmailStr,
            categorySpecs,
            images: this.uploadedImages().map(img => img.dataUrl)
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.property?.id) {
            backendPropertyId = resData.property.id;
          }
        }
      } catch (e) {
        console.warn('Backend sync warning:', e);
      }

      // 2. Prepare seller local item (store thumbnail to avoid QuotaExceededError)
      const primaryCover = this.uploadedImages()[0]?.dataUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
      const sellerPropItem = {
        property_id: backendPropertyId || ('prop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
        id: backendPropertyId || ('prop_' + Date.now()),
        title: this.formData.title.trim(),
        category: this.categorySlug(),
        plan: 'PLATINUM',
        price: cleanPrice,
        priceDisplay: priceDisplayStr,
        location: this.formData.location.trim(),
        city: this.formData.city.trim(),
        locality: this.formData.location.trim(),
        full_address: this.formData.fullAddress.trim(),
        status: 'PENDING',
        created_at: new Date().toISOString(),
        image_urls: [primaryCover],
        category_specs: categorySpecs,
        seller_id: sellerIdStr,
        seller_name: sellerNameStr,
        seller_phone: sellerPhoneStr,
        seller_email: sellerEmailStr
      };

      try {
        const stored = localStorage.getItem('aura_seller_properties');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(sellerPropItem);
        localStorage.setItem('aura_seller_properties', JSON.stringify(list));
      } catch (err) {
        console.error('Failed to save to local storage', err);
      }

      this.isSubmitting.set(false);
      this.submittedData = {
        title: this.formData.title,
        price: priceDisplayStr,
        categoryName: this.categoryName(),
        location: this.formData.location + ', ' + this.formData.city,
        submissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      this.isSubmitted.set(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('Error occurred while submitting property. Please try again.');
    }
  }

  resetAndSubmitAnother(): void {
    this.router.navigate(['/seller/categories']);
  }
}

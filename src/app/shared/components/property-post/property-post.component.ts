import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertySpecs } from '../../../core/models/property.model';

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge?: string;
}

@Component({
  selector: 'app-property-post',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="post-property-container">
      <!-- Breadcrumb / Header -->
      <div class="page-top-bar">
        <a [routerLink]="dashboardRoute()" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to {{ isDealer() ? 'Dealer' : 'Seller' }} Dashboard
        </a>
        <div class="platinum-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          AUTOMATIC PLATINUM PLAN LISTING
        </div>
      </div>

      <!-- ==============================================
           STEP 1: CATEGORY SELECTION
      =============================================== -->
      <div *ngIf="currentStep() === 1" class="category-selection-step">
        <div class="step-header">
          <span class="step-counter">STEP 1 OF 2</span>
          <h1>What type of property are you selling?</h1>
          <p class="subtitle">Select the property category to load the tailored Platinum submission form.</p>
        </div>

        <div class="categories-grid">
          <div
            *ngFor="let cat of categories"
            class="category-card"
            [class.selected]="selectedCategory() === cat.id"
            (click)="selectCategory(cat.id)"
          >
            <div class="cat-icon" [innerHTML]="cat.icon"></div>
            <div class="cat-content">
              <h3>{{ cat.name }}</h3>
              <p>{{ cat.description }}</p>
            </div>
            <div class="select-indicator">
              <span class="arrow-icon">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==============================================
           STEP 2: COMPLETE PROPERTY FORM (DYNAMIC)
      =============================================== -->
      <div *ngIf="currentStep() === 2" class="form-step">
        <!-- Form Header -->
        <div class="form-header-bar">
          <div>
            <div class="category-active-chip">
              <span>Category: <strong>{{ getCategoryName(selectedCategory()) }}</strong></span>
              <button type="button" (click)="changeCategory()" class="change-cat-btn">Change Category</button>
            </div>
            <h2>Post Platinum Property Listing</h2>
            <p class="form-subtitle">Complete property specifications, location data, and photo uploads</p>
          </div>
          <div class="verified-guarantee">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Verified Platinum Access</span>
          </div>
        </div>

        <!-- Global Error Alert -->
        <div *ngIf="errorMessage()" class="alert-box error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Global Success Alert -->
        <div *ngIf="successMessage()" class="alert-box success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage() }}</span>
        </div>

        <form (ngSubmit)="submitProperty()" class="property-form" novalidate>
          <!-- ---------------------------------------
               SECTION: PHOTO UPLOAD (1 - 4 PHOTOS)
          ---------------------------------------- -->
          <div class="form-section-card">
            <div class="section-title-wrap">
              <div class="section-num">1</div>
              <div>
                <h3>Upload Property Photos (1 to 4 Images) <span class="req">*</span></h3>
                <p class="section-desc">Upload high-resolution photography. Exactly 1 to 4 photos allowed. The first image will be the primary cover.</p>
              </div>
            </div>

            <!-- Upload Dropzone -->
            <div class="photo-upload-zone" (click)="fileInput.click()">
              <input
                #fileInput
                type="file"
                multiple
                accept="image/*"
                (change)="onFilesSelected($event)"
                style="display: none;"
              />
              <div class="upload-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h4>Click to browse & upload property photos</h4>
              <p>Supports JPG, PNG, WEBP (Max 4 images). Minimum 1 photo required.</p>
              <div class="upload-btn-fake">Select Photos from Device</div>
            </div>

            <!-- Preset / Sample Images Helper for Convenience -->
            <div class="preset-helper">
              <span>Or add luxury sample photos (Up to 4):</span>
              <button type="button" (click)="addSamplePhotos()" class="sample-btn" [disabled]="uploadedImages().length >= 4">
                + Load Curated Luxury Photos
              </button>
            </div>

            <!-- Thumbnail Preview List -->
            <div *ngIf="uploadedImages().length > 0" class="thumbnails-grid">
              <div
                *ngFor="let img of uploadedImages(); let i = index"
                class="thumb-card"
                [class.cover]="i === 0"
              >
                <img [src]="img" [alt]="'Photo ' + (i + 1)" class="thumb-img" />
                <div *ngIf="i === 0" class="cover-badge">PRIMARY COVER</div>
                <div class="thumb-actions">
                  <label class="replace-label" title="Replace Photo">
                    <input
                      type="file"
                      accept="image/*"
                      (change)="replacePhoto(i, $event)"
                      style="display: none;"
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Replace
                  </label>
                  <button type="button" (click)="removePhoto(i)" class="remove-btn" title="Remove Photo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="image-count-status" [class.valid]="uploadedImages().length >= 1 && uploadedImages().length <= 4">
              <span>Uploaded: <strong>{{ uploadedImages().length }} of 4 photos</strong></span>
              <span *ngIf="uploadedImages().length === 0" class="warn-text">(At least 1 photo is required)</span>
            </div>
          </div>

          <!-- ---------------------------------------
               SECTION: COMMON PROPERTY DETAILS
          ---------------------------------------- -->
          <div class="form-section-card">
            <div class="section-title-wrap">
              <div class="section-num">2</div>
              <div>
                <h3>Common Property Details</h3>
                <p class="section-desc">Key property highlights, pricing and descriptive information.</p>
              </div>
            </div>

            <div class="form-grid">
              <!-- Property Title -->
              <div class="form-group full-width">
                <label for="title">Property Title <span class="req">*</span></label>
                <input
                  id="title"
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  placeholder="e.g. Ultra-Luxury 4 BHK Sky Villa with Private Pool"
                  class="form-input"
                />
              </div>

              <!-- Property Type -->
              <div class="form-group">
                <label for="type">Property Sub-Type / Tag <span class="req">*</span></label>
                <input
                  id="type"
                  type="text"
                  [(ngModel)]="formData.type"
                  name="type"
                  required
                  placeholder="e.g. Luxury Villa, DTCP Plot, Penthouse, Tech Space"
                  class="form-input"
                />
              </div>

              <!-- Property Price -->
              <div class="form-group">
                <label for="price">Property Price (INR) <span class="req">*</span></label>
                <input
                  id="price"
                  type="text"
                  [(ngModel)]="formData.price"
                  name="price"
                  required
                  placeholder="e.g. ₹3.50 Cr or ₹85 Lakhs"
                  class="form-input"
                />
              </div>

              <!-- Property Size / Area -->
              <div class="form-group">
                <label for="area">Property Size / Area <span class="req">*</span></label>
                <input
                  id="area"
                  type="text"
                  [(ngModel)]="formData.area"
                  name="area"
                  required
                  placeholder="e.g. 3,450 sq.ft or 2.5 Acres or 2,400 sq.ft"
                  class="form-input"
                />
              </div>

              <!-- Road Access -->
              <div class="form-group">
                <label for="roadAccess">Road Access / Width <span class="req">*</span></label>
                <input
                  id="roadAccess"
                  type="text"
                  [(ngModel)]="formData.roadAccess"
                  name="roadAccess"
                  required
                  placeholder="e.g. 60 ft Main Arterial Road / 4-lane Highway"
                  class="form-input"
                />
              </div>

              <!-- Full Address -->
              <div class="form-group full-width">
                <label for="address">Full Property Address <span class="req">*</span></label>
                <input
                  id="address"
                  type="text"
                  [(ngModel)]="formData.address"
                  name="address"
                  required
                  placeholder="Street name, landmark, survey number, zone"
                  class="form-input"
                />
              </div>

              <!-- City -->
              <div class="form-group">
                <label for="city">City <span class="req">*</span></label>
                <input
                  id="city"
                  type="text"
                  [(ngModel)]="formData.city"
                  name="city"
                  required
                  placeholder="e.g. Bangalore, Hyderabad, Chennai, Mumbai"
                  class="form-input"
                />
              </div>

              <!-- Locality / Area -->
              <div class="form-group">
                <label for="locality">Locality / Sector <span class="req">*</span></label>
                <input
                  id="locality"
                  type="text"
                  [(ngModel)]="formData.locality"
                  name="locality"
                  required
                  placeholder="e.g. Whitefield, Jubilee Hills, OMR, Worli"
                  class="form-input"
                />
              </div>

              <!-- Nearby Location / Landmark -->
              <div class="form-group full-width">
                <label for="landmark">Nearby Landmark / Connectivity <span class="req">*</span></label>
                <input
                  id="landmark"
                  type="text"
                  [(ngModel)]="formData.landmark"
                  name="landmark"
                  required
                  placeholder="e.g. 500m to Metro Station, 10 min to International Airport"
                  class="form-input"
                />
              </div>

              <!-- Description -->
              <div class="form-group full-width">
                <label for="description">Detailed Property Description <span class="req">*</span></label>
                <textarea
                  id="description"
                  rows="4"
                  [(ngModel)]="formData.description"
                  name="description"
                  required
                  placeholder="Provide complete details about construction quality, views, legal status, potential ROI, and lifestyle amenities..."
                  class="form-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ---------------------------------------
               SECTION: CATEGORY-SPECIFIC DETAILS
          ---------------------------------------- -->
          <div class="form-section-card category-specific-card">
            <div class="section-title-wrap">
              <div class="section-num">3</div>
              <div>
                <h3>{{ getCategoryName(selectedCategory()) }} Specific Details</h3>
                <p class="section-desc">Tailored parameters for this property class</p>
              </div>
            </div>

            <!-- ================= PLOTS & LAND ================= -->
            <div *ngIf="selectedCategory() === 'plots-land'" class="form-grid">
              <div class="form-group">
                <label>Plot Size (sq.ft / cents / sq.yards)</label>
                <input type="text" [(ngModel)]="specs.plotSize" name="plotSize" placeholder="e.g. 2,400 sq.ft (40x60)" class="form-input" />
              </div>
              <div class="form-group">
                <label>Length (ft)</label>
                <input type="text" [(ngModel)]="specs.length" name="length" placeholder="e.g. 60 ft" class="form-input" />
              </div>
              <div class="form-group">
                <label>Width (ft)</label>
                <input type="text" [(ngModel)]="specs.width" name="width" placeholder="e.g. 40 ft" class="form-input" />
              </div>
              <div class="form-group">
                <label>Facing Direction</label>
                <select [(ngModel)]="specs.facing" name="facing" class="form-select">
                  <option value="North">North Facing</option>
                  <option value="East">East Facing</option>
                  <option value="North-East">North-East Facing (Vaastu)</option>
                  <option value="West">West Facing</option>
                  <option value="South">South Facing</option>
                  <option value="Corner">Corner Plot (Dual Facing)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Corner Plot?</label>
                <select [(ngModel)]="specs.cornerPlot" name="cornerPlot" class="form-select">
                  <option value="Yes">Yes (Corner Plot)</option>
                  <option value="No">No (Intermediate Plot)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Approval Authority / Legal Clearances</label>
                <input type="text" [(ngModel)]="specs.dtcpApproved" name="dtcpApproved" placeholder="e.g. DTCP, RERA, BDA, CMDA Approved" class="form-input" />
              </div>
            </div>

            <!-- ================= VILLAS & ESTATES / INDEPENDENT HOUSES ================= -->
            <div *ngIf="selectedCategory() === 'villas-estates' || selectedCategory() === 'independent-houses' || selectedCategory() === 'all-residential'" class="form-grid">
              <div class="form-group">
                <label>BHK Configuration</label>
                <select [(ngModel)]="specs.bhk" name="bhk" class="form-select">
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5 BHK">5 BHK</option>
                  <option value="6+ BHK">6+ BHK / Mansion</option>
                </select>
              </div>
              <div class="form-group">
                <label>Bedrooms</label>
                <input type="number" [(ngModel)]="specs.bedrooms" name="bedrooms" placeholder="e.g. 4" class="form-input" />
              </div>
              <div class="form-group">
                <label>Bathrooms</label>
                <input type="number" [(ngModel)]="specs.bathrooms" name="bathrooms" placeholder="e.g. 5" class="form-input" />
              </div>
              <div class="form-group">
                <label>Built-up Area (sq.ft)</label>
                <input type="text" [(ngModel)]="specs.builtUpArea" name="builtUpArea" placeholder="e.g. 4,200 sq.ft" class="form-input" />
              </div>
              <div class="form-group">
                <label>Plot / Land Area (sq.ft)</label>
                <input type="text" [(ngModel)]="specs.plotArea" name="plotArea" placeholder="e.g. 3,600 sq.ft" class="form-input" />
              </div>
              <div class="form-group">
                <label>Parking Capacity</label>
                <input type="text" [(ngModel)]="specs.parking" name="parking" placeholder="e.g. 2 Covered Car Bays" class="form-input" />
              </div>
              <div class="form-group">
                <label>Furnishing Status</label>
                <select [(ngModel)]="specs.furnishing" name="furnishing" class="form-select">
                  <option value="Fully Furnished">Fully Furnished (Designer)</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished (Bare Shell)</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Key Amenities</label>
                <input type="text" [(ngModel)]="specs.amenitiesText" name="amenitiesText" placeholder="e.g. Private Pool, Home Cinema, Italian Marble, Solar Power, Garden" class="form-input" />
              </div>
            </div>

            <!-- ================= APARTMENTS / FLATS ================= -->
            <div *ngIf="selectedCategory() === 'apartments'" class="form-grid">
              <div class="form-group">
                <label>BHK Configuration</label>
                <select [(ngModel)]="specs.bhk" name="bhk" class="form-select">
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="Penthouse">Luxury Penthouse</option>
                </select>
              </div>
              <div class="form-group">
                <label>Floor Number</label>
                <input type="text" [(ngModel)]="specs.floor" name="floor" placeholder="e.g. 14th Floor" class="form-input" />
              </div>
              <div class="form-group">
                <label>Total Tower Floors</label>
                <input type="text" [(ngModel)]="specs.totalFloors" name="totalFloors" placeholder="e.g. 28 Floors" class="form-input" />
              </div>
              <div class="form-group">
                <label>Built-up Area (sq.ft)</label>
                <input type="text" [(ngModel)]="specs.builtUpArea" name="builtUpArea" placeholder="e.g. 2,150 sq.ft" class="form-input" />
              </div>
              <div class="form-group">
                <label>Parking Space</label>
                <input type="text" [(ngModel)]="specs.parking" name="parking" placeholder="e.g. 2 Dedicated Basement Bays" class="form-input" />
              </div>
              <div class="form-group">
                <label>Furnishing Status</label>
                <select [(ngModel)]="specs.furnishing" name="furnishing" class="form-select">
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Society & Club Amenities</label>
                <input type="text" [(ngModel)]="specs.amenitiesText" name="amenitiesText" placeholder="e.g. Infinity Sky Pool, Gym, Concierge, EV Charging, Tennis Court" class="form-input" />
              </div>
            </div>

            <!-- ================= COMMERCIAL SPACES ================= -->
            <div *ngIf="selectedCategory() === 'commercial-spaces'" class="form-grid">
              <div class="form-group">
                <label>Commercial Property Type</label>
                <select [(ngModel)]="specs.commercialType" name="commercialType" class="form-select">
                  <option value="Grade-A Corporate Office">Grade-A Corporate Office</option>
                  <option value="Retail Showroom">Retail Showroom</option>
                  <option value="High-Street Retail Shop">High-Street Retail Shop</option>
                  <option value="Standalone Commercial Building">Standalone Commercial Building</option>
                  <option value="Warehouse / Logistics">Warehouse / Logistics Park</option>
                </select>
              </div>
              <div class="form-group">
                <label>Built-up Area (sq.ft)</label>
                <input type="text" [(ngModel)]="specs.builtUpArea" name="builtUpArea" placeholder="e.g. 12,500 sq.ft" class="form-input" />
              </div>
              <div class="form-group">
                <label>Floor / Level</label>
                <input type="text" [(ngModel)]="specs.floor" name="floor" placeholder="e.g. Ground Floor + Mezzanine" class="form-input" />
              </div>
              <div class="form-group">
                <label>Parking Capacity</label>
                <input type="text" [(ngModel)]="specs.parking" name="parking" placeholder="e.g. 15 Dedicated Car Bays" class="form-input" />
              </div>
              <div class="form-group full-width">
                <label>Suitable For</label>
                <input type="text" [(ngModel)]="specs.suitableFor" name="suitableFor" placeholder="e.g. IT/MNC Headquarters, Banking/Financial Institution, Luxury Retail, Clinic" class="form-input" />
              </div>
              <div class="form-group full-width">
                <label>Building Specifications & Amenities</label>
                <input type="text" [(ngModel)]="specs.amenitiesText" name="amenitiesText" placeholder="e.g. 100% Power Backup, High-speed Elevators, Central HVAC, LEED Gold Certified" class="form-input" />
              </div>
            </div>

            <!-- ================= FARM LANDS ================= -->
            <div *ngIf="selectedCategory() === 'farm-lands'" class="form-grid">
              <div class="form-group">
                <label>Land Area (Acres / Cents)</label>
                <input type="text" [(ngModel)]="specs.plotSize" name="plotSize" placeholder="e.g. 4.5 Acres (180 Cents)" class="form-input" />
              </div>
              <div class="form-group">
                <label>Water Availability</label>
                <input type="text" [(ngModel)]="specs.waterAvailability" name="waterAvailability" placeholder="e.g. 2 Borewells with 3-inch yield, Canal access" class="form-input" />
              </div>
              <div class="form-group">
                <label>Electricity Connection</label>
                <input type="text" [(ngModel)]="specs.electricity" name="electricity" placeholder="e.g. Dedicated 3-Phase Free Agro Power" class="form-input" />
              </div>
              <div class="form-group">
                <label>Soil / Plantation Info</label>
                <input type="text" [(ngModel)]="specs.soilType" name="soilType" placeholder="e.g. Fertile Red Loamy Soil with Organic Mango Grove" class="form-input" />
              </div>
              <div class="form-group full-width">
                <label>Road Access to Farmland</label>
                <input type="text" [(ngModel)]="specs.roadWidth" name="roadWidth" placeholder="e.g. 30 ft All-weather Tar Road with Direct Highway Entry" class="form-input" />
              </div>
              <div class="form-group full-width">
                <label>Nearby Landmark & Proximity</label>
                <input type="text" [(ngModel)]="specs.nearbyLandmark" name="nearbyLandmark" placeholder="e.g. Adjacent to Forest Reserve, 20 km from City limits" class="form-input" />
              </div>
            </div>
          </div>

          <!-- ---------------------------------------
               SECTION: CONTACT & SUBMISSION
          ---------------------------------------- -->
          <div class="form-section-card">
            <div class="section-title-wrap">
              <div class="section-num">4</div>
              <div>
                <h3>Listing Contact & Submission</h3>
                <p class="section-desc">Owner/Dealer contact details that will be secured under the Platinum lock.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="contactName">{{ isDealer() ? 'Agency / Dealer Name' : 'Seller Full Name' }} <span class="req">*</span></label>
                <input id="contactName" type="text" [(ngModel)]="contactData.name" name="contactName" required class="form-input" />
              </div>
              <div class="form-group">
                <label for="contactPhone">Contact Mobile Number <span class="req">*</span></label>
                <input id="contactPhone" type="tel" [(ngModel)]="contactData.phone" name="contactPhone" required class="form-input" />
              </div>
              <div class="form-group">
                <label for="contactEmail">Contact Email Address <span class="req">*</span></label>
                <input id="contactEmail" type="email" [(ngModel)]="contactData.email" name="contactEmail" required class="form-input" />
              </div>
            </div>

            <div class="platinum-guarantee-box">
              <div class="plat-star">★</div>
              <div>
                <h4>Automatic Platinum Plan Assignment</h4>
                <p>This property will be immediately placed in the <strong>Platinum Plan</strong> under category <strong>"{{ getCategoryName(selectedCategory()) }}"</strong>. It begins in <strong>"Pending Verification"</strong> status with protected seller data.</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-prop-btn" [disabled]="isSubmitting()">
              <span *ngIf="!isSubmitting()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Submit Property for Platinum Listing
              </span>
              <span *ngIf="isSubmitting()" class="loading-state">
                <span class="spinner"></span> Processing & Publishing...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .post-property-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 36px 20px 80px 20px;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F8FAFC;
    }

    .page-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #94A3B8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #D4AF37;
    }

    .platinum-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: #E2C044;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 6px 14px;
      border-radius: 20px;
    }

    /* STEP 1: CATEGORY SELECTION */
    .step-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .step-counter {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #D4AF37;
      background: rgba(212, 175, 55, 0.1);
      padding: 4px 12px;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 12px;
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
      color: #FFFFFF;
    }

    .subtitle {
      font-size: 1rem;
      color: #94A3B8;
      margin: 0;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .category-card {
      background: #15202B;
      border: 1.5px solid #1E2D3D;
      border-radius: 18px;
      padding: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 18px;
      transition: all 0.25s ease;
      position: relative;
    }

    .category-card:hover {
      border-color: #D4AF37;
      transform: translateY(-4px);
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.4);
      background: #182533;
    }

    .category-card.selected {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.08);
    }

    .cat-icon {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      background: rgba(212, 175, 55, 0.12);
      color: #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cat-content h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #FFFFFF;
    }

    .cat-content p {
      font-size: 0.82rem;
      color: #94A3B8;
      margin: 0;
      line-height: 1.4;
    }

    .select-indicator {
      margin-left: auto;
      color: #475569;
      font-size: 1.3rem;
      font-weight: 700;
      transition: all 0.2s;
    }

    .category-card:hover .select-indicator {
      color: #D4AF37;
      transform: translateX(4px);
    }

    /* STEP 2: FORM STEP */
    .form-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      background: #15202B;
      border: 1px solid #1E2D3D;
      border-radius: 16px;
      padding: 22px 28px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .category-active-chip {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.82rem;
      color: #F8FAFC;
      margin-bottom: 10px;
    }

    .category-active-chip strong {
      color: #D4AF37;
    }

    .change-cat-btn {
      background: transparent;
      border: none;
      color: #D4AF37;
      font-size: 0.75rem;
      font-weight: 700;
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
    }

    .form-header-bar h2 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 6px 0;
    }

    .form-subtitle {
      font-size: 0.9rem;
      color: #94A3B8;
      margin: 0;
    }

    .verified-guarantee {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86EFAC;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .form-section-card {
      background: #15202B;
      border: 1px solid #1E2D3D;
      border-radius: 20px;
      padding: 32px 30px;
      margin-bottom: 24px;
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #1E2D3D;
    }

    .section-num {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      font-weight: 800;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-title-wrap h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #FFFFFF;
    }

    .section-desc {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 0;
    }

    .req {
      color: #D4AF37;
    }

    /* PHOTOS UPLOAD */
    .photo-upload-zone {
      background: #0B1118;
      border: 2px dashed #243447;
      border-radius: 16px;
      padding: 36px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .photo-upload-zone:hover {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.02);
    }

    .upload-icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.12);
      color: #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px auto;
    }

    .photo-upload-zone h4 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 6px 0;
    }

    .photo-upload-zone p {
      font-size: 0.84rem;
      color: #94A3B8;
      margin: 0 0 16px 0;
    }

    .upload-btn-fake {
      display: inline-block;
      background: #1E2D3D;
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .preset-helper {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
      font-size: 0.84rem;
      color: #94A3B8;
      flex-wrap: wrap;
    }

    .sample-btn {
      background: rgba(212, 175, 55, 0.12);
      border: 1px dashed rgba(212, 175, 55, 0.4);
      color: #D4AF37;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sample-btn:hover {
      background: rgba(212, 175, 55, 0.25);
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }

    .thumb-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #0B1118;
      border: 1px solid #1E2D3D;
    }

    .thumb-card.cover {
      border: 2px solid #D4AF37;
    }

    .thumb-img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      display: block;
    }

    .cover-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #D4AF37;
      color: #0B1118;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .thumb-actions {
      display: flex;
      background: #111A24;
      border-top: 1px solid #1E2D3D;
    }

    .replace-label, .remove-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 8px 4px;
      cursor: pointer;
      border: none;
      background: transparent;
      color: #94A3B8;
      transition: color 0.2s;
    }

    .replace-label:hover {
      color: #D4AF37;
    }

    .remove-btn:hover {
      color: #F87171;
    }

    .image-count-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      font-size: 0.85rem;
      color: #94A3B8;
    }

    .image-count-status.valid strong {
      color: #22C55E;
    }

    .warn-text {
      color: #F87171;
    }

    /* FORM FIELDS */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .full-width {
      grid-column: span 2;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #CBD5E1;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      background: #0B1118;
      border: 1.5px solid #243447;
      border-radius: 10px;
      color: #F8FAFC;
      font-size: 0.95rem;
      padding: 12px 16px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #D4AF37;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
    }

    .form-textarea {
      resize: vertical;
    }

    .platinum-guarantee-box {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 14px;
      padding: 18px 22px;
      margin-top: 24px;
    }

    .plat-star {
      font-size: 1.6rem;
      color: #D4AF37;
      line-height: 1;
    }

    .platinum-guarantee-box h4 {
      font-size: 0.98rem;
      color: #FFFFFF;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .platinum-guarantee-box p {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 0;
      line-height: 1.4;
    }

    .submit-prop-btn {
      width: 100%;
      padding: 16px 24px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border: none;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
      margin-top: 24px;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .submit-prop-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 40px rgba(212, 175, 55, 0.45);
      background: linear-gradient(135deg, #E2C044 0%, #C4970E 100%);
    }

    .submit-prop-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #0B1118;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 12px;
      font-size: 0.9rem;
      margin-bottom: 24px;
    }

    .alert-box.error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #FCA5A5;
    }

    .alert-box.success {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86EFAC;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .full-width {
        grid-column: span 1;
      }
      .form-header-bar {
        flex-direction: column;
      }
    }
  `]
})
export class PropertyPostComponent implements OnInit {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isDealer = signal<boolean>(false);
  currentStep = signal<number>(1);
  selectedCategory = signal<string>('plots-land');

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Uploaded images (Base64 data URLs or links, min 1, max 5)
  uploadedImages = signal<string[]>([]);

  // Categories list
  categories: CategoryOption[] = [
    {
      id: 'all-residential',
      name: 'All Residential',
      description: 'Villas, gated residences, private townships & duplexes',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`
    },
    {
      id: 'plots-land',
      name: 'Plots & Land',
      description: 'Residential layouts, corner sites, DTCP & RERA approved land',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`
    },
    {
      id: 'villas-estates',
      name: 'Villas & Estates',
      description: 'Luxury private villas, golf estates & designer bungalows',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`
    },
    {
      id: 'apartments',
      name: 'Apartments / Flats',
      description: 'High-rise sky residences, penthouses & luxury apartments',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="15" y1="22" x2="15" y2="2"></line></svg>`
    },
    {
      id: 'independent-houses',
      name: 'Independent Houses',
      description: 'Individual freehold homes, multi-generation family residences',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    },
    {
      id: 'commercial-spaces',
      name: 'Commercial Spaces',
      description: 'Grade-A tech parks, retail outlets, showrooms & office floors',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
    },
    {
      id: 'farm-lands',
      name: 'Farm Lands',
      description: 'Managed agricultural estates, eco retreats & fertile acreage',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
    }
  ];

  // Common Form Data
  formData = {
    title: '',
    type: 'Platinum Residence',
    price: '',
    area: '',
    roadAccess: '40 ft Wide Arterial Road',
    address: '',
    city: 'Bangalore',
    locality: '',
    landmark: '',
    description: ''
  };

  // Category specific specs
  specs: PropertySpecs & { amenitiesText?: string } = {
    plotSize: '2,400 sq.ft',
    length: '60 ft',
    width: '40 ft',
    facing: 'North-East',
    cornerPlot: 'Yes',
    dtcpApproved: 'DTCP & RERA Approved',
    bhk: '4 BHK',
    bedrooms: 4,
    bathrooms: 4,
    builtUpArea: '3,200 sq.ft',
    plotArea: '2,400 sq.ft',
    parking: '2 Covered Bays',
    furnishing: 'Semi-Furnished',
    floor: '12th Floor',
    totalFloors: '24 Floors',
    commercialType: 'Grade-A Corporate Office',
    suitableFor: 'IT / Tech / MNC Office',
    waterAvailability: 'Borewell + Perennial Stream',
    electricity: '3-Phase Agro Power',
    soilType: 'Rich Red Loamy Soil',
    nearbyLandmark: 'Near Outer Ring Road',
    amenitiesText: '24/7 Security, Power Backup, Landscaped Garden'
  };

  // Contact details
  contactData = {
    name: '',
    phone: '',
    email: ''
  };

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.loadDynamicCategories();

    // Determine whether accessed by dealer or seller
    const seller = this.authService.currentSeller();
    const dealer = this.authService.currentDealer();

    if (dealer) {
      this.isDealer.set(true);
      this.contactData.name = dealer.businessName || dealer.fullName || '';
      this.contactData.phone = dealer.mobile || dealer.phone || '';
      this.contactData.email = dealer.email || '';
    } else if (seller) {
      this.isDealer.set(false);
      this.contactData.name = seller.fullName || '';
      this.contactData.phone = seller.mobile || seller.phone || '';
      this.contactData.email = seller.email || '';
    } else {
      // If neither is logged in, redirect to appropriate login
      this.router.navigate(['/seller/login']);
    }

    // Default sample image for immediate preview satisfaction
    this.uploadedImages.set([
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ]);
  }

  async loadDynamicCategories(): Promise<void> {
    // Dynamic categories fallback to predefined categories
  }

  private getCategoryIcon(slug: string): string {
    if (slug.includes('plot') || slug.includes('land')) {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
    } else if (slug.includes('villa') || slug.includes('estate')) {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
    } else if (slug.includes('apartment') || slug.includes('flat')) {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="15" y1="22" x2="15" y2="2"></line></svg>`;
    } else if (slug.includes('house')) {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    } else if (slug.includes('commercial')) {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
    } else if (slug.includes('farm')) {
      return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    }
    return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`;
  }

  dashboardRoute(): string {
    return this.isDealer() ? '/dealer/dashboard' : '/seller/dashboard';
  }

  myPropertiesRoute(): string {
    return this.isDealer() ? '/dealer/my-properties' : '/seller/my-properties';
  }

  getCategoryName(id: string): string {
    const found = this.categories.find(c => c.id === id);
    return found ? found.name : 'Plots & Land';
  }

  selectCategory(catId: string): void {
    this.selectedCategory.set(catId);
    this.currentStep.set(2);
    // Tailor default sub-type
    if (catId === 'plots-land') this.formData.type = 'DTCP Approved Plot';
    else if (catId === 'villas-estates') this.formData.type = 'Luxury Villa';
    else if (catId === 'apartments') this.formData.type = 'Gated Sky Apartment';
    else if (catId === 'commercial-spaces') this.formData.type = 'Grade-A Commercial Space';
    else if (catId === 'farm-lands') this.formData.type = 'Managed Farm Land';
    else this.formData.type = 'Platinum Residential';
  }

  changeCategory(): void {
    this.currentStep.set(1);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const validFiles = files.filter(f => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      this.errorMessage.set('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    const currentImages = [...this.uploadedImages()];

    for (const file of validFiles) {
      if (currentImages.length >= 4) {
        this.errorMessage.set('Maximum 4 images allowed. Exactly 1 to 4 photos are permitted.');
        break;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && this.uploadedImages().length < 4) {
          this.uploadedImages.update(imgs => [...imgs, result]);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  replacePhoto(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        this.uploadedImages.update(imgs => {
          const updated = [...imgs];
          updated[index] = result;
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number): void {
    this.uploadedImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  addSamplePhotos(): void {
    const samples = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ];
    this.uploadedImages.update(imgs => {
      const combined = [...imgs];
      for (const s of samples) {
        if (combined.length < 4 && !combined.includes(s)) {
          combined.push(s);
        }
      }
      return combined;
    });
  }

  async submitProperty(): Promise<void> {
    this.errorMessage.set(null);

    // Validate images (Strictly Min 1, Max 4)
    const images = this.uploadedImages();
    if (images.length < 1) {
      this.errorMessage.set('Please upload at least 1 property photograph.');
      return;
    }
    if (images.length > 4) {
      this.errorMessage.set('Maximum 4 photographs allowed. Do not upload more than 4 images.');
      return;
    }

    // Validate common fields
    const { title, price, area, address, city, locality, landmark, description } = this.formData;
    if (!title || !price || !area || !address || !city || !locality || !landmark || !description) {
      this.errorMessage.set('Please fill in all common property details.');
      return;
    }

    // Determine current user
    const dealer = this.authService.currentDealer();
    const seller = this.authService.currentSeller();

    let ownerId = '';
    let ownerRole: 'seller' | 'dealer' = 'seller';

    if (dealer) {
      ownerId = dealer.id;
      ownerRole = 'dealer';
    } else if (seller) {
      ownerId = seller.id;
      ownerRole = 'seller';
    } else {
      this.errorMessage.set('User session expired. Please log in again.');
      return;
    }

    this.isSubmitting.set(true);

    const cat = this.selectedCategory();
    const amenitiesList = this.specs.amenitiesText
      ? this.specs.amenitiesText.split(',').map(s => s.trim()).filter(Boolean)
      : ['24/7 Security', 'Verified Title', 'Gated Community'];


    const newProperty: Omit<Property, 'id'> & { id?: string } = {
      id: 'prop_' + Date.now(),
      title: this.formData.title,
      price: this.formData.price,
      location: `${this.formData.locality}, ${this.formData.city}`,
      type: this.formData.type,
      category: cat,
      // ALWAYS Platinum Plan
      tier: 'platinum',
      imageUrl: images[0],
      galleryImages: images,
      specs: {
        ...this.specs,
        bhk: this.specs.bhk,
        bedrooms: this.specs.bedrooms,
        bathrooms: this.specs.bathrooms,
        area: this.formData.area,
        plotSize: this.specs.plotSize || this.formData.area,
        builtUpArea: this.specs.builtUpArea || this.formData.area,
        facing: this.specs.facing,
        amenities: amenitiesList
      },
      dealer: {
        name: this.contactData.name || 'Verified Partner',
        phone: this.contactData.phone || '+91 98450 00000',
        email: this.contactData.email || 'partner@acresbazaar.com'
      },
      description: this.formData.description,
      address: `${this.formData.address}, ${this.formData.locality}, ${this.formData.city}`,
      submissionDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      submissionStatus: 'PENDING',
      ownerId: ownerId,
      ownerRole: ownerRole
    };

    const saved = this.propertyService.addCustomProperty(newProperty as any);

    // Live sync to NestJS REST API backend
    const categoryName = this.getCategoryName(cat);
    const cleanPrice = parseFloat(String(this.formData.price).replace(/[^0-9.]/g, '')) || 0;
    try {
      const res = await fetch('http://localhost:5001/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: this.formData.title.trim(),
            category: categoryName,
            location: `${this.formData.locality}, ${this.formData.city}`,
            city: this.formData.city.trim(),
            price: cleanPrice,
            priceDisplay: this.formData.price.startsWith('₹') || this.formData.price.startsWith('$') ? this.formData.price : `₹${cleanPrice.toLocaleString('en-IN')}`,
            description: this.formData.description.trim(),
            status: 'PENDING',
            planType: 'PLATINUM',
            sellerId: ownerId,
            sellerName: this.contactData.name || (dealer ? (dealer.businessName || dealer.fullName) : 'Seller'),
            sellerPhone: this.contactData.phone || '',
            sellerEmail: this.contactData.email || '',
            sellerRole: ownerRole.toUpperCase(),
            dealerCompany: dealer ? (dealer.businessName || dealer.fullName || '') : '',
            categorySpecs: {
              ...this.specs,
              bhk: this.specs.bhk,
              bedrooms: this.specs.bedrooms,
              bathrooms: this.specs.bathrooms,
              area: this.formData.area,
              plotSize: this.specs.plotSize || this.formData.area,
              builtUpArea: this.specs.builtUpArea || this.formData.area,
              facing: this.specs.facing,
              amenities: amenitiesList
            },
            images
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.property?.id) {
            newProperty.id = resData.property.id;
          }
        }
      } catch (e) {
        console.warn('Backend sync warning:', e);
      }

      // Also save to seller local storage cache
      try {
        const sellerPropItem = {
          property_id: newProperty.id || ('prop_' + Date.now()),
          id: newProperty.id || ('prop_' + Date.now()),
          title: this.formData.title.trim(),
          category: cat,
          plan: 'PLATINUM',
          price: cleanPrice,
          priceDisplay: this.formData.price.startsWith('₹') || this.formData.price.startsWith('$') ? this.formData.price : `₹${cleanPrice.toLocaleString('en-IN')}`,
          location: `${this.formData.locality}, ${this.formData.city}`,
          city: this.formData.city.trim(),
          locality: this.formData.locality.trim(),
          full_address: `${this.formData.address}, ${this.formData.locality}, ${this.formData.city}`,
          status: 'PENDING',
          created_at: new Date().toISOString(),
          image_urls: images.slice(0, 1),
          category_specs: { ...this.specs },
          seller_id: ownerId,
          seller_name: this.contactData.name || 'Seller',
          seller_phone: this.contactData.phone || '',
          seller_email: this.contactData.email || ''
        };
        const stored = localStorage.getItem('aura_seller_properties');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(sellerPropItem);
        localStorage.setItem('aura_seller_properties', JSON.stringify(list));
      } catch {}

      this.isSubmitting.set(false);

    if (saved && saved.id) {
      this.successMessage.set(
        `Property submitted successfully. It is currently PENDING admin review (${categoryName}).`
      );
      setTimeout(() => {
        this.router.navigateByUrl(this.myPropertiesRoute());
      }, 1200);
    } else {
      this.errorMessage.set('Failed to save property. Please try again.');
    }
  }
}

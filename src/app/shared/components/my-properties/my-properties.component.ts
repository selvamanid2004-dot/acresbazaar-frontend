import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="my-props-container">
      <!-- Top Navigation & Header -->
      <div class="top-nav">
        <a [routerLink]="dashboardRoute()" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to {{ isDealer() ? 'Dealer' : 'Seller' }} Dashboard
        </a>
        <a [routerLink]="addPropertyRoute()" class="add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {{ isDealer() ? 'Add Property' : 'Sell Your Property' }}
        </a>
      </div>

      <div class="page-title-section">
        <div class="header-left">
          <div class="role-badge">
            {{ isDealer() ? 'DEALER PORTFOLIO' : 'SELLER LISTINGS' }}
          </div>
          <h1>My Properties</h1>
          <p class="subtitle">Manage submitted properties, update listing details, and monitor Platinum review status.</p>
        </div>

        <div class="filter-tabs">
          <button class="filter-btn" [class.active]="currentFilter() === 'ALL'" (click)="setFilter('ALL')">
            All ({{ properties().length }})
          </button>
          <button class="filter-btn" [class.active]="currentFilter() === 'PENDING'" (click)="setFilter('PENDING')">
            Pending ({{ countByStatus('PENDING') }})
          </button>
          <button class="filter-btn" [class.active]="currentFilter() === 'APPROVED'" (click)="setFilter('APPROVED')">
            Approved ({{ countByStatus('APPROVED') }})
          </button>
          <button class="filter-btn" [class.active]="currentFilter() === 'REJECTED'" (click)="setFilter('REJECTED')">
            Rejected ({{ countByStatus('REJECTED') }})
          </button>
        </div>
      </div>

      <!-- Notification Alert -->
      <div *ngIf="actionSuccessMessage()" class="alert-box success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ actionSuccessMessage() }}</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredProperties().length === 0" class="empty-box">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h3>No properties found</h3>
        <p>You have not submitted any properties matching this filter.</p>
        <a [routerLink]="addPropertyRoute()" class="add-prop-cta">
          + Add New Platinum Property
        </a>
      </div>

      <!-- Properties Table / List -->
      <div *ngIf="filteredProperties().length > 0" class="props-list">
        <div *ngFor="let prop of filteredProperties()" class="prop-row-card">
          <div class="prop-thumb-area">
            <img [src]="prop.imageUrl" [alt]="prop.title" class="prop-row-img" />
            <div class="platinum-badge">PLATINUM</div>
          </div>

          <div class="prop-main-meta">
            <div class="cat-date-line">
              <span class="prop-cat">{{ formatCategory(prop.category) }}</span>
              <span class="dot">•</span>
              <span class="prop-date">Submitted: {{ prop.submissionDate || 'Recently' }}</span>
            </div>

            <h3 class="prop-heading">{{ prop.title }}</h3>

            <div class="prop-loc-line">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ prop.location }}</span>
            </div>

            <div class="prop-specs-tags">
              <span class="tag" *ngIf="prop.specs.bhk">{{ prop.specs.bhk }}</span>
              <span class="tag" *ngIf="prop.specs.area">{{ prop.specs.area }}</span>
              <span class="tag" *ngIf="prop.specs.plotSize">{{ prop.specs.plotSize }}</span>
              <span class="tag" *ngIf="prop.specs.facing">{{ prop.specs.facing }} Facing</span>
            </div>
          </div>

          <div class="prop-status-price-area">
            <div class="price-text">{{ prop.price }}</div>

            <!-- Status Pill -->
            <div class="status-pill" [ngClass]="getStatusClass(prop.submissionStatus)">
              <span class="status-dot"></span>
              {{ prop.submissionStatus || 'PENDING' }}
            </div>

            <div class="action-buttons-group">
              <button type="button" (click)="openEditModal(prop)" class="action-btn edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Property
              </button>

              <a [routerLink]="['/category', prop.category]" class="action-btn view-btn" title="View on Category Page">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View in Category
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ==============================================
           EDIT PROPERTY MODAL
      =============================================== -->
      <div *ngIf="editingProperty()" class="modal-overlay" (click)="closeEditModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>Edit Property Details</h3>
              <p class="modal-sub">Update price, description, category, location or specifications</p>
            </div>
            <button type="button" class="close-modal-btn" (click)="closeEditModal()">&times;</button>
          </div>

          <form (ngSubmit)="savePropertyEdits()" class="edit-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Property Title</label>
                <input type="text" [(ngModel)]="editFormData.title" name="editTitle" required class="form-input" />
              </div>

              <div class="form-group full-width">
                <label>Property Category (Platinum Plan)</label>
                <select [(ngModel)]="editFormData.category" name="editCategory" class="form-input">
                  <option value="all-residential">All Residential</option>
                  <option value="plots-land">Plots & Land</option>
                  <option value="villas-estates">Villas & Estates</option>
                  <option value="apartments">Apartments / Flats</option>
                  <option value="independent-houses">Independent Houses</option>
                  <option value="commercial-spaces">Commercial Spaces</option>
                  <option value="farm-lands">Farm Lands</option>
                </select>
              </div>

              <div class="form-group">
                <label>Property Price</label>
                <input type="text" [(ngModel)]="editFormData.price" name="editPrice" required class="form-input" />
              </div>

              <div class="form-group">
                <label>Location / Locality</label>
                <input type="text" [(ngModel)]="editFormData.location" name="editLocation" required class="form-input" />
              </div>

              <div class="form-group">
                <label>Size / Area</label>
                <input type="text" [(ngModel)]="editFormData.area" name="editArea" class="form-input" />
              </div>

              <div class="form-group">
                <label>Facing Direction</label>
                <input type="text" [(ngModel)]="editFormData.facing" name="editFacing" class="form-input" />
              </div>

              <div class="form-group full-width">
                <label>Full Address</label>
                <input type="text" [(ngModel)]="editFormData.address" name="editAddress" class="form-input" />
              </div>

              <div class="form-group full-width">
                <label>Description</label>
                <textarea rows="4" [(ngModel)]="editFormData.description" name="editDescription" class="form-textarea"></textarea>
              </div>

              <div class="form-group full-width">
                <label>Primary Image URL</label>
                <input type="text" [(ngModel)]="editFormData.imageUrl" name="editImageUrl" class="form-input" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="cancel-btn" (click)="closeEditModal()">Cancel</button>
              <button type="submit" class="save-btn" [disabled]="isSavingEdits()">
                <span *ngIf="!isSavingEdits()">Save Property Changes</span>
                <span *ngIf="isSavingEdits()">Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-props-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 36px 20px 80px 20px;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #F8FAFC;
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
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

    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
      transition: all 0.2s;
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 26px rgba(212, 175, 55, 0.35);
    }

    .page-title-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .role-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      color: #D4AF37;
      background: rgba(212, 175, 55, 0.1);
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 8px;
      letter-spacing: 0.06em;
    }

    h1 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 6px 0;
    }

    .subtitle {
      font-size: 0.92rem;
      color: #94A3B8;
      margin: 0;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      background: #15202B;
      border: 1px solid #1E2D3D;
      padding: 4px;
      border-radius: 12px;
    }

    .filter-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn.active {
      background: #1E2D3D;
      color: #D4AF37;
    }

    .alert-box.success {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86EFAC;
      padding: 12px 18px;
      border-radius: 12px;
      margin-bottom: 24px;
      font-size: 0.9rem;
    }

    .empty-box {
      text-align: center;
      padding: 60px 20px;
      background: #15202B;
      border: 1px dashed #243447;
      border-radius: 20px;
    }

    .empty-icon {
      color: #475569;
      margin-bottom: 16px;
    }

    .empty-box h3 {
      font-size: 1.3rem;
      margin: 0 0 8px 0;
    }

    .empty-box p {
      font-size: 0.92rem;
      color: #94A3B8;
      margin: 0 0 22px 0;
    }

    .add-prop-cta {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      border-radius: 10px;
    }

    .props-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .prop-row-card {
      background: #15202B;
      border: 1px solid #1E2D3D;
      border-radius: 18px;
      padding: 20px;
      display: flex;
      gap: 22px;
      align-items: center;
      transition: all 0.2s;
    }

    .prop-row-card:hover {
      border-color: rgba(212, 175, 55, 0.35);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .prop-thumb-area {
      position: relative;
      width: 180px;
      height: 125px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      background: #0B1118;
    }

    .prop-row-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .platinum-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .prop-main-meta {
      flex: 1;
      min-width: 220px;
    }

    .cat-date-line {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.76rem;
      color: #94A3B8;
      margin-bottom: 6px;
    }

    .prop-cat {
      color: #D4AF37;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dot {
      color: #475569;
    }

    .prop-heading {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #FFFFFF;
      line-height: 1.3;
    }

    .prop-loc-line {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: #94A3B8;
      margin-bottom: 10px;
    }

    .prop-specs-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag {
      background: #0B1118;
      border: 1px solid #243447;
      color: #CBD5E1;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .prop-status-price-area {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      flex-shrink: 0;
    }

    .price-text {
      font-size: 1.35rem;
      font-weight: 800;
      color: #D4AF37;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .status-pill.pending {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #FBBF24;
    }
    .status-pill.pending .status-dot {
      background: #FBBF24;
    }

    .status-pill.approved {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      color: #86EFAC;
    }
    .status-pill.approved .status-dot {
      background: #22C55E;
    }

    .status-pill.draft {
      background: rgba(148, 163, 184, 0.12);
      border: 1px solid rgba(148, 163, 184, 0.35);
      color: #CBD5E1;
    }
    .status-pill.draft .status-dot {
      background: #94A3B8;
    }

    .status-pill.rejected {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #FCA5A5;
    }
    .status-pill.rejected .status-dot {
      background: #EF4444;
    }

    .action-buttons-group {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }

    .edit-btn {
      background: #1E2D3D;
      border: 1px solid #243447;
      color: #F8FAFC;
    }

    .edit-btn:hover {
      background: #243447;
      color: #D4AF37;
      border-color: #D4AF37;
    }

    .view-btn {
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.25);
      color: #D4AF37;
    }

    .view-btn:hover {
      background: rgba(212, 175, 55, 0.2);
    }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    .modal-box {
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      background: #15202B;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid #1E2D3D;
    }

    .modal-header h3 {
      font-size: 1.3rem;
      margin: 0 0 4px 0;
    }

    .modal-sub {
      font-size: 0.85rem;
      color: #94A3B8;
      margin: 0;
    }

    .close-modal-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      font-size: 1.6rem;
      cursor: pointer;
      line-height: 1;
    }

    .close-modal-btn:hover {
      color: #FFFFFF;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .full-width {
      grid-column: span 2;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #CBD5E1;
    }

    .form-input, .form-textarea {
      width: 100%;
      background: #0B1118;
      border: 1.5px solid #243447;
      border-radius: 8px;
      color: #F8FAFC;
      font-size: 0.9rem;
      padding: 10px 14px;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
    }

    .form-input:focus, .form-textarea:focus {
      border-color: #D4AF37;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-btn {
      background: #1E2D3D;
      color: #94A3B8;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .save-btn {
      background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
      color: #0B1118;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .admin-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .admin-btn {
      padding: 5px 10px;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .approve-btn {
      background: rgba(34, 197, 94, 0.2);
      color: #4ADE80;
      border: 1px solid rgba(34, 197, 94, 0.4);
    }

    .approve-btn:hover {
      background: rgba(34, 197, 94, 0.35);
    }

    .reject-btn {
      background: rgba(239, 68, 68, 0.2);
      color: #F87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .reject-btn:hover {
      background: rgba(239, 68, 68, 0.35);
    }

    .reset-btn {
      background: rgba(234, 179, 8, 0.2);
      color: #FACC15;
      border: 1px solid rgba(234, 179, 8, 0.4);
    }

    .reset-btn:hover {
      background: rgba(234, 179, 8, 0.35);
    }

    @media (max-width: 768px) {
      .prop-row-card {
        flex-direction: column;
        align-items: stretch;
      }
      .prop-thumb-area {
        width: 100%;
        height: 180px;
      }
      .prop-status-price-area {
        align-items: flex-start;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
      .full-width {
        grid-column: span 1;
      }
    }
  `]
})
export class MyPropertiesComponent implements OnInit {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isDealer = signal<boolean>(false);
  ownerId = signal<string>('');
  properties = signal<Property[]>([]);
  currentFilter = signal<string>('ALL');

  editingProperty = signal<Property | null>(null);
  isSavingEdits = signal<boolean>(false);
  actionSuccessMessage = signal<string | null>(null);

  editFormData = {
    id: '',
    title: '',
    category: '',
    price: '',
    location: '',
    area: '',
    facing: '',
    address: '',
    description: '',
    imageUrl: ''
  };

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const dealer = this.authService.currentDealer();
    const seller = this.authService.currentSeller();

    if (dealer) {
      this.isDealer.set(true);
      this.ownerId.set(dealer.id);
    } else if (seller) {
      this.isDealer.set(false);
      this.ownerId.set(seller.id);
    } else {
      this.router.navigate(['/seller/login']);
      return;
    }

    this.loadProperties();

    // Check if URL asked to edit a property directly: :id or ?edit=<id>
    const editId = this.route.snapshot.params['id'] || this.route.snapshot.queryParams['edit'];
    if (editId) {
      setTimeout(() => {
        const target = this.properties().find(p => p.id === editId);
        if (target) {
          this.openEditModal(target);
        }
      }, 200);
    }
  }

  async loadProperties(): Promise<void> {
    let list = this.propertyService.getPropertiesByOwner(this.ownerId());
    this.properties.set(list);
  }

  dashboardRoute(): string {
    return this.isDealer() ? '/dealer/dashboard' : '/seller/dashboard';
  }

  addPropertyRoute(): string {
    return this.isDealer() ? '/dealer/add-property' : '/seller/add-property';
  }

  setFilter(filter: string): void {
    this.currentFilter.set(filter);
  }

  countByStatus(status: string): number {
    return this.properties().filter(p => {
      const s = (p.submissionStatus || 'PENDING').toUpperCase();
      if (status === 'PENDING') return s === 'PENDING' || s === 'PENDING VERIFICATION';
      return s === status.toUpperCase();
    }).length;
  }

  filteredProperties(): Property[] {
    const f = this.currentFilter().toUpperCase();
    if (f === 'ALL') return this.properties();
    return this.properties().filter(p => {
      const s = (p.submissionStatus || 'PENDING').toUpperCase();
      if (f === 'PENDING') return s === 'PENDING' || s === 'PENDING VERIFICATION';
      return s === f;
    });
  }

  getStatusClass(status?: string): string {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'pending';
    if (s.includes('approved')) return 'approved';
    if (s.includes('draft')) return 'draft';
    if (s.includes('rejected')) return 'rejected';
    return 'pending';
  }

  formatCategory(cat: string): string {
    return cat.replace('-', ' & ').toUpperCase();
  }

  openEditModal(prop: Property): void {
    // Security check: cannot edit another owner's property
    if (prop.ownerId && prop.ownerId !== this.ownerId()) {
      alert('Security Alert: You can only edit your own listings.');
      return;
    }

    this.editingProperty.set(prop);
    this.editFormData = {
      id: prop.id,
      title: prop.title,
      category: prop.category || 'all-residential',
      price: String(prop.price || ''),
      location: prop.location,
      area: prop.specs.area || prop.specs.builtUpArea || '',
      facing: prop.specs.facing || '',
      address: prop.address || prop.location,
      description: prop.description || prop.shortDescription || '',
      imageUrl: prop.imageUrl
    };
  }

  closeEditModal(): void {
    this.editingProperty.set(null);
  }

  async updateStatus(prop: Property, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<void> {
    const updated: Property = {
      ...prop,
      submissionStatus: newStatus
    };
    this.propertyService.updateCustomProperty(updated);
    this.loadProperties();
    this.actionSuccessMessage.set(
      `Status updated to ${newStatus}. ${newStatus === 'APPROVED' ? 'Property is now LIVE on the Platinum Plan category page!' : ''}`
    );
    setTimeout(() => this.actionSuccessMessage.set(null), 4000);
  }

  async savePropertyEdits(): Promise<void> {
    const prop = this.editingProperty();
    if (!prop) return;

    this.isSavingEdits.set(true);
    const targetCategory = this.editFormData.category || prop.category;

    const updated: Property = {
      ...prop,
      title: this.editFormData.title,
      category: targetCategory,
      // Maintain Platinum Plan
      tier: 'platinum',
      price: this.editFormData.price,
      location: this.editFormData.location,
      description: this.editFormData.description,
      address: this.editFormData.address,
      imageUrl: this.editFormData.imageUrl,
      specs: {
        ...prop.specs,
        area: this.editFormData.area,
        facing: this.editFormData.facing
      }
    };

    this.propertyService.updateCustomProperty(updated);
    this.isSavingEdits.set(false);
    this.actionSuccessMessage.set(`Changes saved! Property category updated to Platinum → ${this.formatCategory(targetCategory)}.`);
    this.closeEditModal();
    this.loadProperties();
    setTimeout(() => this.actionSuccessMessage.set(null), 4000);
  }
}

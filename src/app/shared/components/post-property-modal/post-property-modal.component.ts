import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-post-property-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <div class="header-left">
            <span class="modal-badge">Direct Listing Portal</span>
            <h2 class="modal-title">Post Your Property (Free)</h2>
          </div>
          <button type="button" class="close-btn" (click)="close()" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="post-form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            
            <div class="form-group full-col">
              <label class="form-label">I am an:</label>
              <div class="role-selector">
                <button 
                  type="button" 
                  class="role-btn" 
                  [class.active]="formData.role === 'Owner'" 
                  (click)="formData.role = 'Owner'">
                  Individual Owner
                </button>
                <button 
                  type="button" 
                  class="role-btn" 
                  [class.active]="formData.role === 'Dealer'" 
                  (click)="formData.role = 'Dealer'">
                  Authorized Dealer / Broker
                </button>
                <button 
                  type="button" 
                  class="role-btn" 
                  [class.active]="formData.role === 'Developer'" 
                  (click)="formData.role = 'Developer'">
                  Builder / Developer
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="post-prop-type" class="form-label">Property Type</label>
              <select id="post-prop-type" class="form-input" [(ngModel)]="formData.propertyType" name="propertyType">
                <option value="plot">Residential / Commercial Plot</option>
                <option value="villa">Luxury Villa / House</option>
                <option value="apartment">Apartment / Flat</option>
                <option value="commercial">Commercial Space</option>
              </select>
            </div>

            <div class="form-group">
              <label for="post-listing-type" class="form-label">You want to:</label>
              <select id="post-listing-type" class="form-input" [(ngModel)]="formData.listingType" name="listingType">
                <option value="sell">Sell Property</option>
                <option value="rent">Rent / Lease Property</option>
              </select>
            </div>

            <div class="form-group full-col">
              <label for="post-prop-title" class="form-label">Project / Property Title</label>
              <input 
                id="post-prop-title"
                type="text" 
                class="form-input" 
                placeholder="e.g. 4 BHK Luxury Villa at Green Valley" 
                [(ngModel)]="formData.title" 
                name="title" 
                required />
            </div>

            <div class="form-group">
              <label for="post-city" class="form-label">City / Region</label>
              <input 
                id="post-city"
                type="text" 
                class="form-input" 
                placeholder="e.g. Austin, Miami, Seattle" 
                [(ngModel)]="formData.city" 
                name="city" 
                required />
            </div>

            <div class="form-group">
              <label for="post-price" class="form-label">Expected Price ($)</label>
              <input 
                id="post-price"
                type="text" 
                class="form-input" 
                placeholder="e.g. $1,250,000" 
                [(ngModel)]="formData.price" 
                name="price" 
                required />
            </div>

            <div class="form-group full-col">
              <label for="post-contact" class="form-label">Contact Phone / WhatsApp</label>
              <input 
                id="post-contact"
                type="tel" 
                class="form-input" 
                placeholder="+1 (555) 019-2834" 
                [(ngModel)]="formData.contact" 
                name="contact" 
                required />
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="close()">
              Cancel
            </button>
            <button type="submit" class="btn btn-gold btn-submit">
              Submit Free Listing
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 13, 30, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9992;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: var(--white);
      border-radius: var(--radius-xl);
      max-width: 600px;
      width: 100%;
      box-shadow: var(--shadow-xl);
      border: 1.5px solid var(--slate-200);
      overflow: hidden;
      animation: popUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.75rem 2rem;
      border-bottom: 1px solid var(--slate-100);
      background: var(--slate-50);
    }

    .modal-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gold-600);
      margin-bottom: 0.25rem;
      display: block;
    }

    .modal-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--navy-950);
    }

    .close-btn {
      color: var(--slate-400);
      padding: 0.25rem;
      transition: color var(--transition-fast);
    }

    .close-btn:hover {
      color: var(--navy-950);
    }

    .post-form {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .full-col {
      grid-column: 1 / -1;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--navy-900);
      margin-bottom: 0.45rem;
      display: block;
    }

    .form-input {
      width: 100%;
      height: 48px;
      padding: 0 1rem;
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--navy-950);
      background: var(--slate-50);
      border: 1.5px solid var(--slate-200);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--gold-500);
      background: var(--white);
      box-shadow: 0 0 0 3px var(--gold-light);
    }

    .role-selector {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .role-btn {
      flex: 1;
      padding: 0.6rem 0.85rem;
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--slate-200);
      color: var(--slate-700);
      background: var(--slate-50);
      transition: all var(--transition-fast);
    }

    .role-btn.active {
      background: var(--navy-950);
      color: var(--white);
      border-color: var(--navy-950);
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--slate-100);
    }

    .btn-submit {
      padding: 0.75rem 1.75rem;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .role-selector {
        flex-direction: column;
      }
    }
  `]
})
export class PostPropertyModalComponent {
  notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();

  formData = {
    role: 'Owner',
    propertyType: 'plot',
    listingType: 'sell',
    title: '',
    city: '',
    price: '',
    contact: ''
  };

  close() {
    this.closeRequested.emit();
  }

  onSubmit() {
    this.notificationService.show(
      'Listing Submitted!',
      'Your property listing has been queued for verification. A relationship manager will verify your documents.',
      'success'
    );
    this.close();
  }
}

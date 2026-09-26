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
  templateUrl: './my-properties.component.html',
  styleUrl: './my-properties.component.css'
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

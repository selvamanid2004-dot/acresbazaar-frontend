import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models/property.model';
import { NotificationService } from '../../services/notification.service';

export type DealerStep = 'intent' | 'buy-categories' | 'buy-listings' | 'sell-form';

@Component({
  selector: 'app-dealer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dealer-modal.component.html',
  styleUrl: './dealer-modal.component.css'
})
export class DealerModalComponent {
  propertyService = inject(PropertyService);
  notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();
  @Output() propertySelected = new EventEmitter<Property>();

  step: DealerStep = 'intent';
  selectedCategory: string = 'Residential';
  currentListings: Property[] = [];

  dealerBuyCategories = [
    { name: 'Residential', icon: 'home', desc: 'Villas, townhouses & family residences' },
    { name: 'Commercial', icon: 'briefcase', desc: 'Office spaces, tech parks & retail' },
    { name: 'Plots / Land', icon: 'map', desc: 'Township plots, farmlands & acres' },
    { name: 'Apartments', icon: 'building', desc: 'High-rise, skyline penthouses & flats' },
    { name: 'Villas', icon: 'castle', desc: 'Bespoke independent luxury estates' },
    { name: 'Independent Houses', icon: 'home', desc: 'Craftsman duplexes & standalone homes' },
    { name: 'Projects', icon: 'sparkles', desc: 'RERA approved newly launched developments' }
  ];

  sellFormData = {
    propertyType: 'Apartment',
    location: '',
    title: '',
    price: '',
    area: '',
    bedrooms: '3',
    description: '',
    contact: '',
    imagesUploaded: 0
  };

  chooseIntent(intent: 'buy' | 'sell') {
    if (intent === 'buy') {
      this.step = 'buy-categories';
    } else {
      this.step = 'sell-form';
    }
  }

  selectBuyCategory(catName: string) {
    this.selectedCategory = catName;
    this.currentListings = this.propertyService.getPropertiesByCategory(catName);
    this.step = 'buy-listings';
  }

  handleBack() {
    if (this.step === 'buy-listings') {
      this.step = 'buy-categories';
    } else if (this.step === 'buy-categories' || this.step === 'sell-form') {
      this.step = 'intent';
    }
  }

  close() {
    this.step = 'intent';
    this.closeRequested.emit();
  }

  onViewProperty(prop: Property) {
    this.propertySelected.emit(prop);
  }

  onUploadClick() {
    this.sellFormData.imagesUploaded = 4;
    this.notificationService.show('Images Selected', '4 high-resolution photos staged for upload.', 'info');
  }

  onSubmitListing() {
    this.notificationService.show(
      'Dealer Listing Submitted!',
      `Your listing for "${this.sellFormData.title || 'the property'}" has been published to the dealer network.`,
      'gold'
    );
    this.close();
  }
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertySpecs } from '../../../core/models/property.model';
import { getApiBaseUrl } from '../../../core/services/api-config';

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
  templateUrl: './property-post.component.html',
  styleUrl: './property-post.component.css'
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
      const res = await fetch(`${getApiBaseUrl()}/properties`, {
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

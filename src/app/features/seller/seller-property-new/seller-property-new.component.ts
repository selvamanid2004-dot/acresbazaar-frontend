import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

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
  templateUrl: './seller-property-new.component.html',
  styleUrl: './seller-property-new.component.css'
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
        const response = await fetch(`${getApiBaseUrl()}/properties`, {
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

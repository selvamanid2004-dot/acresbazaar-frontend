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
  templateUrl: './snap-property-upload.component.html',
  styleUrl: './snap-property-upload.component.css'
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

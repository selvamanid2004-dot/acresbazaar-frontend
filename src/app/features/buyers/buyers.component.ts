import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { NavStateService } from '../../core/services/nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-buyers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyers.component.html',
  styleUrl: './buyers.component.css'
})
export class BuyersComponent implements OnInit {
  propertyService = inject(PropertyService);
  navStateService = inject(NavStateService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);

  @Output() propertySelected = new EventEmitter<Property>();

  // All 7 Dedicated Categories
  buyerCategories = [
    { 
      name: 'All Residential', 
      slug: 'all-residential', 
      count: '4,970+ Units',
      description: 'Apartments, private duplexes, and luxury residential estates.',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Plots', 
      slug: 'plots', 
      count: '1,250+ Plots',
      description: 'Clear-title residential and commercial development parcels.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Villas', 
      slug: 'villas', 
      count: '890+ Villas',
      description: 'Gated community villas and independent luxury trophy estates.',
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Apartments / Flats', 
      slug: 'apartments', 
      count: '3,120+ Flats',
      description: 'High-rise condominiums, penthouses, and modern city flats.',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Independent Houses', 
      slug: 'independent-houses', 
      count: '960+ Houses',
      description: 'Standalone multi-story homes, duplexes, and private bungalows.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Commercial Spaces', 
      slug: 'commercial', 
      count: '780+ Spaces',
      description: 'High-yield corporate offices, retail showrooms, and plazas.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Farm Lands', 
      slug: 'farm-lands', 
      count: '420+ Acres',
      description: 'Fertile agro-estates, organic farming parcels, and ranches.',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    }
  ];

  previewProperties: Property[] = [];

  ngOnInit() {
    // Select sample properties from both Gold and Platinum across categories
    const all = this.propertyService.getAllProperties();
    const goldSample = all.filter(p => p.tier === 'gold').slice(0, 3);
    const platSample = all.filter(p => p.tier === 'platinum' || p.tier === 'premium').slice(0, 3);
    this.previewProperties = [...goldSample, ...platSample];
  }

  onOpenCategory(slug: string) {
    this.router.navigate(['/buyers', slug]);
  }

  onOpenCategoryPlan(slug: string, plan: 'gold' | 'platinum') {
    this.router.navigate(['/buyers', slug, plan]);
  }

  onUnlockProperty(prop: Property) {
    const tier: 'gold' | 'platinum' = prop.tier === 'gold' ? 'gold' : 'platinum';
    if (tier === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onRequestAdvisor() {
    this.notificationService.show(
      'Advisor Requested',
      'A personal buyer advisor will reach out to understand your specifications within 2 business hours.',
      'gold'
    );
  }

  onBackToHome() {
    this.router.navigate(['/']);
  }
}

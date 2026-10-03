import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public-layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';
import { CategoryPageComponent } from './features/category-page/category-page.component';
import { authGuard } from './core/guards/auth.guard';
import { sellerGuard } from './core/guards/seller.guard';
import { dealerGuard } from './core/guards/dealer.guard';
import { partnerGuard } from './core/guards/partner.guard';

export const routes: Routes = [
  // =========================================================================
  // PUBLIC WEBSITE ROUTE TREE (WITH LAZY CODE SPLITTING FOR ULTRA-FAST LOAD)
  // =========================================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },

      // Snap Property Module (Community Partner / Spotters)
      { path: 'snap-property', redirectTo: 'snap-property/dashboard', pathMatch: 'full' },
      { 
        path: 'snap-property/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'SPOTTER' }
      },
      { 
        path: 'snap-property/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'SPOTTER' }
      },
      { 
        path: 'snap-property/dashboard', 
        loadComponent: () => import('./features/snap-property/snap-property-dashboard/snap-property-dashboard.component').then(m => m.SnapPropertyDashboardComponent),
        canActivate: [partnerGuard]
      },
      { 
        path: 'snap-property/upload', 
        loadComponent: () => import('./features/snap-property/snap-property-upload/snap-property-upload.component').then(m => m.SnapPropertyUploadComponent),
        canActivate: [partnerGuard]
      },

      // Partner Dedicated URL Aliases (Protected by partnerGuard)
      { path: 'partner', redirectTo: 'partner/dashboard', pathMatch: 'full' },
      { 
        path: 'partner/dashboard', 
        loadComponent: () => import('./features/snap-property/snap-property-dashboard/snap-property-dashboard.component').then(m => m.SnapPropertyDashboardComponent),
        canActivate: [partnerGuard]
      },
      { 
        path: 'partner/upload', 
        loadComponent: () => import('./features/snap-property/snap-property-upload/snap-property-upload.component').then(m => m.SnapPropertyUploadComponent),
        canActivate: [partnerGuard]
      },
      { 
        path: 'partner/properties', 
        loadComponent: () => import('./features/snap-property/snap-property-dashboard/snap-property-dashboard.component').then(m => m.SnapPropertyDashboardComponent),
        canActivate: [partnerGuard]
      },
      { 
        path: 'partner/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'SPOTTER' }
      },
      { 
        path: 'partner/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'SPOTTER' }
      },

      // Unified Authentication Routes - Buyers, Sellers, Dealers, Spotters
      { 
        path: 'login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'BUYER' }
      },
      { 
        path: 'buyers/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'BUYER' }
      },
      { 
        path: 'sellers/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'SELLER' }
      },
      { 
        path: 'dealers/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'DEALER' }
      },
      { 
        path: 'spotters/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'SPOTTER' }
      },

      // Registration Routes
      { 
        path: 'register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'BUYER' }
      },
      { 
        path: 'register/buyer', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'BUYER' }
      },
      { 
        path: 'register/common', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent), 
        data: { role: 'SPOTTER' } 
      },
      { 
        path: 'register/seller', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'SELLER' }
      },
      { 
        path: 'register/dealer', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'DEALER' }
      },
      { 
        path: 'buyers/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'BUYER' }
      },
      { 
        path: 'sellers/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'SELLER' }
      },
      { 
        path: 'dealers/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'DEALER' }
      },
      { 
        path: 'spotters/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'SPOTTER' }
      },
      { 
        path: 'forgot-password', 
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) 
      },

      // Seller Routes
      { path: 'seller', redirectTo: 'seller/categories', pathMatch: 'full' },
      { 
        path: 'seller/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'SELLER' }
      },
      { 
        path: 'seller/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'SELLER' }
      },
      { 
        path: 'seller/categories', 
        loadComponent: () => import('./features/seller/seller-categories/seller-categories.component').then(m => m.SellerCategoriesComponent), 
        canActivate: [sellerGuard] 
      },
      { 
        path: 'seller/property/new', 
        loadComponent: () => import('./features/seller/seller-property-new/seller-property-new.component').then(m => m.SellerPropertyNewComponent), 
        canActivate: [sellerGuard] 
      },
      { 
        path: 'seller/properties', 
        loadComponent: () => import('./features/seller/seller-properties/seller-properties.component').then(m => m.SellerPropertiesComponent), 
        canActivate: [sellerGuard] 
      },
      { path: 'seller/dashboard', redirectTo: 'seller/categories', pathMatch: 'full' },
      { path: 'seller/add-property', redirectTo: 'seller/categories', pathMatch: 'full' },
      { path: 'seller/my-properties', redirectTo: 'seller/properties', pathMatch: 'full' },
      { 
        path: 'seller/property/:id/edit', 
        loadComponent: () => import('./shared/components/my-properties/my-properties.component').then(m => m.MyPropertiesComponent), 
        canActivate: [sellerGuard] 
      },

      // Dealer Routes
      { 
        path: 'dealer/register', 
        loadComponent: () => import('./features/auth/common-register/common-register.component').then(m => m.CommonRegisterComponent),
        data: { role: 'DEALER' }
      },
      { 
        path: 'dealer/login', 
        loadComponent: () => import('./features/auth/common-login/common-login.component').then(m => m.CommonLoginComponent),
        data: { role: 'DEALER' }
      },
      { 
        path: 'dealer/dashboard', 
        loadComponent: () => import('./features/dealer/dealer-dashboard/dealer-dashboard.component').then(m => m.DealerDashboardComponent), 
        canActivate: [dealerGuard] 
      },
      { 
        path: 'dealer/add-property', 
        loadComponent: () => import('./shared/components/property-post/property-post.component').then(m => m.PropertyPostComponent), 
        canActivate: [dealerGuard] 
      },
      { 
        path: 'dealer/my-properties', 
        loadComponent: () => import('./shared/components/my-properties/my-properties.component').then(m => m.MyPropertiesComponent), 
        canActivate: [dealerGuard] 
      },

      // Membership Plan Routes
      { 
        path: 'plans/gold', 
        loadComponent: () => import('./features/plans/gold-plan/gold-plan.component').then(m => m.GoldPlanComponent), 
        canActivate: [authGuard] 
      },
      { 
        path: 'plans/platinum', 
        loadComponent: () => import('./features/plans/platinum-plan/platinum-plan.component').then(m => m.PlatinumPlanComponent), 
        canActivate: [authGuard] 
      },

      // Standard Category Routes
      { path: 'all-residential', component: CategoryPageComponent, data: { category: 'all-residential' } },
      { path: 'plots', component: CategoryPageComponent, data: { category: 'plots' } },
      { path: 'plots-land', component: CategoryPageComponent, data: { category: 'plots' } },
      { path: 'villas', component: CategoryPageComponent, data: { category: 'villas' } },
      { path: 'villas-estates', component: CategoryPageComponent, data: { category: 'villas' } },
      { path: 'apartments', component: CategoryPageComponent, data: { category: 'apartments' } },
      { path: 'independent-houses', component: CategoryPageComponent, data: { category: 'independent-houses' } },
      { path: 'commercial', component: CategoryPageComponent, data: { category: 'commercial' } },
      { path: 'commercial-spaces', component: CategoryPageComponent, data: { category: 'commercial' } },
      { path: 'farm-lands', component: CategoryPageComponent, data: { category: 'farm-lands' } },
      { path: 'category/:category', component: CategoryPageComponent },

      // Static Content Routes
      { 
        path: 'about', 
        loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) 
      },
      { 
        path: 'services', 
        loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent) 
      },
      { 
        path: 'contact', 
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) 
      },

      // Buyer Dedicated Routes
      { 
        path: 'buyers', 
        loadComponent: () => import('./features/buyers/buyers.component').then(m => m.BuyersComponent) 
      },
      { 
        path: 'buyers/:category', 
        loadComponent: () => import('./features/buyers/buyer-category.component').then(m => m.BuyerCategoryComponent) 
      },
      { 
        path: 'buyers/:category/:tier', 
        loadComponent: () => import('./features/buyers/buyer-category.component').then(m => m.BuyerCategoryComponent) 
      }
    ]
  },

  // Fallback Wildcard
  { path: '**', redirectTo: '' }
];

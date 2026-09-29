import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public-layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';
import { CategoryPageComponent } from './features/category-page/category-page.component';
import { authGuard } from './core/guards/auth.guard';
import { sellerGuard } from './core/guards/seller.guard';
import { dealerGuard } from './core/guards/dealer.guard';

export const routes: Routes = [
  // =========================================================================
  // PUBLIC WEBSITE ROUTE TREE (WITH LAZY CODE SPLITTING FOR ULTRA-FAST LOAD)
  // =========================================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },

      // Snap Property Module (Common People)
      { path: 'snap-property', redirectTo: 'snap-property/dashboard', pathMatch: 'full' },
      { 
        path: 'snap-property/register', 
        loadComponent: () => import('./features/snap-property/snap-property-register/snap-property-register.component').then(m => m.SnapPropertyRegisterComponent) 
      },
      { 
        path: 'snap-property/login', 
        loadComponent: () => import('./features/snap-property/snap-property-login/snap-property-login.component').then(m => m.SnapPropertyLoginComponent) 
      },
      { 
        path: 'snap-property/dashboard', 
        loadComponent: () => import('./features/snap-property/snap-property-dashboard/snap-property-dashboard.component').then(m => m.SnapPropertyDashboardComponent) 
      },
      { 
        path: 'snap-property/upload', 
        loadComponent: () => import('./features/snap-property/snap-property-upload/snap-property-upload.component').then(m => m.SnapPropertyUploadComponent) 
      },

      // Buyer & Community Authentication Routes
      { 
        path: 'login', 
        loadComponent: () => import('./features/auth/buyer-login/buyer-login.component').then(m => m.BuyerLoginComponent) 
      },
      { path: 'register', redirectTo: 'register/buyer', pathMatch: 'full' },
      { 
        path: 'register/buyer', 
        loadComponent: () => import('./features/auth/buyer-register/buyer-register.component').then(m => m.BuyerRegisterComponent) 
      },
      { 
        path: 'register/common', 
        loadComponent: () => import('./features/snap-property/snap-property-register/snap-property-register.component').then(m => m.SnapPropertyRegisterComponent), 
        data: { role: 'COMMON_PEOPLE' } 
      },
      { path: 'register/seller', redirectTo: 'seller/register', pathMatch: 'full' },
      { path: 'register/dealer', redirectTo: 'dealer/register', pathMatch: 'full' },
      { 
        path: 'forgot-password', 
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) 
      },

      // Seller Routes
      { path: 'seller', redirectTo: 'seller/categories', pathMatch: 'full' },
      { 
        path: 'seller/register', 
        loadComponent: () => import('./features/seller/seller-register/seller-register.component').then(m => m.SellerRegisterComponent) 
      },
      { 
        path: 'seller/login', 
        loadComponent: () => import('./features/seller/seller-login/seller-login.component').then(m => m.SellerLoginComponent) 
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
        loadComponent: () => import('./features/dealer/dealer-register/dealer-register.component').then(m => m.DealerRegisterComponent) 
      },
      { 
        path: 'dealer/login', 
        loadComponent: () => import('./features/dealer/dealer-login/dealer-login.component').then(m => m.DealerLoginComponent) 
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

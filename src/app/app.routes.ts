import { Routes } from '@angular/router';

// Public Layout & Pages
import { PublicLayoutComponent } from './features/public-layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';
import { CategoryPageComponent } from './features/category-page/category-page.component';
import { AboutComponent } from './features/about/about.component';
import { ServicesComponent } from './features/services/services.component';
import { ContactComponent } from './features/contact/contact.component';
import { BuyersComponent } from './features/buyers/buyers.component';
import { BuyerCategoryComponent } from './features/buyers/buyer-category.component';
import { BuyerRegisterComponent } from './features/auth/buyer-register/buyer-register.component';
import { BuyerLoginComponent } from './features/auth/buyer-login/buyer-login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { GoldPlanComponent } from './features/plans/gold-plan/gold-plan.component';
import { PlatinumPlanComponent } from './features/plans/platinum-plan/platinum-plan.component';
import { authGuard } from './core/guards/auth.guard';

// Seller Components & Guard
import { SellerRegisterComponent } from './features/seller/seller-register/seller-register.component';
import { SellerLoginComponent } from './features/seller/seller-login/seller-login.component';
import { SellerCategoriesComponent } from './features/seller/seller-categories/seller-categories.component';
import { SellerPropertyNewComponent } from './features/seller/seller-property-new/seller-property-new.component';
import { SellerPropertiesComponent } from './features/seller/seller-properties/seller-properties.component';
import { sellerGuard } from './core/guards/seller.guard';

// Dealer Components & Guard
import { DealerRegisterComponent } from './features/dealer/dealer-register/dealer-register.component';
import { DealerLoginComponent } from './features/dealer/dealer-login/dealer-login.component';
import { DealerDashboardComponent } from './features/dealer/dealer-dashboard/dealer-dashboard.component';
import { dealerGuard } from './core/guards/dealer.guard';

// Shared Property Post & My Properties Components
import { PropertyPostComponent } from './shared/components/property-post/property-post.component';
import { MyPropertiesComponent } from './shared/components/my-properties/my-properties.component';

// Snap Property Module (Common People Spotters)
import { SnapPropertyRegisterComponent } from './features/snap-property/snap-property-register/snap-property-register.component';
import { SnapPropertyLoginComponent } from './features/snap-property/snap-property-login/snap-property-login.component';
import { SnapPropertyUploadComponent } from './features/snap-property/snap-property-upload/snap-property-upload.component';
import { SnapPropertyDashboardComponent } from './features/snap-property/snap-property-dashboard/snap-property-dashboard.component';

export const routes: Routes = [
  // =========================================================================
  // PUBLIC WEBSITE ROUTE TREE (HAS PUBLIC HEADER, FOOTER & MODALS)
  // =========================================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },

      // Snap Property Module (Common People)
      { path: 'snap-property', redirectTo: 'snap-property/dashboard', pathMatch: 'full' },
      { path: 'snap-property/register', component: SnapPropertyRegisterComponent },
      { path: 'snap-property/login', component: SnapPropertyLoginComponent },
      { path: 'snap-property/dashboard', component: SnapPropertyDashboardComponent },
      { path: 'snap-property/upload', component: SnapPropertyUploadComponent },

      // Buyer & Community Authentication Routes
      { path: 'login', component: BuyerLoginComponent },
      { path: 'register', redirectTo: 'register/buyer', pathMatch: 'full' },
      { path: 'register/buyer', component: BuyerRegisterComponent },
      { path: 'register/common', component: SnapPropertyRegisterComponent, data: { role: 'COMMON_PEOPLE' } },
      { path: 'register/seller', redirectTo: 'seller/register', pathMatch: 'full' },
      { path: 'register/dealer', redirectTo: 'dealer/register', pathMatch: 'full' },
      { path: 'forgot-password', component: ForgotPasswordComponent },

      // Seller Routes
      { path: 'seller', redirectTo: 'seller/categories', pathMatch: 'full' },
      { path: 'seller/register', component: SellerRegisterComponent },
      { path: 'seller/login', component: SellerLoginComponent },
      { path: 'seller/categories', component: SellerCategoriesComponent, canActivate: [sellerGuard] },
      { path: 'seller/property/new', component: SellerPropertyNewComponent, canActivate: [sellerGuard] },
      { path: 'seller/properties', component: SellerPropertiesComponent, canActivate: [sellerGuard] },
      { path: 'seller/dashboard', redirectTo: 'seller/categories', pathMatch: 'full' },
      { path: 'seller/add-property', redirectTo: 'seller/categories', pathMatch: 'full' },
      { path: 'seller/my-properties', redirectTo: 'seller/properties', pathMatch: 'full' },
      { path: 'seller/property/:id/edit', component: MyPropertiesComponent, canActivate: [sellerGuard] },

      // Dealer Routes
      { path: 'dealer/register', component: DealerRegisterComponent },
      { path: 'dealer/login', component: DealerLoginComponent },
      { path: 'dealer/dashboard', component: DealerDashboardComponent, canActivate: [dealerGuard] },
      { path: 'dealer/add-property', component: PropertyPostComponent, canActivate: [dealerGuard] },
      { path: 'dealer/my-properties', component: MyPropertiesComponent, canActivate: [dealerGuard] },

      // Membership Plan Routes
      { path: 'plans/gold', component: GoldPlanComponent, canActivate: [authGuard] },
      { path: 'plans/platinum', component: PlatinumPlanComponent, canActivate: [authGuard] },

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
      { path: 'about', component: AboutComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'contact', component: ContactComponent },

      // Buyer Dedicated Routes
      { path: 'buyers', component: BuyersComponent },
      { path: 'buyers/:category', component: BuyerCategoryComponent },
      { path: 'buyers/:category/:tier', component: BuyerCategoryComponent }
    ]
  },

  // Fallback Wildcard
  { path: '**', redirectTo: '' }
];

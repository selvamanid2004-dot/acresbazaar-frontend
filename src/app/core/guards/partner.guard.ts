import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const partnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If active user is a Seller, explicitly block and redirect to Seller dashboard
  if (authService.isSellerAuthenticated()) {
    return router.createUrlTree(['/seller/categories']);
  }

  // If active user is a Dealer, block and redirect to Dealer dashboard
  if (authService.isDealerAuthenticated()) {
    return router.createUrlTree(['/dealer/dashboard']);
  }

  // If active user is a Partner / Spotter, allow access
  if (authService.isSpotterAuthenticated()) {
    return true;
  }

  // Otherwise redirect to Partner login
  return router.createUrlTree(['/snap-property/login'], {
    queryParams: { returnUrl: state.url }
  });
};

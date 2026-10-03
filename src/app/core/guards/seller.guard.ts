import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sellerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If active user is a Partner, redirect to Partner dashboard
  if (authService.isSpotterAuthenticated() && !authService.isSellerAuthenticated()) {
    return router.createUrlTree(['/snap-property/dashboard']);
  }

  // If active user is a Dealer, redirect to Dealer dashboard
  if (authService.isDealerAuthenticated() && !authService.isSellerAuthenticated()) {
    return router.createUrlTree(['/dealer/dashboard']);
  }

  if (authService.isSellerAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/seller/login'], {
    queryParams: { returnUrl: state.url }
  });
};


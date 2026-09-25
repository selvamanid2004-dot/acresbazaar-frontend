import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export type ActivePageView = 'home' | 'about' | 'services' | 'buyers' | 'category' | 'membership';

@Injectable({
  providedIn: 'root'
})
export class NavStateService {
  private router = inject(Router);

  readonly currentView = signal<ActivePageView>('home');
  readonly selectedCategorySlug = signal<string>('all-residential');
  readonly registerModalOpen = signal<boolean>(false);
  readonly dealerModalOpen = signal<boolean>(false);
  readonly postPropertyModalOpen = signal<boolean>(false);
  readonly membershipModalOpen = signal<boolean>(false);
  readonly selectedMembershipTier = signal<'gold' | 'platinum'>('gold');
  readonly activeMembership = signal<'gold' | 'platinum' | null>(null);
  readonly targetPropertyToUnlock = signal<any>(null);

  setView(view: ActivePageView, targetSectionId?: string) {
    this.currentView.set(view);

    if (view === 'home') {
      if (this.router.url !== '/') {
        this.router.navigate(['/']).then(() => {
          this.scrollToSection(targetSectionId);
        });
        return;
      }
      this.scrollToSection(targetSectionId);
      return;
    }

    if (view === 'about') {
      this.router.navigate(['/about']);
      return;
    }

    if (view === 'services') {
      this.router.navigate(['/services']);
      return;
    }

    if (view === 'buyers') {
      this.router.navigate(['/buyers']);
      return;
    }
  }

  private scrollToSection(targetSectionId?: string) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (targetSectionId) {
      setTimeout(() => {
        const el = document.getElementById(targetSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }

  openCategoryPage(slug: string) {
    this.selectedCategorySlug.set(slug);
    this.router.navigate(['/' + slug]);
  }

  openRegister() {
    this.registerModalOpen.set(true);
  }

  closeRegister() {
    this.registerModalOpen.set(false);
  }

  openDealerFlow() {
    this.dealerModalOpen.set(true);
  }

  closeDealerFlow() {
    this.dealerModalOpen.set(false);
  }

  openPostProperty() {
    this.postPropertyModalOpen.set(true);
  }

  closePostProperty() {
    this.postPropertyModalOpen.set(false);
  }

  openMembershipModal(tier: 'gold' | 'platinum' = 'gold', property?: any) {
    this.selectedMembershipTier.set(tier);
    if (property) {
      this.targetPropertyToUnlock.set(property);
    }
    this.membershipModalOpen.set(true);
  }

  closeMembershipModal() {
    this.membershipModalOpen.set(false);
  }

  activateMembership(plan: 'gold' | 'platinum') {
    this.activeMembership.set(plan);
    this.membershipModalOpen.set(false);
  }
}

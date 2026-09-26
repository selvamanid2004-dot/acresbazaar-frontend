import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchFilter } from '../../../../core/models/property.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NavStateService } from '../../../../core/services/nav-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PropertyService } from '../../../../core/services/property.service';

@Component({
  selector: 'app-property-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-search.component.html',
  styleUrl: './property-search.component.css'
})
export class PropertySearchComponent {
  router = inject(Router);
  notificationService = inject(NotificationService);
  navStateService = inject(NavStateService);
  authService = inject(AuthService);
  propertyService = inject(PropertyService);

  @Output() searchSubmitted = new EventEmitter<SearchFilter>();

  selectedCategory = 'all-residential';
  searchKeyword = '';
  selectedBudget = 'any';

  openPlanOption(plan: 'gold' | 'platinum') {
    if (plan === 'gold') {
      this.router.navigate(['/plans/gold']);
    } else {
      this.router.navigate(['/plans/platinum']);
    }
  }

  onCategoryChange(catSlug: string) {
    this.selectedCategory = catSlug;
    this.router.navigate(['/' + catSlug]);
  }

  onSearch() {
    this.searchSubmitted.emit({
      category: this.selectedCategory,
      location: this.searchKeyword,
      budgetRange: this.selectedBudget
    });
    this.router.navigate(['/' + this.selectedCategory]);
  }
}

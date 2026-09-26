import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { Category } from '../../../../core/models/property.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NavStateService } from '../../../../core/services/nav-state.service';

@Component({
  selector: 'app-property-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-categories.component.html',
  styleUrl: './property-categories.component.css'
})
export class PropertyCategoriesComponent {
  propertyService = inject(PropertyService);
  notificationService = inject(NotificationService);
  navStateService = inject(NavStateService);
  router = inject(Router);

  @Output() categoryChosen = new EventEmitter<Category>();

  categories = this.propertyService.getCategories();

  onCategoryClick(cat: Category) {
    this.notificationService.show(cat.name, `Opening dedicated ${cat.name} page...`, 'gold');
    this.navStateService.selectedCategorySlug.set(cat.slug);
    this.router.navigate(['/' + cat.slug]);
    this.categoryChosen.emit(cat);
  }
}

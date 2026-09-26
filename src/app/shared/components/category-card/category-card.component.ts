import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models/property.model';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css'
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
  @Output() selectCategory = new EventEmitter<Category>();

  onSelect() {
    this.selectCategory.emit(this.category);
  }
}

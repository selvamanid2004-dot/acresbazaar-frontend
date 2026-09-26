import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css'
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  @Output() viewDetails = new EventEmitter<Property>();
  @Output() bookmarkToggled = new EventEmitter<{ property: Property; bookmarked: boolean }>();

  isBookmarked: boolean = false;

  toggleBookmark(event: Event) {
    event.stopPropagation();
    this.isBookmarked = !this.isBookmarked;
    this.bookmarkToggled.emit({ property: this.property, bookmarked: this.isBookmarked });
  }

  onViewDetails() {
    this.viewDetails.emit(this.property);
  }
}

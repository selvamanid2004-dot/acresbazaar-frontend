import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-post-property-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-property-modal.component.html',
  styleUrl: './post-property-modal.component.css'
})
export class PostPropertyModalComponent {
  notificationService = inject(NotificationService);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();

  formData = {
    role: 'Owner',
    propertyType: 'plot',
    listingType: 'sell',
    title: '',
    city: '',
    price: '',
    contact: ''
  };

  close() {
    this.closeRequested.emit();
  }

  onSubmit() {
    this.notificationService.show(
      'Listing Submitted!',
      'Your property listing has been queued for verification. A relationship manager will verify your documents.',
      'success'
    );
    this.close();
  }
}

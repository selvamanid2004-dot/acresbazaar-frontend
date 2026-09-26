import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.css'
})
export class RegisterModalComponent {
  private router = inject(Router);

  @Input() isOpen: boolean = false;
  @Output() closeRequested = new EventEmitter<void>();

  selectOption(route: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.router.navigateByUrl(route).then(success => {
      if (!success) {
        this.router.navigate([route]);
      }
    });
  }

  close(): void {
    this.closeRequested.emit();
  }
}

import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ReviewFormData } from '../../../core/models/reviewForm.model';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './review-modal.component.html',
  styleUrl: './review-modal.component.css'
})
export class ReviewModalComponent {
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<ReviewFormData>();

  readonly stars = [1, 2, 3, 4, 5];

  hoveredRating = 0;
  isSubmitting = false;

  readonly reviewForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80)
      ]
    ],
    email: [
      '',
      [
        Validators.email,
        Validators.maxLength(120)
      ]
    ],
    rating: [
      0,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]
    ],
    comment: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(600)
      ]
    ]
  });

  constructor(
    private readonly formBuilder: FormBuilder
  ) {}

  get selectedRating(): number {
    return this.reviewForm.controls.rating.value;
  }

  setRating(rating: number): void {
    this.reviewForm.controls.rating.setValue(rating);
    this.reviewForm.controls.rating.markAsTouched();
  }

  closeModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetForm();
    this.closed.emit();
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const review = this.reviewForm.getRawValue();

    this.reviewSubmitted.emit(review);

    this.isSubmitting = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.reviewForm.reset({
      name: '',
      email: '',
      rating: 0,
      comment: ''
    });

    this.hoveredRating = 0;
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }
}
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

import {
  CheckCircle2,
  LucideAngularModule,
  MessageSquareText,
  Search,
  Trash2,
  XCircle
} from 'lucide-angular';

import {
  Review,
  ReviewStatus
} from '../../../core/models/reviewForm.model';

type ReviewFilter = 'all' | ReviewStatus;

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ConfirmationModalComponent
  ],
  templateUrl: './review-management.component.html',
  styleUrl: './review-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewManagementComponent {
  @Input()
  reviews: Review[] = [];

  @Output()
  approve = new EventEmitter<string>();

  @Output()
  reject = new EventEmitter<string>();

  @Output()
  remove = new EventEmitter<string>();

  readonly ReviewsIcon = MessageSquareText;
  readonly SearchIcon = Search;
  readonly ApproveIcon = CheckCircle2;
  readonly RejectIcon = XCircle;
  readonly DeleteIcon = Trash2;

  readonly stars = [1, 2, 3, 4, 5];

  reviewDeleteModalOpen = false;

reviewPendingDelete: Review | null = null;

  activeFilter: ReviewFilter = 'pending';
  searchText = '';

  get pendingCount(): number {
    return this.reviews.filter(
      review => review.status === 'pending'
    ).length;
  }

  get approvedCount(): number {
    return this.reviews.filter(
      review => review.status === 'approved'
    ).length;
  }

  get rejectedCount(): number {
    return this.reviews.filter(
      review => review.status === 'rejected'
    ).length;
  }

  get filteredReviews(): Review[] {
    const search = this.normalize(this.searchText);

    return this.reviews
      .filter(review => {
        if (this.activeFilter === 'all') {
          return true;
        }

        return review.status === this.activeFilter;
      })
      .filter(review => {
        if (!search) {
          return true;
        }

        const searchableText = [
          review.name,
          review.email ?? '',
          review.comment
        ]
          .map(value => this.normalize(value))
          .join(' ');

        return searchableText.includes(search);
      })
      .sort((firstReview, secondReview) => {
        return (
          new Date(secondReview.createdAt).getTime() -
          new Date(firstReview.createdAt).getTime()
        );
      });
  }

  setFilter(filter: ReviewFilter): void {
    this.activeFilter = filter;
  }

  approveReview(reviewId: string): void {
    this.approve.emit(reviewId);
  }

  rejectReview(reviewId: string): void {
    this.reject.emit(reviewId);
  }

  deleteReview(reviewId: string): void {
    this.remove.emit(reviewId);
  }

  getStatusLabel(status: ReviewStatus): string {
    const labels: Record<ReviewStatus, string> = {
      pending: 'Pendiente',
      approved: 'Publicada',
      rejected: 'Rechazada'
    };

    return labels[status];
  }

  getInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  requestDeleteReview(review: Review): void {
  this.reviewPendingDelete = review;
  this.reviewDeleteModalOpen = true;
}

cancelDeleteReview(): void {
  this.reviewDeleteModalOpen = false;
  this.reviewPendingDelete = null;
}

confirmDeleteReview(): void {
  const review = this.reviewPendingDelete;

  if (!review) {
    return;
  }

  this.reviewDeleteModalOpen = false;
  this.reviewPendingDelete = null;

  this.deleteReview(review.id);
}
}
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Building2,
  CheckCircle2,
  Clock3,
  KeyRound,
  LayoutDashboard,
  LucideAngularModule,
} from 'lucide-angular';

import { DashboardStatCardComponent } from '../../components/dashboard-stat-card/dashboard-stat-card.component';
import { ReviewManagementComponent } from '../../components/review-management/review-management.component';
import { TransactionDetailModalComponent } from '../../components/transaction-detail-modal/transaction-detail-modal.component';
import { TransactionHistoryComponent } from '../../components/transaction-history/transaction-history.component';
import { PropertyTransaction } from '../../../core/models/propertytransaction.model';
import { Review } from '../../../core/models/reviewForm.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DashboardStatCardComponent,
    ReviewManagementComponent,
    TransactionHistoryComponent,
    TransactionDetailModalComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly ClockIcon = Clock3;
  readonly CheckCircleIcon = CheckCircle2;
  readonly BuildingIcon = Building2;
  readonly KeyIcon = KeyRound;

  reviews: Review[] = [];
  transactions: PropertyTransaction[] = [];
  selectedTransaction: PropertyTransaction | null = null;
  transactionDetailOpen = false;
  isLoading = false;
  loadError = '';

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get pendingReviews(): number {
    return this.reviews.filter(review => review.status === 'pending').length;
  }

  get approvedReviews(): number {
    return this.reviews.filter(review => review.status === 'approved').length;
  }

  get soldProperties(): number {
    return this.transactions.filter(
      transaction =>
        transaction.transactionType === 'sale' &&
        transaction.status === 'active'
    ).length;
  }

  get rentedProperties(): number {
    return this.transactions.filter(
      transaction =>
        transaction.transactionType === 'rent' &&
        transaction.status === 'active'
    ).length;
  }

  approveReview(reviewId: string): void {
    this.reviewService
      .approveReview(reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: review => this.replaceReview(review),
        error: error => this.handleActionError('aprobar', error),
      });
  }

  rejectReview(reviewId: string): void {
    this.reviewService
      .rejectReview(reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: review => this.replaceReview(review),
        error: error => this.handleActionError('rechazar', error),
      });
  }

  deleteReview(reviewId: string): void {
    this.reviewService
      .deleteReview(reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.reviews = this.reviews.filter(review => review.id !== reviewId);
        },
        error: error => this.handleActionError('eliminar', error),
      });
  }

  viewTransaction(transaction: PropertyTransaction): void {
    this.selectedTransaction = transaction;
    this.transactionDetailOpen = true;
  }

  closeTransactionDetail(): void {
    this.transactionDetailOpen = false;
    this.selectedTransaction = null;
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.loadError = '';

    this.dashboardService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: dashboard => {
          this.reviews = dashboard.reviews ?? [];
          this.transactions = dashboard.transactions ?? [];
          this.isLoading = false;
        },
        error: error => {
          console.error('No se pudo cargar el dashboard:', error);
          this.reviews = [];
          this.transactions = [];
          this.isLoading = false;
          this.loadError = 'No se pudo cargar la información del dashboard.';
        },
      });
  }

  private replaceReview(updatedReview: Review): void {
    this.reviews = this.reviews.map(review =>
      review.id === updatedReview.id ? updatedReview : review
    );
  }

  private handleActionError(action: string, error: unknown): void {
    console.error(`No se pudo ${action} la reseña:`, error);
    alert(`No se pudo ${action} la reseña.`);
  }
}

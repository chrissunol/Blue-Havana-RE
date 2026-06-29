import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Building2,
  CheckCircle2,
  Clock3,
  KeyRound,
  LayoutDashboard,
  LucideAngularModule,
  MessageSquareText
} from 'lucide-angular';
import { DashboardStatCardComponent } from '../../../admin/components/dashboard-stat-card/dashboard-stat-card.component';
import { Review, ReviewStatus } from '../../../core/models/reviewForm.model';
import { ReviewManagementComponent } from '../../components/review-management/review-management.component';
import { TransactionHistoryComponent } from '../../components/transaction-history/transaction-history.component';
import { TransactionDetailModalComponent } from '../../components/transaction-detail-modal/transaction-detail-modal.component';
import { PropertyTransaction } from '../../../core/models/propertytransaction.model';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DashboardStatCardComponent,
    ReviewManagementComponent,
    TransactionHistoryComponent,
    TransactionDetailModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent {
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly ClockIcon = Clock3;
  readonly CheckCircleIcon = CheckCircle2;
  readonly BuildingIcon = Building2;
  readonly KeyIcon = KeyRound;
  readonly ReviewsIcon = MessageSquareText;


  selectedTransaction: PropertyTransaction | null = null;
transactionDetailOpen = false;
  reviews: Review[] = [
  {
    id: 'review-1',
    name: 'Carlos Martínez',
    email: 'carlos@example.com',
    rating: 5,
    comment:
      'Excelente atención durante todo el proceso. Encontramos la propiedad que buscábamos.',
    status: 'pending',
    createdAt: '2026-06-28T14:30:00'
  },
  {
    id: 'review-2',
    name: 'Laura Rodríguez',
    email: 'laura@example.com',
    rating: 5,
    comment:
      'El equipo fue muy profesional y respondió rápidamente todas nuestras preguntas.',
    status: 'approved',
    createdAt: '2026-06-26T10:20:00'
  },
  {
    id: 'review-3',
    name: 'Miguel Hernández',
    email: 'miguel@example.com',
    rating: 3,
    comment:
      'La experiencia fue buena, aunque algunos detalles pudieron explicarse mejor.',
    status: 'rejected',
    createdAt: '2026-06-24T17:45:00'
  }
];
transactions: PropertyTransaction[] = [
  {
    id: 'transaction-1',
    propertyId: 'property-101',
    propertyTitle: 'Casa moderna en Vedado',
    transactionType: 'sale',
    status: 'active',
    finalAmount: 125000,
    clientName: 'Juan Pérez',
    closedAt: '2026-06-27',
    notes: 'Venta completada y documentación entregada.',
    createdBy: 'Superadmin',
    createdAt: '2026-06-27T16:00:00'
  },
  {
    id: 'transaction-2',
    propertyId: 'property-102',
    propertyTitle: 'Apartamento con vista al mar',
    transactionType: 'rent',
    status: 'active',
    finalAmount: 950,
    clientName: 'María López',
    closedAt: '2026-06-22',
    notes: 'Contrato de renta por 12 meses.',
    createdBy: 'Superadmin',
    createdAt: '2026-06-22T11:30:00'
  },
  {
    id: 'transaction-3',
    propertyId: 'property-103',
    propertyTitle: 'Local comercial en Centro Habana',
    transactionType: 'sale',
    status: 'active',
    finalAmount: 78000,
    clientName: 'Roberto Díaz',
    closedAt: '2026-06-15',
    notes: 'Operación completada.',
    createdBy: 'Superadmin',
    createdAt: '2026-06-15T15:40:00'
  },
  {
    id: 'transaction-4',
    propertyId: 'property-104',
    propertyTitle: 'Apartamento familiar en Playa',
    transactionType: 'rent',
    status: 'cancelled',
    finalAmount: 700,
    clientName: 'Ana González',
    closedAt: '2026-06-10',
    notes: 'La operación fue cancelada posteriormente.',
    createdBy: 'Superadmin',
    createdAt: '2026-06-10T09:20:00',
    cancelledAt: '2026-06-12T13:00:00',
    cancelledBy: 'Superadmin'
  }
];

get pendingReviews(): number {
  return this.reviews.filter(
    review => review.status === 'pending'
  ).length;
}

get approvedReviews(): number {
  return this.reviews.filter(
    review => review.status === 'approved'
  ).length;
}

approveReview(reviewId: string): void {
  this.updateReviewStatus(reviewId, 'approved');
}

rejectReview(reviewId: string): void {
  this.updateReviewStatus(reviewId, 'rejected');
}

deleteReview(reviewId: string): void {
  this.reviews = this.reviews.filter(
    review => review.id !== reviewId
  );
}

private updateReviewStatus(
  reviewId: string,
  status: ReviewStatus
): void {
  this.reviews = this.reviews.map(review =>
    review.id === reviewId
      ? {
          ...review,
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Superadmin'
        }
      : review
  );
}

get soldProperties(): number {
  return this.transactions.filter(transaction =>
    transaction.transactionType === 'sale' &&
    transaction.status === 'active'
  ).length;
}

get rentedProperties(): number {
  return this.transactions.filter(transaction =>
    transaction.transactionType === 'rent' &&
    transaction.status === 'active'
  ).length;
}
viewTransaction(transaction: PropertyTransaction): void {
  this.selectedTransaction = transaction;
  this.transactionDetailOpen = true;
}

closeTransactionDetail(): void {
  this.transactionDetailOpen = false;
  this.selectedTransaction = null;
}
}
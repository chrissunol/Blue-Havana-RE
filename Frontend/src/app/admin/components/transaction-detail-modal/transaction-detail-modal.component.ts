import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import {
  Building2,
  CalendarDays,
  CircleCheckBig,
  CircleX,
  DollarSign,
  KeyRound,
  LucideAngularModule,
  NotebookText,
  UserRound,
  X
} from 'lucide-angular';

import {
  PropertyTransaction
} from '../../../core/models/propertytransaction.model';

@Component({
  selector: 'app-transaction-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './transaction-detail-modal.component.html',
  styleUrl: './transaction-detail-modal.component.css'
})
export class TransactionDetailModalComponent {
  @Input()
  isOpen = false;

  @Input()
  transaction: PropertyTransaction | null = null;

  @Output()
  closed = new EventEmitter<void>();

  readonly CloseIcon = X;
  readonly BuildingIcon = Building2;
  readonly KeyIcon = KeyRound;
  readonly MoneyIcon = DollarSign;
  readonly ClientIcon = UserRound;
  readonly CalendarIcon = CalendarDays;
  readonly NotesIcon = NotebookText;
  readonly CompletedIcon = CircleCheckBig;
  readonly CancelledIcon = CircleX;

  get isSale(): boolean {
    return this.transaction?.transactionType === 'sale';
  }

  get typeLabel(): string {
    return this.isSale ? 'Venta' : 'Renta';
  }

  get amountLabel(): string {
    return this.isSale
      ? 'Precio final de venta'
      : 'Precio mensual de renta';
  }

  get statusLabel(): string {
    return this.transaction?.status === 'cancelled'
      ? 'Cancelada'
      : 'Completada';
  }

  closeModal(): void {
    this.closed.emit();
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }
}
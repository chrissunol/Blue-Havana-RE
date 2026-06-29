import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Building2,
  Eye,
  KeyRound,
  LucideAngularModule,
  Search
} from 'lucide-angular';

import {
  PropertyTransaction,
  TransactionType
} from '../../../core/models/propertytransaction.model';

type TransactionFilter = 'all' | TransactionType;

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent {
  @Input()
  transactions: PropertyTransaction[] = [];

  @Output()
  viewTransaction = new EventEmitter<PropertyTransaction>();

  readonly BuildingIcon = Building2;
  readonly KeyIcon = KeyRound;
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;

  activeFilter: TransactionFilter = 'all';
  searchText = '';

  get salesCount(): number {
    return this.transactions.filter(transaction =>
      transaction.transactionType === 'sale' &&
      transaction.status === 'active'
    ).length;
  }

  get rentsCount(): number {
    return this.transactions.filter(transaction =>
      transaction.transactionType === 'rent' &&
      transaction.status === 'active'
    ).length;
  }

  get filteredTransactions(): PropertyTransaction[] {
    const search = this.normalize(this.searchText);

    return this.transactions
      .filter(transaction => {
        if (this.activeFilter === 'all') {
          return true;
        }

        return transaction.transactionType === this.activeFilter;
      })
      .filter(transaction => {
        if (!search) {
          return true;
        }

        const searchableText = [
          transaction.propertyTitle,
          transaction.propertyId,
          transaction.clientName ?? '',
          transaction.createdBy,
          transaction.notes ?? ''
        ]
          .map(value => this.normalize(value))
          .join(' ');

        return searchableText.includes(search);
      })
      .sort((firstTransaction, secondTransaction) => {
        return (
          new Date(secondTransaction.closedAt).getTime() -
          new Date(firstTransaction.closedAt).getTime()
        );
      });
  }

  setFilter(filter: TransactionFilter): void {
    this.activeFilter = filter;
  }

  openTransaction(transaction: PropertyTransaction): void {
    this.viewTransaction.emit(transaction);
  }

  getTypeLabel(type: TransactionType): string {
    return type === 'sale' ? 'Venta' : 'Renta';
  }

  getStatusLabel(status: PropertyTransaction['status']): string {
    return status === 'active'
      ? 'Completada'
      : 'Cancelada';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
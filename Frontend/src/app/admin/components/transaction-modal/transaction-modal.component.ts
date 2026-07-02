import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Building2,
  KeyRound,
  LucideAngularModule,
  X
} from 'lucide-angular';

import { Property } from '../../../core/models/property.model';
import {
  CreatePropertyTransaction,
  TransactionType
} from '../../../core/models/propertytransaction.model';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.css'
})
export class TransactionModalComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() property: Property | null = null;
  @Input() transactionType: TransactionType = 'sale';

  @Output() closed = new EventEmitter<void>();

  @Output()
  confirmed = new EventEmitter<CreatePropertyTransaction>();

  readonly CloseIcon = X;
  readonly SaleIcon = Building2;
  readonly RentIcon = KeyRound;

  readonly transactionForm = this.formBuilder.nonNullable.group({
    finalAmount: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    clientName: [
      '',
      [
        Validators.maxLength(120)
      ]
    ],

    closedAt: [
      this.getToday(),
      [
        Validators.required
      ]
    ],

    notes: [
      '',
      [
        Validators.maxLength(600)
      ]
    ]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['isOpen'] ||
      changes['property'] ||
      changes['transactionType']
    ) {
      if (this.isOpen && this.property) {
        this.prepareForm();
      }
    }
  }

  get isSale(): boolean {
    return this.transactionType === 'sale';
  }

  get modalTitle(): string {
    return this.isSale
      ? 'Registrar venta'
      : 'Registrar renta';
  }

  get amountLabel(): string {
    return this.isSale
      ? 'Precio final de venta'
      : 'Precio mensual de renta';
  }

  get propertyTitle(): string {
    const title = this.property?.title;

    if (!title) {
      return 'Propiedad seleccionada';
    }

    if (typeof title === 'string') {
      return title;
    }

    if (typeof title === 'object') {
      const translatedTitle = title as {
        es?: string;
        en?: string;
        fr?: string;
      };

      return (
        translatedTitle.es ||
        translatedTitle.en ||
        translatedTitle.fr ||
        'Propiedad seleccionada'
      );
    }

    return 'Propiedad seleccionada';
  }

  closeModal(): void {
    this.closed.emit();
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  submitTransaction(): void {
    if (!this.property?.id) {
      return;
    }

    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formValue = this.transactionForm.getRawValue();

    const transaction: CreatePropertyTransaction = {
      propertyId: String(this.property.id),
      transactionType: this.transactionType,
      finalAmount: Number(formValue.finalAmount),
      closedAt: formValue.closedAt,
      clientName: formValue.clientName.trim() || undefined,
      notes: formValue.notes.trim() || undefined
    };

    this.confirmed.emit(transaction);
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  private prepareForm(): void {
    const propertyPrice = Number(this.property?.price ?? 0);

    this.transactionForm.reset({
      finalAmount: propertyPrice > 0 ? propertyPrice : 0,
      clientName: '',
      closedAt: this.getToday(),
      notes: ''
    });
  }

  private getToday(): string {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60_000;

    return new Date(today.getTime() - timezoneOffset)
      .toISOString()
      .split('T')[0];
  }
}
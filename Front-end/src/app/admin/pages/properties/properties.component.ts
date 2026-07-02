import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { PropertySearchComponent } from '../../../shared/components/property-search/property-search.component';
import { PropertyFormsComponent } from '../property-forms/property-forms.component';
import { PropertyFilters } from '../../../core/models/property-filter.model';
import { PropertyTransactionRequest } from '../../../shared/components/property-card/property-card.component';
import { TransactionType, CreatePropertyTransaction } from '../../../core/models/propertytransaction.model';
import { TransactionModalComponent } from '../../../admin/components/transaction-modal/transaction-modal.component';
import { ConfirmationModalComponent, ConfirmationAction } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LanguageService } from '../../../core/services/language.service';


@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    PropertyListComponent,
    PropertySearchComponent,
    PropertyFormsComponent,
    TransactionModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
})
export class PropertiesComponent {
  properties: Property[] = [];

  isModalOpen = false;
  selectedProperty: Property | null = null;
  hasSearched = false;
   selectedTransactionType: TransactionType = 'sale';
  transactionModalOpen = false;
  confirmationModalOpen = false;

confirmationAction:
  ConfirmationAction = 'edit';

propertyPendingAction:
  Property | null = null;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    public languageService: LanguageService
  ) {
    this.loadProperties();
  }

  loadProperties() {
    this.propertyService.getAll().subscribe(properties => {
      this.properties = properties;
    });
  }

  goToDetail(property: Property) {
    this.router.navigate(['/propiedades', property.id]);
  }

  openCreateModal() {
    this.selectedProperty = null;
    this.isModalOpen = true;
  }

  openEditModal(property: Property) {
    this.selectedProperty = property;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProperty = null;
  }

  saveProperty(property: Property) {
    const operation = this.selectedProperty
      ? this.propertyService.update(property)
      : this.propertyService.create(property);

    operation.subscribe(() => {
      this.loadProperties();
      this.closeModal();
    });
  }

  deleteProperty(property: Property) {
    this.propertyService.delete(property.id).subscribe(() => {
      this.loadProperties();
    });
  }

  toggleVisibility(property: Property) {
    this.propertyService.toggleVisibility(property).subscribe(() => {
      this.loadProperties();
    });
  }

  toggleFeatured(property: Property) {
    this.propertyService.toggleFeatured(property).subscribe(() => {
      this.loadProperties();
    });
  }

  toggleTransactionStatus(property: Property): void {
  const completedStatus =
    property.operation === 'rent'
      ? 'rented'
      : 'sold';

  const nextStatus =
    property.transactionStatus === completedStatus
      ? 'available'
      : completedStatus;

  this.propertyService
    .updateTransactionStatus(property.id, nextStatus)
    .subscribe({
      next: updatedProperty => {
        this.properties = this.properties.map(item =>
          String(item.id) === String(updatedProperty.id)
            ? updatedProperty
            : item
        );
      },
      error: error => {
        console.error(
          'No se pudo actualizar el estado de la propiedad',
          error
        );
      }
    });
}

  onSearch(filters: PropertyFilters) {
    this.hasSearched = true;
    this.propertyService.filterProperties(filters).subscribe(properties => {
      this.properties = properties;
    });
  }
  openTransactionModal(
  request: PropertyTransactionRequest
): void {
  this.selectedProperty = request.property;
  this.selectedTransactionType = request.transactionType;
  this.transactionModalOpen = true;
}
closeTransactionModal(): void {
  this.transactionModalOpen = false;
  this.selectedProperty = null;
  this.selectedTransactionType = 'sale';
}
confirmTransaction(transaction: any): void {
  const propertyId = transaction.propertyId;

  const payload = {
    finalAmount: transaction.finalAmount,
    closedAt: transaction.closedAt,
    clientName: transaction.clientName || null,
    clientPhone: transaction.clientPhone || null,
    clientEmail: transaction.clientEmail || null,
    notes: transaction.notes || null,
  };

  const request$ =
    transaction.transactionType === 'rent'
      ? this.propertyService.markAsRented(propertyId, payload)
      : this.propertyService.markAsSold(propertyId, payload);

  request$.subscribe({
    next: () => {
      // Volvemos a cargar desde el backend para mostrar el estado real.
      this.loadProperties();
      this.closeTransactionModal();
    },
    error: (error) => {
      console.error('No se pudo registrar la operación:', error);

      alert(
        error.error?.detail ||
          'No se pudo registrar la venta o renta. Inténtalo nuevamente.'
      );
    },
  });
}
requestEditConfirmation(
  property: Property
): void {
  this.propertyPendingAction = property;
  this.confirmationAction = 'edit';
  this.confirmationModalOpen = true;
}

requestDeleteConfirmation(
  property: Property
): void {
  this.propertyPendingAction = property;
  this.confirmationAction = 'delete';
  this.confirmationModalOpen = true;
}

closeConfirmationModal(): void {
  this.confirmationModalOpen = false;
  this.propertyPendingAction = null;
}

confirmPropertyAction(): void {
  const property =
    this.propertyPendingAction;

  if (!property) {
    return;
  }

  const action =
    this.confirmationAction;

  this.confirmationModalOpen = false;
  this.propertyPendingAction = null;

  if (action === 'edit') {
    this.openEditModal(property);
    return;
  }

  this.deleteProperty(property);
}
}

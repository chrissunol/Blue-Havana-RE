import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Bath,
  BedDouble,
  Circle,
  CircleCheckBig,
  Eye,
  EyeOff,
  Heart,
  LucideAngularModule,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Ruler,
  Search,
  Trash2
} from 'lucide-angular';

import { Property } from '../../../core/models/property.model';
import { CompanyInfo } from '../../../core/models/information.model';

import { LanguageService } from '../../../core/services/language.service';
import { InformationService } from '../../../core/services/information.service';

import {
  TransactionType
} from '../../../core/models/propertytransaction.model';

export type PropertyCardMode = 'public' | 'admin';

export interface PropertyTransactionRequest {
  property: Property;
  transactionType: TransactionType;
}

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css'
})
export class PropertyCardComponent implements OnInit {
  @Input({ required: true })
  property!: Property;

  @Input()
  mode: PropertyCardMode = 'public';

  @Output()
  view = new EventEmitter<Property>();

  @Output()
  edit = new EventEmitter<Property>();

  @Output()
  remove = new EventEmitter<Property>();

  @Output()
  toggleVisibility = new EventEmitter<Property>();

  @Output()
  toggleFeatured = new EventEmitter<Property>();

  /*
   * Se utiliza cuando una propiedad ya está vendida o rentada
   * y se quiere volver a marcar como disponible.
   */
  @Output()
  toggleTransactionStatus = new EventEmitter<Property>();

  /*
   * Se utiliza cuando la propiedad todavía está disponible
   * y debe abrirse el modal de venta o renta.
   */
  @Output()
  transactionRequested =
    new EventEmitter<PropertyTransactionRequest>();

  readonly MapPin = MapPin;
  readonly BedDouble = BedDouble;
  readonly Bath = Bath;
  readonly Ruler = Ruler;
  readonly Search = Search;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly MessageCircle = MessageCircle;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Heart = Heart;
  readonly Circle = Circle;
  readonly CircleCheckBig = CircleCheckBig;

  info: CompanyInfo;

  constructor(
    public readonly languageService: LanguageService,
    private readonly informationService: InformationService
  ) {
    this.info = this.informationService.getInfo();
  }

  ngOnInit(): void {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });
  }

  get mainImage(): string {
    return (
      this.property.images?.[0] ||
      'assets/images/placeholder.svg'
    );
  }

  get pricePerM2(): number {
    if (this.property.pricePerM2) {
      return this.property.pricePerM2;
    }

    if (this.property.area > 0) {
      return Math.round(
        this.property.price / this.property.area
      );
    }

    return 0;
  }

  get whatsappLink(): string {
    const phone = (this.info.whatsapp || '')
      .replace(/\D/g, '');

    const title = this.languageService.translateText(
      this.property.title
    );

    const text = encodeURIComponent(
      `Hola, quiero información sobre: ${title}`
    );

    return `https://wa.me/${phone}?text=${text}`;
  }

  get telLink(): string {
    const phone = (
      this.info.phone ||
      this.info.whatsapp ||
      ''
    ).replace(/\s/g, '');

    return `tel:${phone}`;
  }

  get mailtoLink(): string {
    const title = this.languageService.translateText(
      this.property.title
    );

    const subject = encodeURIComponent(
      `Consulta: ${title}`
    );

    return `mailto:${this.info.email}?subject=${subject}`;
  }

  /**
   * Convierte la operación de la propiedad al tipo utilizado
   * por el historial de transacciones.
   */
  get transactionType(): TransactionType {
    return this.property.operation === 'rent'
      ? 'rent'
      : 'sale';
  }

  /**
   * Estado que debe tener la propiedad cuando se complete
   * la operación.
   */
  get completedTransactionStatus(): 'sold' | 'rented' {
    return this.transactionType === 'rent'
      ? 'rented'
      : 'sold';
  }

  /**
   * Indica si la propiedad ya fue vendida o rentada.
   */
  get isTransactionCompleted(): boolean {
    return (
      this.property.transactionStatus ===
      this.completedTransactionStatus
    );
  }

  get completedStatusLabel(): string {
    return this.transactionType === 'rent'
      ? 'RENTADO'
      : 'VENDIDO';
  }

  get transactionButtonLabel(): string {
    if (this.isTransactionCompleted) {
      return this.transactionType === 'rent'
        ? 'Rentado'
        : 'Vendido';
    }

    return this.transactionType === 'rent'
      ? 'Marcar como rentado'
      : 'Marcar como vendido';
  }

  get transactionButtonTitle(): string {
    if (this.isTransactionCompleted) {
      return 'Marcar nuevamente como disponible';
    }

    return this.transactionType === 'rent'
      ? 'Registrar esta propiedad como rentada'
      : 'Registrar esta propiedad como vendida';
  }

  /**
   * Si está disponible, abre el modal.
   * Si ya está completada, solicita volverla a poner disponible.
   */
  onTransactionButtonClick(event: MouseEvent): void {
    event.stopPropagation();

    if (this.isTransactionCompleted) {
      this.toggleTransactionStatus.emit(this.property);
      return;
    }

    this.transactionRequested.emit({
      property: this.property,
      transactionType: this.transactionType
    });
  }
  onImageClick(): void {
  if (this.mode !== 'public') {
    return;
  }

  this.view.emit(this.property);
}
}
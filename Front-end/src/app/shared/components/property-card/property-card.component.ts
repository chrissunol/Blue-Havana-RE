import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Heart,
} from 'lucide-angular';

import { Property } from '../../../core/models/property.model';
import { LanguageService } from '../../../core/services/language.service';
import { InformationService } from '../../../core/services/information.service';
import { CompanyInfo } from '../../../core/models/information.model';

export type PropertyCardMode = 'public' | 'admin';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
})
export class PropertyCardComponent implements OnInit {
  @Input({ required: true }) property!: Property;
  @Input() mode: PropertyCardMode = 'public';

  @Output() view = new EventEmitter<Property>();
  @Output() edit = new EventEmitter<Property>();
  @Output() remove = new EventEmitter<Property>();
  @Output() toggleVisibility = new EventEmitter<Property>();
  @Output() toggleFeatured = new EventEmitter<Property>();

  readonly MapPin = MapPin;
  readonly BedDouble = BedDouble;
  readonly Bath = Bath;
  readonly Square = Square;
  readonly Search = Search;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly MessageCircle = MessageCircle;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Heart = Heart;

  info: CompanyInfo = this.informationService.getInfo();

  constructor(
    public languageService: LanguageService,
    private informationService: InformationService
  ) {}

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });
  }

  get mainImage(): string {
    return this.property.images?.[0] || 'assets/images/placeholder.svg';
  }

  get pricePerM2(): number {
    if (this.property.pricePerM2) return this.property.pricePerM2;

    if (this.property.area > 0) {
      return Math.round(this.property.price / this.property.area);
    }

    return 0;
  }

  get whatsappLink(): string {
    const phone = (this.info.whatsapp || '').replace(/\D/g, '');
    const title = this.languageService.translateText(this.property.title);
    const text = encodeURIComponent(`Hola, quiero información sobre: ${title}`);
    return `https://wa.me/${phone}?text=${text}`;
  }

  get telLink(): string {
    const phone = (this.info.phone || this.info.whatsapp || '').replace(/\s/g, '');
    return `tel:${phone}`;
  }

  get mailtoLink(): string {
    const title = this.languageService.translateText(this.property.title);
    const subject = encodeURIComponent(`Consulta: ${title}`);
    return `mailto:${this.info.email}?subject=${subject}`;
  }
}

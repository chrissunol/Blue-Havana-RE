import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { LucideAngularModule, MapPin, Check } from 'lucide-angular';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyListComponent, TranslateModule, LucideAngularModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit {
  property!: Property;
  similarProperties: Property[] = [];
  readonly MapPin = MapPin;
  readonly Check = Check;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/propiedades']);
      return;
    }

    this.propertyService.getById(id).subscribe({
      next: (property: Property) => {
        this.property = property;
        this.propertyService.getVisible().subscribe(properties => {
          this.similarProperties = properties
            .filter((property: Property) => property.id !== id)
            .slice(0, 4);
        });
      },
      error: () => {
        this.router.navigate(['/propiedades']);
      }
    });
  }

  get hasFeatures(): boolean {
  const features = this.property?.features;

  if (!features) return false;

  return Boolean(
    features.garage ||
    features.terrace ||
    features.pool ||
    features.garden ||
    features.ranchon ||
    features.balcony ||
    features.jacuzzi ||
    features.furnished ||
    features.other
  );
}

  goToDetail(property: Property) {
    this.router.navigate(['/propiedades', property.id]);
  }
}

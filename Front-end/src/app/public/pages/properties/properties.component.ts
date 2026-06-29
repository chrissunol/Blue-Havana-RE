import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { PropertySearchComponent } from '../../../shared/components/property-search/property-search.component';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { PropertyFilters } from '../../../core/models/property-filter.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    PropertySearchComponent,
    PropertyListComponent,
    SectionTitleComponent,
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  hasSearched = false;
  allProperties: Property[] = [];
  selectedType: string | null = null;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const hasParams = Object.keys(params).length > 0;

      if (!hasParams) {
        this.loadProperties();
        return;
      }

      const filters: PropertyFilters = {
        operation: params['operation'] || 'all',
        category: params['category'] || '',
        listingType: params['listingType'] || 'all',

        // Acepta location y también zone por si vienes desde la sección de ciudades
        location: params['location'] || params['zone'] || '',

        bedrooms: params['bedrooms'] ? Number(params['bedrooms']) : null,
        bathrooms: params['bathrooms'] ? Number(params['bathrooms']) : null,

        features: {
          garage: params['garage'] === 'true',
          terrace: params['terrace'] === 'true',
          pool: params['pool'] === 'true',
          garden: params['garden'] === 'true',
          ranchon: params['ranchon'] === 'true',
          balcony: params['balcony'] === 'true',
          jacuzzi: params['jacuzzi'] === 'true',
          furnished: params['furnished'] === 'true',
        },
      };

      this.onSearch(filters);
    });
  }

  private loadProperties(): void {
    this.hasSearched = false;

    this.propertyService.getVisible().subscribe({
      next: (properties: Property[]) => {
        this.properties = properties;
      },
      error: () => {
        this.properties = [];
      },
    });
  }

  goToDetail(property: Property): void {
    if (!property?.id) return;

    this.router.navigate(['/propiedades', property.id]);
  }

  onSearch(filters: PropertyFilters): void {
    this.hasSearched = true;

    this.propertyService.filterProperties(filters, true).subscribe({
      next: (properties: Property[]) => {
        this.properties = properties;
      },
      error: () => {
        this.properties = [];
      },
    });
  }
}
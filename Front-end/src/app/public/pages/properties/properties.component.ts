import { Component } from '@angular/core';
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
export class PropertiesComponent {
  properties: Property[] = [];
  hasSearched = false;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.propertyService.getVisible().subscribe(properties => {
      this.properties = properties;
    });

    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length === 0) return;

      const filters: PropertyFilters = {
        operation: params['operation'] || 'all',
        category: params['category'] || '',
        location: params['location'] || '',
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

  goToDetail(property: Property) {
    this.router.navigate(['/propiedades', property.id]);
  }

  onSearch(filters: PropertyFilters) {
    this.hasSearched = true;
    this.propertyService.filterProperties(filters, true).subscribe(properties => {
      this.properties = properties;
    });
  }
}

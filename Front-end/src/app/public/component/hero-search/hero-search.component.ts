import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyFilters } from '../../../core/models/property-filter.model';
import { PropertySearchComponent } from '../../../shared/components/property-search/property-search.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [PropertySearchComponent, TranslateModule],
  templateUrl: './hero-search.component.html',
  styleUrl: './hero-search.component.css',
})
export class HeroSearchComponent {
  constructor(private router: Router,
  ) {}

  onSearch(filters: PropertyFilters) {
    const queryParams: Record<string, string | number | boolean> = {};

    if (filters.operation && filters.operation !== 'all') {
      queryParams['operation'] = filters.operation;
    }
    if (filters.category) {
      queryParams['category'] = filters.category;
    }
    if (filters.location) {
      queryParams['location'] = filters.location;
    }
    if (filters.bedrooms != null) {
      queryParams['bedrooms'] = filters.bedrooms;
    }
    if (filters.bathrooms != null) {
      queryParams['bathrooms'] = filters.bathrooms;
    }
    if (filters.features) {
      for (const [key, enabled] of Object.entries(filters.features)) {
        if (enabled) {
          queryParams[key] = 'true';
        }
      }
    }

    this.router.navigate(['/propiedades'], { queryParams });
  }
}

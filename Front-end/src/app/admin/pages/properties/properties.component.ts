import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { PropertySearchComponent } from '../../../shared/components/property-search/property-search.component';
import { PropertyFormsComponent } from '../property-forms/property-forms.component';
import { PropertyFilters } from '../../../core/models/property-filter.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    PropertyListComponent,
    PropertySearchComponent,
    PropertyFormsComponent,
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
})
export class PropertiesComponent {
  properties: Property[] = [];

  isModalOpen = false;
  selectedProperty: Property | null = null;
  hasSearched = false;

  constructor(
    private propertyService: PropertyService,
    private router: Router
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

  onSearch(filters: PropertyFilters) {
    this.hasSearched = true;
    this.propertyService.filterProperties(filters).subscribe(properties => {
      this.properties = properties;
    });
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PropertyFilters } from '../models/property-filter.model';
import { PropertyTransaction } from '../models/propertytransaction.model';
import {
  Property,
  PropertyTransactionStatus,
} from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPublicProperties(): Observable<Property[]> {
    return this.http
      .get<Property[]>(`${this.apiUrl}/properties`)
      .pipe(map(properties => properties.map(property => this.normalizeProperty(property))));
  }

  getPublicPropertiesFiltered(filters: PropertyFilters): Observable<Property[]> {
    return this.http
      .get<Property[]>(`${this.apiUrl}/properties`, {
        params: this.buildParams(filters),
      })
      .pipe(map(properties => properties.map(property => this.normalizeProperty(property))));
  }

  getAdminPropertiesFiltered(filters: PropertyFilters): Observable<Property[]> {
    return this.http
      .get<Property[]>(`${this.apiUrl}/properties/admin/all`, {
        params: this.buildParams(filters),
      })
      .pipe(map(properties => properties.map(property => this.normalizeProperty(property))));
  }

  getPropertyById(id: string): Observable<Property> {
    return this.http
      .get<Property>(`${this.apiUrl}/properties/${id}`)
      .pipe(map(property => this.normalizeProperty(property)));
  }

  getAdminPropertyById(id: string): Observable<Property> {
    return this.http
      .get<Property>(`${this.apiUrl}/properties/admin/${id}`)
      .pipe(map(property => this.normalizeProperty(property)));
  }

  getById(id: string): Observable<Property> {
    return this.getPropertyById(id);
  }

  getAdminProperties(): Observable<Property[]> {
    return this.http
      .get<Property[]>(`${this.apiUrl}/properties/admin/all`)
      .pipe(map(properties => properties.map(property => this.normalizeProperty(property))));
  }

  createProperty(property: Property): Observable<Property> {
    return this.http
      .post<Property>(`${this.apiUrl}/properties`, property)
      .pipe(map(created => this.normalizeProperty(created)));
  }

  updateProperty(id: string, property: Property): Observable<Property> {
    return this.http
      .patch<Property>(`${this.apiUrl}/properties/${id}`, property)
      .pipe(map(updated => this.normalizeProperty(updated)));
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}`);
  }

  publishProperty(id: string): Observable<Property> {
    return this.http
      .patch<Property>(`${this.apiUrl}/properties/${id}/publish`, {})
      .pipe(map(updated => this.normalizeProperty(updated)));
  }

  unpublishProperty(id: string): Observable<Property> {
    return this.http
      .patch<Property>(`${this.apiUrl}/properties/${id}/unpublish`, {})
      .pipe(map(updated => this.normalizeProperty(updated)));
  }

  markAsSold(id: string, payload: unknown): Observable<PropertyTransaction> {
    return this.http.post<PropertyTransaction>(
      `${this.apiUrl}/properties/${id}/mark-sold`,
      payload
    );
  }

  markAsRented(id: string, payload: unknown): Observable<PropertyTransaction> {
    return this.http.post<PropertyTransaction>(
      `${this.apiUrl}/properties/${id}/mark-rented`,
      payload
    );
  }

  getAll(): Observable<Property[]> {
    return this.getAdminProperties();
  }

  getVisible(): Observable<Property[]> {
    return this.getPublicProperties();
  }

  getFeatured(): Observable<Property[]> {
    const params = new HttpParams().set('featured', 'true');

    return this.http
      .get<Property[]>(`${this.apiUrl}/properties`, { params })
      .pipe(map(properties => properties.map(property => this.normalizeProperty(property))));
  }

  create(property: Property): Observable<Property> {
    return this.createProperty(property);
  }

  update(property: Property): Observable<Property> {
    return this.updateProperty(property.id, property);
  }

  delete(id: string): Observable<void> {
    return this.deleteProperty(id);
  }

  toggleVisibility(property: Property): Observable<Property> {
    return property.visible
      ? this.unpublishProperty(property.id)
      : this.publishProperty(property.id);
  }

  toggleFeatured(property: Property): Observable<Property> {
    return this.http
      .patch<Property>(`${this.apiUrl}/properties/${property.id}`, {
        featured: !property.featured,
      })
      .pipe(map(updated => this.normalizeProperty(updated)));
  }

  updateTransactionStatus(
    propertyId: string,
    status: PropertyTransactionStatus
  ): Observable<Property> {
    return this.http
      .patch<Property>(`${this.apiUrl}/properties/${propertyId}`, {
        transactionStatus: status,
      })
      .pipe(map(property => this.normalizeProperty(property)));
  }

  filterProperties(
    filters: PropertyFilters,
    visibleOnly = false
  ): Observable<Property[]> {
    return visibleOnly
      ? this.getPublicPropertiesFiltered(filters)
      : this.getAdminPropertiesFiltered(filters);
  }

  private buildParams(filters: PropertyFilters): HttpParams {
    let params = new HttpParams();

    if (filters.listingType && filters.listingType !== 'all') {
      params = params.set('listingType', filters.listingType);
    }
    if (filters.operation && filters.operation !== 'all') {
      params = params.set('operation', filters.operation);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.location) {
      params = params.set('location', filters.location);
    }
    if (filters.bedrooms != null) {
      params = params.set('bedrooms', String(filters.bedrooms));
    }
    if (filters.bathrooms != null) {
      params = params.set('bathrooms', String(filters.bathrooms));
    }
    if (filters.features) {
      Object.entries(filters.features)
        .filter(([, enabled]) => enabled)
        .forEach(([feature]) => {
          params = params.append('features', feature);
        });
    }

    return params;
  }

  private normalizeProperty(property: any): Property {
    return {
      ...property,
      createdAt: property.createdAt ?? property.created_at,
      transactionStatus:
        property.transactionStatus ?? property.transaction_status ?? property.status ?? 'available',
      listingType: this.normalizeListingType(
        property.listingType ?? property.listing_type ?? 'property'
      ),
      operation: this.normalizeOperation(property.operation),
      images: property.images ?? [],
      visible: property.visible ?? false,
      featured: property.featured ?? false,
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      area: property.area ?? 0,
      features: property.features ?? {},
    };
  }

  private normalizeOperation(value?: string | null): 'rent' | 'sale' {
    const normalized = this.normalizeText(value ?? '');
    return ['rent', 'renta', 'alquiler', 'for rent', 'en renta'].includes(normalized)
      ? 'rent'
      : 'sale';
  }

  private normalizeListingType(value?: string | null): 'property' | 'business' {
    const normalized = this.normalizeText(value ?? '');
    return ['business', 'negocio', 'negocios', 'commercial', 'comercial'].includes(
      normalized
    )
      ? 'business'
      : 'property';
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

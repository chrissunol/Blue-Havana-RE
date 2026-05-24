import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property } from '../models/property.model';
import { PropertyFilters } from '../models/property-filter.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPublicProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`).pipe(
      map(properties => properties.map(property => this.normalizeProperty(property))),
      catchError(() => of([]))
    );
  }


  getPublicPropertiesFiltered(filters: PropertyFilters): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`, { params: this.buildParams(filters) }).pipe(
      map(properties => properties.map(property => this.normalizeProperty(property))),
      catchError(() => this.getPublicProperties().pipe(map(properties => this.applyFilters(properties, filters))))
    );
  }

  getAdminPropertiesFiltered(filters: PropertyFilters): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties/admin/all`, { params: this.buildParams(filters) }).pipe(
      map(properties => properties.map(property => this.normalizeProperty(property))),
      catchError(() => this.getAdminProperties().pipe(map(properties => this.applyFilters(properties, filters))))
    );
  }

  getPropertyById(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/properties/${id}`).pipe(
      map(property => this.normalizeProperty(property))
    );
  }

  getById(id: string): Observable<Property> {
    return this.getPropertyById(id);
  }

  getAdminProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties/admin/all`).pipe(
      map(properties => properties.map(property => this.normalizeProperty(property))),
      catchError(() => of([]))
    );
  }

  createProperty(property: Property): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/properties`, property).pipe(
      map(created => this.normalizeProperty(created))
    );
  }

  updateProperty(id: string, property: Property): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/properties/${id}`, property).pipe(
      map(updated => this.normalizeProperty(updated))
    );
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}`);
  }

  publishProperty(id: string): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/properties/${id}/publish`, {}).pipe(
      map(updated => this.normalizeProperty(updated))
    );
  }

  unpublishProperty(id: string): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/properties/${id}/unpublish`, {}).pipe(
      map(updated => this.normalizeProperty(updated))
    );
  }

  markAsSold(id: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/properties/${id}/mark-sold`, payload);
  }

  markAsRented(id: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/properties/${id}/mark-rented`, payload);
  }

  getAll(): Observable<Property[]> {
    return this.getAdminProperties();
  }

  getVisible(): Observable<Property[]> {
    return this.getPublicProperties();
  }

  getFeatured(): Observable<Property[]> {
    const params = new HttpParams().set('featured', 'true');
    return this.http.get<Property[]>(`${this.apiUrl}/properties`, { params }).pipe(
      map(properties => properties.map(property => this.normalizeProperty(property))),
      catchError(() =>
        this.getPublicProperties().pipe(
          map(properties => properties.filter(property => property.featured))
        )
      )
    );
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
    return property.visible ? this.unpublishProperty(property.id) : this.publishProperty(property.id);
  }
  
  toggleFeatured(property: Property): Observable<Property> {
  return this.http.patch<Property>(
    `${this.apiUrl}/properties/${property.id}`,
    { featured: !property.featured }
  ).pipe(
    map(updated => this.normalizeProperty(updated))
  );
  }

  filterProperties(filters: PropertyFilters, onlyVisible = false): Observable<Property[]> {
    return onlyVisible
      ? this.getPublicPropertiesFiltered(filters)
      : this.getAdminPropertiesFiltered(filters);
  }

  private buildParams(filters: PropertyFilters): HttpParams {
    let params = new HttpParams();

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
      const enabled = Object.entries(filters.features)
        .filter(([, value]) => value)
        .map(([key]) => key);
      enabled.forEach(feature => {
        params = params.append('features', feature);
      });
    }

    return params;
  }

  private normalizeProperty(property: Property): Property {
    return {
      ...property,
      images: property.images || [],
      visible: property.visible ?? false,
      featured: property.featured ?? false,
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      area: property.area ?? 0,
      features: property.features || {},
    };
  }

  private applyFilters(properties: Property[], filters: PropertyFilters): Property[] {
    return properties.filter(property => {
      if (filters.operation && filters.operation !== 'all' && property.operation !== filters.operation) return false;
      if (filters.category && !this.matchesTranslatedText(property.category, filters.category)) return false;
      if (filters.location && !this.matchesTranslatedText(property.location, filters.location)) return false;
      if (filters.bedrooms != null && property.bedrooms !== filters.bedrooms) return false;
      if (filters.bathrooms != null && property.bathrooms !== filters.bathrooms) return false;

      if (filters.features) {
        const featureKeys = Object.keys(filters.features) as Array<keyof typeof filters.features>;
        for (const key of featureKeys) {
          if (filters.features[key] && !property.features?.[key]) return false;
        }
      }

      return true;
    });
  }

  private matchesTranslatedText(value: { es: string; en: string; fr: string }, search: string): boolean {
    const normalized = search.trim().toLowerCase();
    return [value?.es, value?.en, value?.fr].some(text => text?.toLowerCase().includes(normalized));
  }
  
}


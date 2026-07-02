import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../../testing/test-providers';

import { Property } from '../../../core/models/property.model';
import { PropertyCardComponent } from './property-card.component';

const propertyFixture: Property = {
  id: 'property-1',
  title: { es: 'Casa', en: 'House', fr: 'Maison' },
  category: { es: 'Casa', en: 'House', fr: 'Maison' },
  price: 100000,
  operation: 'sale',
  listingType: 'property',
  location: { es: 'La Habana', en: 'Havana', fr: 'La Havane' },
  bedrooms: 2,
  bathrooms: 1,
  area: 80,
  images: [],
  visible: true,
  featured: false,
  transactionStatus: 'available',
};

describe('PropertyCardComponent', () => {
  let component: PropertyCardComponent;
  let fixture: ComponentFixture<PropertyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCardComponent],
      providers: appTestProviders
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertyCardComponent);
    component = fixture.componentInstance;
    component.property = propertyFixture;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

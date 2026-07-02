import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../../testing/test-providers';

import { PropertySearchComponent } from './property-search.component';

describe('PropertySearchComponent', () => {
  let component: PropertySearchComponent;
  let fixture: ComponentFixture<PropertySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertySearchComponent],
      providers: appTestProviders
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

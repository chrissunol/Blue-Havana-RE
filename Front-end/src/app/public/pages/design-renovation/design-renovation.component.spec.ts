import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../../testing/test-providers';

import { DesignRenovationComponent } from './design-renovation.component';

describe('DesignRenovationComponent', () => {
  let component: DesignRenovationComponent;
  let fixture: ComponentFixture<DesignRenovationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignRenovationComponent],
      providers: appTestProviders
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DesignRenovationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

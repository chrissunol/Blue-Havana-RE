import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../../testing/test-providers';
import { Circle } from 'lucide-angular';

import { DashboardStatCardComponent } from './dashboard-stat-card.component';

describe('DashboardStatCardComponent', () => {
  let component: DashboardStatCardComponent;
  let fixture: ComponentFixture<DashboardStatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStatCardComponent],
      providers: appTestProviders
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardStatCardComponent);
    component = fixture.componentInstance;
    component.title = 'Total';
    component.value = 1;
    component.icon = Circle;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

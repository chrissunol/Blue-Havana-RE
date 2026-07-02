import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../../testing/test-providers';

import { AdminsComponent } from './admins.component';

describe('AdminsComponent', () => {
  let component: AdminsComponent;
  let fixture: ComponentFixture<AdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminsComponent],
      providers: appTestProviders
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

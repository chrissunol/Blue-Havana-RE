import { TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../testing/test-providers';

import { PropertyService } from './property.service';

describe('PropertyService', () => {
  let service: PropertyService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appTestProviders });
    service = TestBed.inject(PropertyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../testing/test-providers';

import { InformationService } from './information.service';

describe('InformationService', () => {
  let service: InformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appTestProviders });
    service = TestBed.inject(InformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

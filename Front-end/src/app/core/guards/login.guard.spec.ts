import { TestBed } from '@angular/core/testing';
import { appTestProviders } from '../../testing/test-providers';
import { CanActivateFn } from '@angular/router';

import { loginGuard } from './login.guard';

describe('loginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appTestProviders });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

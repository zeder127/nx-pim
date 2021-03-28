import { TestBed } from '@angular/core/testing';

import { WitStateService } from './wit-state.service';

describe('WitStateService', () => {
  let service: WitStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WitStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

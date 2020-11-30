import { TestBed } from '@angular/core/testing';

import { IterationService } from './iteration.service';

describe('IterationService', () => {
  let service: IterationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IterationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

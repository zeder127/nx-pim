import { TestBed } from '@angular/core/testing';

import { WitService } from './wit.service';

describe('WitService', () => {
  let service: WitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

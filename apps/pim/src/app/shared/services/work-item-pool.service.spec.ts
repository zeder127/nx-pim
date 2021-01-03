import { TestBed } from '@angular/core/testing';

import { WorkItemPoolService } from './work-item-pool.service';

describe('WorkItemPoolService', () => {
  let service: WorkItemPoolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkItemPoolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { BoardSyncService } from './board-sync.service';

describe('BoardSyncService', () => {
  let service: BoardSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

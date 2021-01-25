import { TestBed } from '@angular/core/testing';

import { BoardSettingsService } from './board-settings.service';

describe('BoardSettingsService', () => {
  let service: BoardSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

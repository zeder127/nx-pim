import { TestBed } from '@angular/core/testing';

import { ConnectionBuilderService } from './connection-builder.service';

describe('ConnectionBuilderService', () => {
  let service: ConnectionBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

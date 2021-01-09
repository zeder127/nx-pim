import { TestBed } from '@angular/core/testing';

import { AzureDevopsClientService } from './azure-devops-client.service';

describe('AzureDevopsClientService', () => {
  let service: AzureDevopsClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureDevopsClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

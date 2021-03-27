import { Injectable } from '@angular/core';
import { Iteration } from '@pim/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from '../../util/base/cacheable';
import { AzureDevopsClientService } from './azure-devops-client.service';

@Injectable({
  providedIn: 'root',
})
export class IterationService extends Cacheable<Iteration> {
  constructor(private devOpsClient: AzureDevopsClientService) {
    super();
  }

  protected getAllAsync(): Observable<Iteration[]> {
    return this.devOpsClient
      .fetchAll('_apis/work/teamsettings/iterations')
      .pipe(map((response: { value: Iteration[] }) => response.value));
  }
  // TODO iteration issue
  // _apis/wit/classificationNodes/Iterations?$depth=15
}

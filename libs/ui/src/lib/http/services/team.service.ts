import { Injectable } from '@angular/core';
import { Team } from '@pim/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from '../../util/base/cacheable';
import { AzureDevopsClientService } from './azure-devops-client.service';

@Injectable({
  providedIn: 'root',
})
export class TeamService extends Cacheable<Team> {
  constructor(private devOpsClient: AzureDevopsClientService) {
    super();
  }

  getAllAsync(): Observable<Team[]> {
    return this.devOpsClient
      .fetchAll('_apis/teams')
      .pipe(map((response: { value: Team[] }) => response.value));
  }
}

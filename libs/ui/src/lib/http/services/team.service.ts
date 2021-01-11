import { Injectable } from '@angular/core';
import { Team } from '@pim/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from '../../util/base/cacheable';
import * as DevOps from '../constants/auzre-endpoint';
import { AzureDevopsClientService } from './azure-devops-client.service';

@Injectable({
  providedIn: 'root',
})
export class TeamService extends Cacheable<Team> {
  constructor(private devOpsClient: AzureDevopsClientService) {
    super();
  }

  protected getAllAsync(): Observable<Team[]> {
    return this.devOpsClient
      .fetchByUrl(
        `${DevOps.host}/${DevOps.organization}/_apis/teams?api-version=5.1-preview.3`
      )
      .pipe(map((response: { value: Team[] }) => response.value));
  }
}

import { Injectable } from '@angular/core';
import { Iteration, PiConfiguration, Team } from '@pim/data';

import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IterationService } from './iteration.service';
import { TeamService } from './team.service';

const piconfig: PiConfiguration = {
  name: 'demo pi',
  teamIds: [
    'adc65352-4bef-4702-9e13-b819b3a34ead',
    '52f0bcb4-7117-4370-b1c1-0ffa9a54295b',
    '66e85cef-d37b-481f-b966-5f8af51d8df2'
  ],
  iterationIds: [
    '479afcc4-d6d5-489b-8857-5e729b25283f',
    '0e0c20f8-3ca4-4fe6-9891-0376eba8802f',
    '5f167e8b-8acc-4263-89f3-67cc92e11323',
    '4ef05253-3a92-4659-aceb-0270affe8c26',
    '4ee23779-9e43-422a-b24e-10a99f6bc988'
  ],
  witIds: []
}

@Injectable({
  providedIn: 'root'
})
export class PiService {

  constructor(private teamService: TeamService, private iterationService: IterationService) { }

  getPiConfiguration(id: string): Observable<PiConfiguration> {
    return of(piconfig).pipe(
      switchMap(() => forkJoin([this.teamService.getAll(), this.iterationService.getAll()])),
      map(value => {
        piconfig.teams = value[0].filter(team => piconfig.teamIds.includes(team.id));
        piconfig.iterations = value[1].filter(iteration => piconfig.iterationIds.includes(iteration.id));
        return piconfig;
      })
    );
  }
}

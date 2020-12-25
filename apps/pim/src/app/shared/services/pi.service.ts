import { Injectable } from '@angular/core';
import { Cacheable } from '@pim/ui';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Pi } from '../models/pi';
import { IterationService } from './iteration.service';
import { TeamService } from './team.service';

// const piconfig: PiConfiguration = {
//   id: '111222334455',
//   name: 'demo pi',
//   teamIds: [
//     'adc65352-4bef-4702-9e13-b819b3a34ead',
//     '52f0bcb4-7117-4370-b1c1-0ffa9a54295b',
//     '66e85cef-d37b-481f-b966-5f8af51d8df2'
//   ],
//   iterationIds: [
//     '479afcc4-d6d5-489b-8857-5e729b25283f',
//     '0e0c20f8-3ca4-4fe6-9891-0376eba8802f',
//     '5f167e8b-8acc-4263-89f3-67cc92e11323',
//     '4ef05253-3a92-4659-aceb-0270affe8c26',
//     '4ee23779-9e43-422a-b24e-10a99f6bc988'
//   ],
//   witIds: []
// }

const DemoPis: Pi[] = [
  {
    id: '111',
    name: '20Q1',
    teamBoardIds: [],
    programBoardId: '111-111',
  },
  {
    id: '222',
    name: '20Q 2',
    teamBoardIds: [],
    programBoardId: '222-222',
  },
  {
    id: '333',
    name: '20Q3',
    teamBoardIds: [],
    programBoardId: '333-333',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PiService extends Cacheable<Pi> {
  constructor(
    private teamService: TeamService,
    private iterationService: IterationService
  ) {
    super();
  }

  // getPiConfiguration(id: string): Observable<PiConfiguration> {
  //   return of(piconfig).pipe(
  //     switchMap(() => forkJoin([this.teamService.getAll(), this.iterationService.getAll()])),
  //     map(value => {
  //       piconfig.teams = value[0].filter(team => piconfig.teamIds.includes(team.id));
  //       piconfig.iterations = value[1].filter(iteration => piconfig.iterationIds.includes(iteration.id));
  //       return piconfig;
  //     })
  //   );
  // }

  protected getAll(): Observable<Pi[]> {
    return of(DemoPis).pipe(delay(100));
  }

  public getPis(): Observable<Pi[]> {
    return this.getCache();
  }

  public getPiByName(name: string) {
    return this.getSingleByKey('name', name);
  }
}

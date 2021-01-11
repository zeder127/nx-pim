import { Injectable } from '@angular/core';
import { Iteration, Team } from '@pim/data';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IterationService, TeamService, WitService } from '../../http';

@Injectable()
export class BoardService {
  public cardsInsert$ = new Subject<number[]>();
  public cardsLoad$ = new BehaviorSubject<number[]>([]);
  public cardsRemove$ = new Subject<number[]>();
  constructor(
    private iterationService: IterationService,
    private teamService: TeamService,
    private witService: WitService
  ) {}

  public getIterationById(id: string): Observable<Iteration> {
    return this.iterationService.getSingleByKey('id', id);
  }

  public getTeamById(id: string): Observable<Team> {
    return this.teamService.getSingleByKey('id', id);
  }

  public updateIterationAndTeam(
    ids: number[],
    newIterationId: string,
    newSourceId: string | number
  ) {
    if (!newIterationId && !newSourceId) return;
    if (!newIterationId && !!newSourceId) {
      ids?.forEach((id) => {
        this.getTeamById(`${newSourceId}`)
          .pipe(
            switchMap((team) => {
              return this.witService.updateTeam(id, team.name);
            })
          )
          .subscribe();
      });
    } else if (!!newIterationId && !newSourceId) {
      ids?.forEach((id) => {
        this.getIterationById(`${newIterationId}`)
          .pipe(
            switchMap((iteration) => {
              return this.witService.updateIteration(id, iteration.path);
            })
          )
          .subscribe();
      });
    } else {
      ids?.forEach((id) => {
        forkJoin([
          this.getIterationById(newIterationId),
          this.getTeamById(newIterationId),
        ])
          .pipe(
            switchMap(([iteration, team]) => {
              return this.witService.updateIterationAndTeam(
                id,
                iteration.path,
                team.name
              );
            })
          )
          .subscribe();
      });
    }
  }

  public openSourceUrl(id: number) {
    this.witService.open(id);
  }
}

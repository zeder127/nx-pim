import { Injectable } from '@angular/core';
import { ICard, Iteration, Team } from '@pim/data';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IterationService, TeamService, WitService } from '../../http';

@Injectable()
export class BoardService {
  public cardsInsert$ = new Subject<number[]>();
  public cardsLoad$ = new BehaviorSubject<number[]>([]);
  public cardsRemove$ = new Subject<number[]>();
  public sync$ = new Subject<ICard[]>();

  /** Current PI name, read from current url */
  public currentPiName: string;

  /** Current team name, read from current url. Be null if it is a programm-board */
  public currentTeamName: string;
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
      this.assignToTeam(ids, newSourceId);
    } else if (!!newIterationId && !newSourceId) {
      this.assignToIteration(ids, newIterationId);
    } else {
      this.assignToIterationAndTeam(ids, newIterationId, newSourceId);
    }
  }

  public syncBoard(cards: ICard[]) {
    //
  }

  private assignToIterationAndTeam(
    ids: number[],
    newIterationId: string,
    newSourceId: string | number
  ) {
    ids?.forEach((id) => {
      forkJoin([
        this.getIterationById(newIterationId),
        this.getTeamById(`${newSourceId}`),
      ])
        .pipe(
          switchMap(([iteration, team]) => {
            return this.witService.updateIterationAndTeam(
              id,
              iteration.path,
              `${team.projectName}\\${team.name}`
            );
          })
        )
        .subscribe();
    });
  }

  private assignToIteration(ids: number[], newIterationId: string) {
    ids?.forEach((id) => {
      this.getIterationById(`${newIterationId}`)
        .pipe(
          switchMap((iteration) => {
            return this.witService.updateIteration(id, iteration.path);
          })
        )
        .subscribe();
    });
  }

  private assignToTeam(ids: number[], newSourceId: string | number) {
    ids?.forEach((id) => {
      this.getTeamById(`${newSourceId}`)
        .pipe(
          switchMap((team) => {
            return this.witService.updateTeam(id, `${team.projectName}\\${team.name}`);
          })
        )
        .subscribe();
    });
  }

  public openSourceUrl(id: number) {
    this.witService.open(id);
  }
}

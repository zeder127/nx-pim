import { Injectable, NgZone } from '@angular/core';
import { Coworker, ICard, ICardBoardBase, IConnection, Iteration, Team } from '@pim/data';
import * as DataUtil from '@pim/data/util';
import { BehaviorSubject, forkJoin, Observable, Subject, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConnectionBuilderService } from '../../connection/connection-builder.service';
import { IterationService, TeamService, WitService } from '../../http';
@Injectable()
export class BoardService {
  public cardsInsert$ = new Subject<number[]>();
  public cardsLoad$ = new BehaviorSubject<number[]>([]);
  public cardsRemove$ = new Subject<number[]>();
  public connectionInsert$ = new Subject<IConnection>();
  public connectionDelete$ = new Subject<IConnection>();
  public sync$ = new Subject<ICard[]>();
  public coworkers$ = new BehaviorSubject<Coworker[]>(undefined);
  public availableBoards$: Observable<ICardBoardBase[]>;
  public dragStartPointId: string;
  public dragEndPointId: string;
  public colWidthBase = 20;
  public cardWidthBase = 160;
  public cardHeightBase = 6;
  public zoom$ = new BehaviorSubject<number>(1);

  /** Current PI name, read from current url */
  public currentPiName: string;

  /** Current team name, read from current url. Be null if it is a program-board */
  public currentTeamName: string;

  /** Current board name, read from BoardDDS */
  public currentBoardName: string;

  constructor(
    private iterationService: IterationService,
    private teamService: TeamService,
    private witService: WitService,
    private connectionBuilder: ConnectionBuilderService,
    private zone: NgZone
  ) {}

  public getIterationById(id: string): Observable<Iteration> {
    return this.iterationService.getSingleByKey('id', id);
  }

  public getTeamById(id: string): Observable<Team> {
    return this.teamService.getSingleByKey('id', id);
  }

  public insertNewConnection() {
    if (
      this.dragStartPointId &&
      this.dragEndPointId &&
      this.dragStartPointId !== this.dragEndPointId
    ) {
      this.connectionInsert$.next({
        startPointId: this.dragStartPointId,
        endPointId: this.dragEndPointId,
      });
    }
    this.dragStartPointId = undefined;
    this.dragEndPointId = undefined;
  }

  public updateIterationAndTeam(
    ids: number[],
    newIterationId: string,
    newSourceId: string | number
  ): Observable<ICard[]> {
    if (!newIterationId && !newSourceId) return;
    if (!newIterationId && !!newSourceId) {
      return this.assignToTeam(ids, newSourceId);
    } else if (!!newIterationId && !newSourceId) {
      return this.assignToIteration(ids, newIterationId);
    } else {
      return this.assignToIterationAndTeam(ids, newIterationId, newSourceId);
    }
  }

  private assignToIterationAndTeam(
    ids: number[],
    newIterationId: string,
    newSourceId: string | number
  ): Observable<ICard[]> {
    return zip(
      ...ids?.map((id) => {
        return forkJoin([
          this.getIterationById(newIterationId),
          this.getTeamById(`${newSourceId}`),
        ]).pipe(
          switchMap(([iteration, team]) => {
            return this.witService.updateIterationAndTeam(
              id,
              iteration.path,
              `${team.projectName}\\${team.name}`
            );
          })
        );
      })
    ).pipe(map((values) => values.map((v) => DataUtil.toCard(v))));
  }

  private assignToIteration(ids: number[], newIterationId: string): Observable<ICard[]> {
    return zip(
      ...ids?.map((id) => {
        return this.getIterationById(`${newIterationId}`).pipe(
          switchMap((iteration) => {
            return this.witService.updateIteration(id, iteration.path);
          })
        );
      })
    ).pipe(map((values) => values.map((v) => DataUtil.toCard(v))));
  }

  private assignToTeam(ids: number[], newSourceId: string | number) {
    return zip(
      ...ids?.map((id) => {
        return this.getTeamById(`${newSourceId}`).pipe(
          switchMap((team) => {
            return this.witService.updateTeam(id, `${team.projectName}\\${team.name}`);
          })
        );
      })
    ).pipe(map((values) => values.map((v) => DataUtil.toCard(v))));
  }

  public openSourceUrl(id: number) {
    this.witService.open(id);
  }

  public markCard(id: string) {
    document.getElementById(id)?.classList.add('marked');
  }

  public unMarkCard(id: string) {
    document.getElementById(id)?.classList.remove('marked');
  }

  public loadWits(ids) {
    this.witService.getWorkItems(ids).subscribe();
  }

  public zoomOut() {
    if (this.zoom$.value > 0.3) this.zoom$.next(this.zoom$.value - 0.05);
    this.connectionBuilder.updateConnectionWithAnimation();
  }

  public zoomIn() {
    if (this.zoom$.value < 1) this.zoom$.next(this.zoom$.value + 0.05);
    this.connectionBuilder.updateConnectionWithAnimation();
  }

  public resetZoom() {
    this.zoom$.next(1);
    this.connectionBuilder.updateConnectionWithAnimation();
  }
}

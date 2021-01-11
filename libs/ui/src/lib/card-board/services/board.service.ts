import { Injectable } from '@angular/core';
import { Iteration } from '@pim/data';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IterationService, WitService } from '../../http';

@Injectable()
export class BoardService {
  public cardsInsert$ = new Subject<number[]>();
  public cardsLoad$ = new BehaviorSubject<number[]>([]);
  public cardsRemove$ = new Subject<number[]>();
  constructor(
    private iterationService: IterationService,
    private witService: WitService
  ) {}

  public getIterationById(id: string): Observable<Iteration> {
    return this.iterationService.getSingleByKey('id', id);
  }

  public updateIteration(ids: number[], newIterationId: string) {
    ids?.forEach((id) => {
      this.getIterationById(newIterationId)
        .pipe(
          switchMap((iteration) => {
            return this.witService.updateIteration(id, iteration.path);
          })
        )
        .subscribe();
    });
  }

  public openSourceUrl(id: number) {
    this.witService.open(id);
  }
}

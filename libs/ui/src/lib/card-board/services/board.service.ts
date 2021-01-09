import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class BoardService {
  public cardsInsert$ = new Subject<number[]>();
  public cardsLoad$ = new BehaviorSubject<number[]>([]);
  public cardsRemove$ = new Subject<number[]>();
  constructor() {}
}

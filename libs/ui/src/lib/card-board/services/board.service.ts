import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class BoardService {
  public cardsOnBoardInsert$ = new Subject<number[]>();
  public cardsOnBoardLoad$ = new BehaviorSubject<number[]>(null);
  constructor() {}
}

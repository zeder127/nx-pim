import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class BoardService {
  public cardsOnBoardinsert$ = new Subject<number[]>();

  constructor() {}
}

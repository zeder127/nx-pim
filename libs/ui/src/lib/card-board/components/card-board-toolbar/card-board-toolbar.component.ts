import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Coworker } from '@pim/data';
import { Observable } from 'rxjs';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-card-board-toolbar',
  templateUrl: './card-board-toolbar.component.html',
  styleUrls: ['./card-board-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBoardToolbarComponent implements OnInit {
  constructor(private boardService: BoardService) {}

  get coworkers$(): Observable<Coworker[]> {
    return this.boardService.coworkers$.asObservable();
  }

  ngOnInit(): void {}
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-card-board-toolbar',
  templateUrl: './card-board-toolbar.component.html',
  styleUrls: ['./card-board-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBoardToolbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter();

  constructor(private boardService: BoardService) {}

  get coworkerMenuItems$(): Observable<MenuItem[]> {
    return this.boardService.coworkers$.asObservable().pipe(
      switchMap((coworkers) => {
        return of(
          coworkers.map((coworker) => {
            return { label: coworker.name } as MenuItem;
          })
        );
      })
    );
  }

  ngOnInit(): void {}

  public toggleWitSidebar() {
    this.toggleSidebar.emit();
  }
}

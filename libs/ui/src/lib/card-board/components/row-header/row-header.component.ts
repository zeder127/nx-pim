import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { IRowHeader, Iteration } from '@pim/data';
import { Observable } from 'rxjs';
import { IterationService } from '../../../http';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-row-header',
  templateUrl: './row-header.component.html',
  styleUrls: ['./row-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowHeaderComponent implements OnInit {
  public linkedIteration: Iteration;
  public zoomLevel: Observable<number>;

  @Input('model') rowHeader: IRowHeader;
  constructor(
    private iterationService: IterationService,
    private cdr: ChangeDetectorRef,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.zoomLevel = this.boardService.zoom$.asObservable();
    this.iterationService
      .getSingleByKey('id', this.rowHeader.linkedIterationId)
      .subscribe((value) => {
        this.linkedIteration = value;
        this.cdr.markForCheck();
      });
  }
}

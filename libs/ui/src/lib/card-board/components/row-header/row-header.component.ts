import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { IRowHeader, Iteration } from '@pim/data';
import { IterationService } from '../../../http';

@Component({
  selector: 'pim-row-header',
  templateUrl: './row-header.component.html',
  styleUrls: ['./row-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowHeaderComponent implements OnInit {
  public linkedIteration: Iteration;

  @Input('model') rowHeader: IRowHeader;
  constructor(
    private iterationService: IterationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.iterationService
      .getSingleByKey('id', this.rowHeader.linkedIterationId)
      .subscribe((value) => {
        this.linkedIteration = value;
        this.cdr.markForCheck();
      });
  }
}

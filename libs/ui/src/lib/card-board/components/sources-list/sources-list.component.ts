import { Component, Input, OnInit } from '@angular/core';
import { ICard, Team } from '@pim/data';
import { unionWith } from 'lodash';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-sources-list',
  templateUrl: './sources-list.component.html',
  styleUrls: ['./sources-list.component.scss'],
})
export class SourcesListComponent extends AutoUnsubscriber implements OnInit {
  public selectedTeam: Team;
  public filterText: string;
  private mappedSourceIds: number[] = [];

  /**
   * Source cards to be dragged onto board
   */
  @Input('sources') sourceCards: ICard[];

  @Input() teams: Team[];

  constructor(private boardService: BoardService) {
    super();
  }

  ngOnInit(): void {
    console.log(`🚀 ~ SourcesListComponent ~ sourceCards`, this.sourceCards); // TODO to remove
    this.boardService.cardsOnBoardInsert$
      .pipe(this.autoUnsubscribe())
      .subscribe((ids) => {
        this.mappedSourceIds = unionWith(this.mappedSourceIds, ids);
      });

    this.boardService.cardsOnBoardLoad$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = ids;
      console.log(`🚀 ~ SourcesListComponent ~ ids`, ids);
    });
  }

  public isMapped(sourceId: number): boolean {
    return this.mappedSourceIds.includes(sourceId);
  }
}

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CardBoardComponent } from './card-board/components/card-board/card-board.component';
import { CardContainerComponent } from './card-board/components/card-container/card-container.component';
import { CardComponent } from './card-board/components/card/card.component';


@NgModule({
  imports: [CommonModule, TableModule, DragDropModule],
  declarations: [CardBoardComponent, CardContainerComponent, CardComponent],
  exports: [CardBoardComponent],
})
export class UiModule {}

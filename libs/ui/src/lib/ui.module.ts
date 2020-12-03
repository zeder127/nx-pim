import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import { CardBoardComponent } from './card-board/components/card-board/card-board.component';

@NgModule({
  imports: [CommonModule, TableModule],
  declarations: [CardBoardComponent],
  exports: [CardBoardComponent]
})
export class UiModule {}

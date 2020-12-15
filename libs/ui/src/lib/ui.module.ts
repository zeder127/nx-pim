import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CardBoardModule } from './card-board/card-board.module';
import { ConnectionModule } from './connection/connection.module';


@NgModule({
  imports: [CommonModule, CardBoardModule, ConnectionModule],
  declarations: [],
  exports: [CardBoardModule, ConnectionModule],
})
export class UiModule {}

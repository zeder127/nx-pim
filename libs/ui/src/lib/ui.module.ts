import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CardBoardModule } from './card-board/card-board.module';
import { ConnectionModule } from './connection/connection.module';
import { AutoUnsubscriber } from './util/base/auto-unsubscriber';
import { UtilModule } from './util/util.module';

@NgModule({
  imports: [CommonModule, CardBoardModule, ConnectionModule, UtilModule],
  declarations: [AutoUnsubscriber],
  exports: [CardBoardModule, ConnectionModule],
})
export class UiModule {}

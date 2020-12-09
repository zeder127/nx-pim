import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConnectionComponent } from './components/connection/connection.component';

@NgModule({
  declarations: [ConnectionComponent],
  imports: [CommonModule],
  exports: [ConnectionComponent],
})
export class ConnectionModule {}

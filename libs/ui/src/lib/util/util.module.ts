import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShowOnHoverDirective } from './directives/show-on-hover.directive';

@NgModule({
  declarations: [ShowOnHoverDirective],
  imports: [CommonModule],
  exports: [ShowOnHoverDirective],
})
export class UtilModule {}

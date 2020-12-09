import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AdminRoutingModule } from './admin-routing.module';
import { PiConfiguratorComponent } from './pi-configurator/pi-configurator.component';

@NgModule({
  declarations: [PiConfiguratorComponent],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }

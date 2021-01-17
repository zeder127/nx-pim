import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { AdminRoutingModule } from './admin-routing.module';
import { PiConfiguratorComponent } from './pi-configurator/pi-configurator.component';

@NgModule({
  declarations: [PiConfiguratorComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    ListboxModule,
    MultiSelectModule,
    InputTextModule,
    ButtonModule,
    ChipsModule,
    CardModule,
    DropdownModule,
  ],
})
export class AdminModule {}

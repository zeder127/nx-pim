import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PiConfiguratorComponent } from './pi-configurator/pi-configurator.component';

const routes: Routes = [
  {
    path: ':piName/edit',
    component: PiConfiguratorComponent,
  },
  {
    path: 'pi/new',
    component: PiConfiguratorComponent,
  },

  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

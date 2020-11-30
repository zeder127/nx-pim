import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
// import { HomeComponent } from './core/home/home.component';
// import { GalleryComponent } from './feature/gallery/gallery.component';
// import { ProgressBoardComponent } from './feature/progress-board/progress-board.component';

const routes: Routes = [
  // {
  //   path: 'progress-board',
  //   component: ProgressBoardComponent,
  // },
  // {
  //   path: 'gallery',
  //   component: GalleryComponent,
  // },
  // {
  //   path: '',
  //   component: HomeComponent,
  // },
  // {
  //   path: 'settings',
  //   loadChildren: () =>
  //     import('./feature/administration/administration.module').then(
  //       (m) => m.AdministrationModule
  //     ),
  // },
  {
    path: 'planning-board',
    canActivate: [MsalGuard],
    loadChildren: () =>
      import('./features/planning-board/planning-board.module').then(
        (m) => m.PlanningBoardModule
      ),
  },
  {
    path: '**',
    redirectTo: 'planning-board',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

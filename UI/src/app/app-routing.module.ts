import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComfyComponent } from './components/comfy/comfy.component';
import { MappingComponent } from './components/pages/mapping/mapping.component';


const routes: Routes = [
  {
    path: ``,
    redirectTo: `/comfy`,
    pathMatch: 'full'
  },
  {
    path: `comfy`,
    component: ComfyComponent,
    data: { breadcrumb: 'Link Tables' },
    children: [ {
      path: `mapping`,
      component: MappingComponent,
      data: { breadcrumb: 'Link Fields' }
    } ]
  },
  { path: `mapping`, component: MappingComponent, data: { breadcrumb: 'Link Fields' } }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { SkillsComponent } from './components/skills/skills.component';

import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ManageAboutComponent } from './components/admin/manage-about/manage-about.component';
import { ManageSkillsComponent } from './components/admin/manage-skills/manage-skills.component';

import { AdminGuard } from './guards/admin.guard'; 
import { AdminProjectsComponent } from './components/admin/manage-projects/manage-projects.component';
import { PublicProjectsComponent } from './components/projects/projects.component';
import { AdminResumeComponent } from './components/admin/manage-resume/manage-resume.component';
import { AdminContactComponent } from './components/admin/manage-contacts/manage-contacts.component';
import { PublicResumeComponent } from './components/resume/resume.component';
 
export const routes: Routes = [    
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent},
  { path: 'contact', component: ContactComponent },
  { path: 'projects', component: PublicProjectsComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'resume', component: PublicResumeComponent},

  // Admin Routes 
  { path: 'admin/login', component: AdminLoginComponent },
    {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/manage-about',   
    component: ManageAboutComponent,
    canActivate: [AdminGuard] 
  },
  {
    path: 'admin/manage-projects',
    component: AdminProjectsComponent,
    canActivate: [AdminGuard] 
  },
  {
    path: 'admin/manage-skills',
    component: ManageSkillsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/manage-resume',
    component: AdminResumeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/manage-contacts',
    component: AdminContactComponent, 
    canActivate: [AdminGuard]
  },

  // Wildcard for 404
  { path: '**', redirectTo: '' }
];

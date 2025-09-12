import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { SkillsComponent } from './components/skills/skills.component';
import { PublicProjectsComponent } from './components/projects/projects.component';
import { PublicResumeComponent } from './components/resume/resume.component';
 
export const routes: Routes = [    
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent},
  { path: 'contact', component: ContactComponent },
  { path: 'projects', component: PublicProjectsComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'resume', component: PublicResumeComponent},

  // Wildcard for 404
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { SkillsComponent } from './components/skills/skills.component';
import { PublicProjectsComponent } from './components/projects/projects.component';
import { PublicResumeComponent } from './components/resume/resume.component';
import { BlogDetailComponent } from './components/blogs/blog-detail/blog-detail.component';
import { BlogsComponent } from './components/blogs/blogs/blogs.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { ServicesComponent } from './components/services/services.component';
 
export const routes: Routes = [    
  // Public Routes
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent},
  { path: 'services', component: ServicesComponent},
  { path: 'contact', component: ContactComponent },
  { path: 'news', component: NewsletterComponent },
  { path: 'projects', component: PublicProjectsComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'resume', component: PublicResumeComponent},
  { path: 'blogs', component: BlogsComponent},
  { path: 'blog/:slug', component: BlogDetailComponent },

  // Wildcard for 404
  { path: '**', redirectTo: '' }
];
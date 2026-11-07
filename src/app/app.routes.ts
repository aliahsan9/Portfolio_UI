import { Routes } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./components/services/services.component').then(
        (m) => m.ServicesComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./components/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'news',
    loadComponent: () =>
      import('./components/newsletter/newsletter.component').then(
        (m) => m.NewsletterComponent
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./components/projects/projects.component').then(
        (m) => m.PublicProjectsComponent
      ),
  },
  {
    path: 'examdynamics-detail',
    loadComponent: () =>
      import(
        './components/projects-details/examdynamics-detail/examdynamics-detail.component'
      ).then((m) => m.ExamdynamicsDetailComponent),
  },
  {
    path: 'erp-detail',
    loadComponent: () =>
      import(
        './components/projects-details/erp-detail/erp-detail.component'
      ).then((m) => m.ErpDetail),
  },
  {
    path: 'portfolio-detail',
    loadComponent: () =>
      import(
        './components/projects-details/portfolio-detail/portfolio-detail.component'
      ).then((m) => m.PortfolioDetailComponent),
  },
  {
    path: 'prodfalcon-detail',
    loadComponent: () =>
      import(
        './components/projects-details/prodfalcon-detail/prodfalcon-detail.component'
      ).then((m) => m.ProdfalconDetailComponent),
  },
  {
    path: 'skills',
    loadComponent: () =>
      import('./components/skills/skills.component').then(
        (m) => m.SkillsComponent
      ),
  },
  {
    path: 'testimonials',
    loadComponent: () =>
      import('./components/testimonial/testimonial.component').then(
        (m) => m.TestimonialComponent
      ),
  },
  {
    path: 'resume',
    loadComponent: () =>
      import('./components/resume/resume.component').then(
        (m) => m.PublicResumeComponent
      ),
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./components/blogs/blogs/blogs.component').then(
        (m) => m.BlogsComponent
      ),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./components/blogs/blog-detail/blog-detail.component').then(
        (m) => m.BlogDetailComponent
      ),
    providers: [provideMarkdown()],
  },
  { path: '**', redirectTo: '' },
];

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent {

  blogs = [
    {
      title: 'Building SchoolFish SaaS',
      slug: 'schoolfish-saas',
      date: '2026-05-01',
      description: 'How I built a multi-tenant SaaS for schools with Angular + .NET.',
      image: 'assets/blogs/images/schoolfish.webp'
    },
    {
      title: 'Clean Architecture',
      slug: 'clean-architecture',
      date: '2026-04-20',
      description: 'Best practices to write .net core web apis.',
      image: 'assets/blogs/angular.jpg'
    }
  ];
}
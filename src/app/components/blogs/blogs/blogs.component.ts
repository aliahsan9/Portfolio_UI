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
      title: 'How I Built Production-Ready JWT Authentication in ASP.NET Core + Angular',
      slug: 'secure-auth',
      date: '2026-05-07',
      description: 'Authentication is one of the most critical parts of any modern web application...',
      image: 'assets/blogs/images/jwt-thumbnail.webp'
    },
    {
      title: 'SQL Performance Optimization Techniques I Use in Production Applications',
      slug: 'sql-performance',
      date: '2026-05-08',
      description: 'Building fast, scalable, and production-ready systems is where backend engineering becomes truly valuable...',
      image: 'assets/blogs/images/sql-performance.webp'
    },
    {
      title: 'How I Structure Scalable .NET Applications Using Clean Architecture',
      slug: 'clean-architecture',
      date: '2026-05-09',
      description: 'Modern applications are no longer simple CRUD systems...',
      image: 'assets/blogs/images/clean-architecture.webp'
    },
  ];
}
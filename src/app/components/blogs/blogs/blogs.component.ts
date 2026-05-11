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
      slug: 'jwt-authentication',
      date: '2026-05-07',
      description: 'Authentication is one of the most critical parts of any modern web application...',
      image: 'assets/blogs/images/jwt.avif'
    },
    {
      title: 'SQL Performance Optimization Techniques I Use in Production Applications',
      slug: 'sql-performance',
      date: '2026-05-08',
      description: 'Building fast, scalable, and production-ready systems...',
      image: 'assets/blogs/images/sql-performance.avif'
    },
    {
      title: 'How I Structure Scalable .NET Applications Using Clean Architecture',
      slug: 'clean-architecture',
      date: '2026-05-09',
      description: 'Modern applications are no longer simple CRUD systems...',
      image: 'assets/blogs/images/clean-architecture.avif'
    },
    {
      title: 'Overengineering Experience',
      slug: 'over-engineering',
      date: '2026-05-10',
      description: 'There’s a point in software development where architecture stops...',
      image: 'assets/blogs/images/over-engineering.avif'
    },
    {
      title: 'AI Uniqueness',
      slug: 'ai-uniqueness',
      date: '2026-05-11',
      description: 'why AI does not produce Unique response...',
      image: 'assets/blogs/images/ai-uniqueness.avif'
    },
    {
      title: 'Agentic AI',
      slug: 'agentic-ai',
      date: '2026-05-12',
      description: 'Move from chatbots to agents that perform complex actions...',
      image: 'assets/blogs/images/agentic-ai.avif'
    },
  ];
}
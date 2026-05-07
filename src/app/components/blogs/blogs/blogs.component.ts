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
      image: 'assets/blogs/images/blog1.png'
    },
    {
      title: 'How I Built Production-Ready JWT Authentication in ASP.NET Core + Angular',
      slug: 'secure-auth',
      date: '2026-05-07',
      description: 'Authentication is one of the most critical parts of any modern web application...',
      image: 'assets/blogs/images/blog1.png'
    },
    {
      title: 'How I Built Production-Ready JWT Authentication in ASP.NET Core + Angular',
      slug: 'secure-auth',
      date: '2026-05-07',
      description: 'Authentication is one of the most critical parts of any modern web application...',
      image: 'assets/blogs/images/blog1.png'
    },
  ];
}
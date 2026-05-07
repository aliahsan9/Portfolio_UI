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
      title: 'How to Fix CORS in ASP.NET Core (Real Fix)',
      slug: 'fix-cors',
      date: '2026-04-20',
      description: 'CORS stands for Cross-Origin Resource Sharing.',
      image: 'assets/blogs/images/cors.jfif'
    },
  ];
}
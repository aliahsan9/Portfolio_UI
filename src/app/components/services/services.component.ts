import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services',
  imports:[CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {

  services = [
    {
      icon: 'bi bi-code-slash',
      title: 'Full-Stack Web Applications',
      description:
        'Build scalable and modern web applications using ASP.NET Core, Angular, SQL Server, and clean architecture principles.',

      features: [
        'Responsive UI/UX',
        'Secure Authentication',
        'Admin Dashboards',
        'Database Architecture',
        'API Integration'
      ],

      price: 'Starting at $300'
    },

    {
      icon: 'bi bi-server',
      title: 'ASP.NET Core API Development',
      description:
        'Develop secure, fast, and maintainable REST APIs with JWT authentication, Swagger, Entity Framework Core, and role-based access.',

      features: [
        'JWT Authentication',
        'CRUD APIs',
        'Clean Architecture',
        'Swagger/OpenAPI',
        'SQL Server Integration'
      ],

      price: 'Starting at $150'
    },

    {
      icon: 'bi bi-window-stack',
      title: 'Angular Frontend Development',
      description:
        'Create responsive Angular applications with reusable components, routing, state management, and modern UI design.',

      features: [
        'Responsive Layouts',
        'Reusable Components',
        'API Consumption',
        'Angular Routing',
        'Interactive Dashboards'
      ],

      price: 'Starting at $200'
    },

    {
      icon: 'bi bi-bug',
      title: 'Bug Fixing & Optimization',
      description:
        'Fix backend/frontend issues, improve performance, optimize SQL queries, and stabilize applications for production.',

      features: [
        'Error Debugging',
        'Performance Optimization',
        'Authentication Issues',
        'Deployment Fixes',
        'Code Refactoring'
      ],

      price: 'Starting at $80'
    },

    {
      icon: 'bi bi-palette',
      title: 'Figma to Responsive Website',
      description:
        'Convert Figma designs into pixel-perfect, fully responsive, and modern frontend applications.',

      features: [
        'Pixel Perfect UI',
        'Mobile Responsive',
        'Fast Performance',
        'Clean Code',
        'Cross-Browser Support'
      ],

      price: 'Starting at $120'
    },

    {
      icon: 'bi bi-database-check',
      title: 'Database Design & SQL',
      description:
        'Design optimized relational databases with efficient queries, normalization, stored procedures, and performance tuning.',

      features: [
        'SQL Server Design',
        'Query Optimization',
        'Stored Procedures',
        'Database Relationships',
        'Performance Tuning'
      ],

      price: 'Starting at $100'
    }
  ];

}
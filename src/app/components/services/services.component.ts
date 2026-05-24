import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  features: string[];
  badge?: string;
  priceEstimate: string;
  deliveryTime: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {
  services: ServiceItem[] = [
    {
      icon: 'bi bi-layers-half',
      title: 'Enterprise Full-Stack Applications',
      description: 'End-to-end engineered web systems built for scale. Architected using decoupled Angular frontends, highly performant .NET Core backends, and optimized SQL Server databases.',
      features: [
        'Clean Architecture & Repository Pattern',
        'Role-Based Access Control (RBAC) & Claims',
        'Real-time processing with SignalR',
        'Comprehensive database migration strategy'
      ],
      badge: 'Most Popular',
      priceEstimate: 'Custom Milestone Based',
      deliveryTime: '4-8 weeks'
    },
    {
      icon: 'bi bi-shield-lock',
      title: 'Robust ASP.NET Core API Architecture',
      description: 'Secure, lightning-fast, and decoupled RESTful APIs designed to power web, mobile, or third-party client systems with strict data safety standards.',
      features: [
        'JWT / OAuth2 Authentication states',
        'Global exception middleware & structured logging',
        'Entity Framework Core optimization & lazy loading',
        'Fully documented Swagger / OpenAPI schemas'
      ],
      priceEstimate: 'Starting from $600',
      deliveryTime: '1-2 weeks'
    },
    {
      icon: 'bi bi-braces-asterisk',
      title: 'High-Performance Angular Frontends',
      description: 'Conversion of complex states or static layouts into blazing fast, highly reactive corporate single-page applications (SPAs).',
      features: [
        'State Management & RxJS reactive streams',
        'Strict lazy-loading & route guard optimization',
        'Reusable component libraries & dynamic forms',
        'Cross-browser performance tuning'
      ],
      priceEstimate: 'Starting from $500',
      deliveryTime: '1-3 weeks'
    },
    {
      icon: 'bi bi-lightning-charge',
      title: 'Performance Tuning & SQL Optimization',
      description: 'Is your app lagging or dropping database queries? I profile, debug, refactor, and speed up bogged-down applications.',
      features: [
        'Deadlock resolution & index tuning in SQL Server',
        'LINQ execution optimization & raw query writing',
        'Memory leak detection & async handling fixes',
        'N+1 query problem eliminations'
      ],
      badge: 'Critical Support',
      priceEstimate: 'Hourly or Fixed Scope',
      deliveryTime: '2-5 days'
    },
    {
      icon: 'bi bi-vector-pen',
      title: 'Figma to High-Fidelity Responsive UI',
      description: 'Pixel-perfect UI transformations. I build semantic, beautifully animated layouts matching your precise design system rules across all modern screens.',
      features: [
        'Flexbox/CSS Grid responsive layouts',
        'Tailwind or custom clean SCSS architectures',
        'Accessible, screen-reader-friendly markup',
        'Interactive custom micro-animations'
      ],
      priceEstimate: 'Starting from $300',
      deliveryTime: '3-7 days'
    },
    {
      icon: 'bi bi-database-gear',
      title: 'Relational Database Design & Tuning',
      description: 'Rigorous data layer engineering. Normalize your unorganized spreadsheets or old data pools into scalable relational systems.',
      features: [
        'High-efficiency normalization (1NF to 3NF)',
        'Complex Stored Procedures, Views & Triggers',
        'Data backup scripts & automation tasks',
        'Advanced Query execution analysis'
      ],
      priceEstimate: 'Starting from $400',
      deliveryTime: '4-10 days'
    }
  ];
}
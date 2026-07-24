import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  route: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-public-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class PublicProjectsComponent {

  projects: Project[] = [ {
  title: 'BusinessOS',
  description:
    'Enterprise-grade AI-powered Business Operating System (BusinessOS) built for SMEs. Features secure authentication, multi-tenancy, inventory management, sales, purchases, analytics, reporting, and a scalable clean architecture.',
  image: 'assets/projects/erp.avif',
  technologies: [
    'Angular',
    '.NET 10',
    'SQL Server',
    'EF Core',
    'JWT',
    'Clean Architecture',
    'Serilog'
  ],
  route: '/erp-detail',
  icon: 'bi bi-building-gear',
  accent: '#2563eb'
},
    {
      title: 'ExamDynamics',
      description:
        'Advanced online examination platform with secure authentication, analytics dashboard, student management and modern UI.',
      image: 'assets/projects/examdynamics.avif',
      technologies: ['Angular', '.NET Core', 'SQL Server'],
      route: '/examdynamics-detail',
      icon: 'bi bi-mortarboard-fill',
      accent: '#38bdf8'
    },
     {
      title: 'Portfolio Website',
      description:
        'Modern developer portfolio crafted with premium UI animations, responsive layouts and interactive sections.',
      image: 'assets/projects/portfolio.avif',
      technologies: ['Angular', 'SCSS', 'Bootstrap'],
      route: '/portfolio-detail',
      icon: 'bi bi-person-badge-fill',
      accent: '#06b6d4'
    },
    {
      title: 'ProdFalcon',
      description:
        'Powerful ERP and inventory management platform designed for scalability, reporting and enterprise workflows.',
      image: 'assets/projects/prodfalcon.avif',
      technologies: ['Angular', '.NET API', 'SQL Server'],
      route: '/prodfalcon-detail',
      icon: 'bi bi-box-seam-fill',
      accent: '#8b5cf6'
    },
  
  ];
}
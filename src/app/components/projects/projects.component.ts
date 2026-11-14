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
    'AI-powered, multi-tenant ERP for SMEs, streamlining inventory, sales, purchasing, analytics, and reporting with secure authentication and scalable architecture.',
  image: 'assets/projects/erp.avif',
  technologies: [
    'Angular',
    '.NET 10',
    'SQL Server',
    'EF Core',
    'JWT',
    'Clean Architecture',
    'Serilog',
    'AI',
    'RAG',
    'Qdrant'
  ],
  route: '/erp-detail',
  icon: 'bi bi-building-gear',
  accent: '#2563eb'
},
     {
      title: 'UAF Management System',
      description:
        'University management platform for academic structure, admissions, and student records, with role-based access and a clean .NET architecture.',
      image: 'assets/projects/portfolio1.avif',
      technologies: [
        '.NET 10',
        'ASP.NET Core',
        'SQL Server',
        'EF Core',
        'JWT',
        'Clean Architecture',
        'Identity',
        'Serilog'
      ],
      route: '/uaf-detail',
      icon: 'bi bi-bank2',
      accent: '#059669'
    },
    {
      title: 'ProdFalcon',
      description:
        'AI-assisted code analysis platform that scans a codebase for risky patterns, explains findings, and suggests fixes for issues such as SQL injection and exposed secrets.',
      image: 'assets/projects/prodfalcon.avif',
      technologies: ['Angular', '.NET 8', 'SQL Server', 'EF Core', 'JWT', 'AI'],
      route: '/prodfalcon-detail',
      icon: 'bi bi-box-seam-fill',
      accent: '#8b5cf6'
    },
    {
      title: 'ExamDynamics',
      description:
        'Advanced online examination platform with secure authentication, analytics dashboard, student management and modern UI.',
      image: 'assets/projects/examdynamics.avif',
      technologies: ['Angular',
                     '.NET Core', 
                     'SQL Server',
                      'EF Core',
                      'JWT',
                      'Clean Architecture',
                      'Serilog',
                      'AI',
                      'Identity framework'
                    ],
      route: '/examdynamics-detail',
      icon: 'bi bi-mortarboard-fill',
      accent: '#38bdf8'
    },
  ];
}
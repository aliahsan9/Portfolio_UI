import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prodfalcon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodfalcon-detail.component.html',
  styleUrls: ['./prodfalcon-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProdfalconDetailComponent {

  features = [
    {
      title: 'AI Product Analysis',
      description:
        'Built intelligent product scanning and analysis workflows for evaluating products, insights, and performance metrics.'
    },
    {
      title: 'Secure Authentication',
      description:
        'Implemented JWT authentication, protected APIs, refresh token workflows, and role-based authorization.'
    },
    {
      title: 'Scalable Backend Architecture',
      description:
        'Designed modular Clean Architecture using .NET Web API with repository patterns and service layers.'
    },
    {
      title: 'Responsive Dashboard',
      description:
        'Created responsive dashboards and analytics interfaces optimized for desktop, tablet, and mobile devices.'
    }
  ];

  screenshots = [
    'assets/projects/prodfalcon1.avif',
    'assets/projects/prodfalcon2.avif',
    'assets/projects/prodfalcon3.avif'
  ];

  techStack = [
    '.NET 8 Web API',
    'Angular',
    'SQL Server',
    'Entity Framework Core',
    'Code First',
    'Bootstrap',
    'SCSS',
    'JWT Authentication',
    'REST APIs',
    'Azure',
    'Vercel'
  ];

}
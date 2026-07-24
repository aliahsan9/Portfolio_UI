import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-businessos-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './erp-detail.component.html',
  styleUrls: ['./erp-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpDetail {

  features = [
    {
      title: 'CRM',
      description:
        'Manage leads, clients and interactions with a centralized customer relationship module.'
    },
    {
      title: 'Invoicing',
      description:
        'Create, send and track invoices with automated billing workflows for clients.'
    },
    {
      title: 'Project Management',
      description:
        'Plan, assign and track projects and tasks across teams in one unified workspace.'
    },
    {
      title: 'Analytics Dashboard',
      description:
        'Visualize revenue, project progress and business performance through live dashboards.'
    },
    {
      title: 'Secure Authentication',
      description:
        'JWT-based authentication with role management and protected enterprise workflows.'
    },
    {
      title: 'Responsive UI',
      description:
        'Modern responsive interface optimized for desktop, tablet and mobile devices.'
    }
  ];

  screenshots = [
    'assets/projects/erp2.avif',
    'assets/projects/erp3.avif',
    'assets/projects/erp4.avif'
  ];

  techStack = [
    'Angular',
    'ASP.NET Core (.NET 9)',
    'SQL Server',
    'Entity Framework Core',
    'Bootstrap',
    'SCSS',
    'JWT Authentication'
  ];
}
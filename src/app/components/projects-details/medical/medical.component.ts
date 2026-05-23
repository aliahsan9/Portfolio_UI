import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-medical-management-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical.component.html',
  styleUrls: ['./medical.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Medical {

  features = [
    {
      title: 'Inventory Management',
      description:
        'Track medicines, stock levels, expiry dates and warehouse inventory with real-time updates.'
    },
    {
      title: 'Sales & Billing',
      description:
        'Generate invoices, manage customer purchases and automate pharmacy billing workflows.'
    },
    {
      title: 'Purchases & Suppliers',
      description:
        'Handle supplier records, purchase orders and medicine restocking efficiently.'
    },
    {
      title: 'Analytics Dashboard',
      description:
        'Visualize sales, inventory movements and business insights through interactive dashboards.'
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
    'assets/projects/medical1.avif',
    'assets/projects/medical2.avif',
    'assets/projects/medical3.avif'
  ];

  techStack = [
    'Angular',
    '.NET 8 Web API', 
    'SQL Server',
    'Entity Framework Core',
    'Bootstrap',
    'SCSS',
    'JWT Authentication'
  ];
}
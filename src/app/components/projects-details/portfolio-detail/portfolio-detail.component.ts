import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioDetailComponent {

  features = [
    {
      title: 'Modern UI Design',
      description:
        'Designed a clean premium portfolio interface with smooth layouts, responsive sections, and elegant animations.'
    },
    {
      title: 'Responsive Experience',
      description:
        'Optimized every component for desktop, tablet, and mobile devices using Angular and SCSS.'
    },
    {
      title: 'Reusable Components',
      description:
        'Created modular reusable Angular standalone components for scalability and maintainability.'
    },
    {
      title: 'Performance Optimized',
      description:
        'Built lightweight frontend architecture with optimized assets and smooth user interactions.'
    }
  ];

  screenshots = [
    'assets/projects/portfolio1.avif',
    'assets/projects/portfolio2.avif',
    'assets/projects/portfolio3.avif'
  ];

  techStack = [
    'Angular',
    'TypeScript',
    'SCSS',
    'Bootstrap',
    'Responsive Design',
    'Vercel'
  ];

}
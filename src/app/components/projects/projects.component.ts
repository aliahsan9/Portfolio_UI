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
}

@Component({
  selector: 'app-public-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class PublicProjectsComponent {

  hoveredIndex: number | null = null;

  projects: Project[] = [
    {
      title: 'ExamDynamics',
      description:
        'Advanced online examination platform with Angular, .NET Core, JWT authentication and admin analytics dashboard.',
      image: 'assets/projects/examdynamics.avif',
      technologies: ['Angular', '.NET Core', 'SQL Server'],
      route: '/examdynamics-detail',
      icon: 'bi bi-mortarboard-fill'
    },
    {
      title: 'ProdFalcon',
      description:
        'Modern ERP and inventory management platform with responsive UI and scalable backend architecture.',
      image: 'assets/projects/prodfalcon1.avif',
      technologies: ['Angular', '.NET API', 'Bootstrap'],
      route: '/prodfalcon-detail',
      icon: 'bi bi-box-seam-fill'
    },
    {
      title: 'Portfolio Website',
      description:
        'Personal portfolio crafted using Angular and SCSS with modern animations and premium dark UI.',
      image: 'assets/projects/portfolio.avif',
      technologies: ['Angular', 'SCSS', 'Bootstrap'],
      route: '/portfolio-detail',
      icon: 'bi bi-person-badge-fill'
    },
    {
      title: 'SchoolFish',
      description:
        'Complete school management solution with student records, attendance, fees and admin panel.',
      image: 'assets/projects/schoolfish.avif',
      technologies: ['Angular', '.NET', 'SQL'],
      route: '/school-management-detail',
      icon: 'bi bi-building-fill'
    }
  ];
}
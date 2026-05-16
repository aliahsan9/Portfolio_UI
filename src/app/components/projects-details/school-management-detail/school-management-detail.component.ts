import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-school-management-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './school-management-detail.component.html',
  styleUrls: ['./school-management-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolManagementDetailComponent {

  features = [
    {
      title: 'Student Management',
      description: 'Handle admissions, profiles, attendance, and academic records in one system.'
    },
    {
      title: 'Teacher Portal',
      description: 'Manage schedules, grading, subjects, and classroom activities efficiently.'
    },
    {
      title: 'Exams & Results',
      description: 'Automated exam scheduling, result calculation, and performance tracking.'
    }
  ];

  screenshots = [
    'assets/projects/school1.avif',
    'assets/projects/school2.avif',
    'assets/projects/school3.avif'
  ];

  techStack = [
    'Angular',
    '.NET 8 Web API',
    'SQL Server',
    'Entity Framework Core',
    'Bootstrap',
    'SCSS',
    'JWT Auth'
  ];
}
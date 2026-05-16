import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-examdynamics-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './examdynamics-detail.component.html',
  styleUrls: ['./examdynamics-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamdynamicsDetailComponent {

  problemsSolved = [
    {
      title: 'Centralized Exam Management',
      description:
        'Built a complete platform for handling exams, scheduling, students, teachers, and administration workflows efficiently.'
    },
    {
      title: 'Secure Authentication System',
      description:
        'Implemented JWT authentication, protected APIs, and role-based authorization for maximum security.'
    },
    {
      title: 'Responsive User Experience',
      description:
        'Designed a modern responsive interface optimized for desktop, tablet, and mobile devices.'
    },
    {
      title: 'Scalable Architecture',
      description:
        'Created reusable frontend modules and a clean backend architecture for long-term scalability.'
    }
  ];

  screenshots = [
    'assets/projects/examdynamics1.avif',
    'assets/projects/examdynamics2.avif',
    'assets/projects/examdynamics3.avif',
    ];

  techStack = [
    '.NET 8',
    'Angular',
    'SQL Server',
    'Entity Framework',
    'Bootstrap',
    'JWT',
    'Azure'
  ];

}
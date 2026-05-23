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

  screenshots = [
    'assets/projects/examdynamics1.avif',
    'assets/projects/examdynamics2.avif',
    'assets/projects/examdynamics3.avif'
  ];

  techStack = [
    '.NET 8',
    'Angular',
    'Bootstrap',
    'SCSS',
    'SQL Server',
    'Entity Framework',
    'JWT Authentication',
    'REST APIs',
    'Azure',
    'GitHub'
  ];

}
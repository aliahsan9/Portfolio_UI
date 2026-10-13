
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

  problems = [
    {
      number: '01',
      title: 'Fragmented academic information',
      description:
        'Student records and examination-related information can become difficult to organize when managed across disconnected records and workflows.',
      outcome: 'Centralize examination-related information'
    },
    {
      number: '02',
      title: 'Manual administrative work',
      description:
        'Coordinating examination activities and maintaining academic records can involve repetitive administrative effort.',
      outcome: 'Organize workflows in one application'
    },
    {
      number: '03',
      title: 'Different user responsibilities',
      description:
        'Students, teachers, and administrators may need different interfaces and permissions for their respective tasks.',
      outcome: 'Structure access around user responsibilities'
    },
    {
      number: '04',
      title: 'Disconnected application layers',
      description:
        'A feature can fail when frontend requests, API contracts, authentication, and database operations do not work together correctly.',
      outcome: 'Connect the full request lifecycle'
    }
  ];

  workflows = [
    {
      icon: 'bi bi-people',
      title: 'Student management',
      description:
        'Organize student-related records and make relevant information accessible through the application.'
    },
    {
      icon: 'bi bi-calendar2-check',
      title: 'Examination workflows',
      description:
        'Support examination-related operations and academic coordination through the available application features.'
    },
    {
      icon: 'bi bi-clipboard-data',
      title: 'Results and records',
      description:
        'Provide an application workflow for accessing and managing examination-related academic information.'
    },
    {
      icon: 'bi bi-speedometer2',
      title: 'Dashboards and navigation',
      description:
        'Present relevant information through structured screens designed around users and their tasks.'
    }
  ];

  engineeringDecisions = [
    {
      category: 'FRONTEND ENGINEERING',
      title: 'Build reusable interfaces with Angular',
      description:
        'Organize the interface into components and use Angular data binding to connect displayed information with application state and API responses.',
      benefit:
        'Keeps UI responsibilities organized and makes repeated interface patterns easier to maintain.',
      technologies: ['Angular', 'TypeScript', 'Bootstrap']
    },
    {
      category: 'BACKEND API DESIGN',
      title: 'Expose application functionality through REST APIs',
      description:
        'Use ASP.NET Core Web API endpoints to receive requests, process application operations, and return responses that the frontend can consume.',
      benefit:
        'Creates a defined communication boundary between the frontend and backend.',
      technologies: ['C#', '.NET 8', 'REST APIs']
    },
       {
      category: 'AUTHENTICATION',
      title: 'Establish identity for protected requests',
      description:
        'Use JWT-based authentication to support authenticated API access, with authorization rules determining which operations a user may perform.',
      benefit:
        "Separates verifying a user's identity from deciding what that user is allowed to do.",
      technologies: ['JWT', 'ASP.NET Core']
    },
    {
      category: 'DATA MODELING',
      title: 'Persist academic information relationally',
      description:
        'Use SQL Server and Entity Framework Core to work with structured application data and the relationships between relevant entities.',
      benefit:
        'Provides a consistent persistence layer for records used by application workflows.',
      technologies: ['SQL Server', 'Entity Framework Core']
    },
    {
      category: 'APPLICATION INTEGRATION',
      title: 'Keep frontend and backend contracts aligned',
      description:
        'Connect Angular interactions to API requests and account for response data, unsuccessful requests, and authentication requirements.',
      benefit:
        'Makes the complete user journey easier to trace and debug across application boundaries.',
      technologies: ['Angular', 'HTTP APIs', 'JSON']
    },
    {
      category: 'USER EXPERIENCE',
      title: 'Design for different screen sizes',
      description:
        'Use responsive layouts and reusable styling to make application screens usable across desktop, tablet, and mobile viewports.',
      benefit:
        'Reduces layout friction for users accessing the application from different devices.',
      technologies: ['Bootstrap', 'SCSS', 'Responsive Design']
    }
  ];

  requestFlow = [
    {
      icon: 'bi bi-window',
      label: '01 / PRESENTATION',
      title: 'Angular component',
      description:
        'A user interacts with a screen, and the frontend prepares the relevant request.'
    },
    {
      icon: 'bi bi-arrow-left-right',
      label: '02 / COMMUNICATION',
      title: 'HTTP request to the API',
      description:
        'The frontend sends a request to the relevant ASP.NET Core endpoint.'
    },
    {
      icon: 'bi bi-shield-check',
      label: '03 / PROCESSING',
      title: 'Authentication and application logic',
      description:
        'The backend applies the relevant authentication, authorization, validation, and business rules.'
    },
    {
      icon: 'bi bi-database',
      label: '04 / PERSISTENCE',
      title: 'SQL Server and data access',
      description:
        'Where required, the backend accesses or updates persistent records through its data-access implementation.'
    },
    {
      icon: 'bi bi-check2-circle',
      label: '05 / RESPONSE',
      title: 'Result returned to the UI',
      description:
        'The API returns a response that the frontend can use to update the interface or display an error.'
    }
  ];

  securityPractices = [
    {
      icon: 'bi bi-person-check',
      title: 'Authentication',
      description:
        'JWT-based authentication establishes the identity associated with a protected request.'
    },
    {
      icon: 'bi bi-shield-lock',
      title: 'Authorization',
      description:
        'Authorization policies and role checks should restrict protected operations to permitted users.'
    },
    {
      icon: 'bi bi-input-cursor-text',
      title: 'Input validation',
      description:
        'Validate incoming data at appropriate boundaries to reject invalid requests before processing.'
    },
    {
      icon: 'bi bi-database-check',
      title: 'Data integrity',
      description:
        'Use appropriate data constraints and application rules to help preserve valid relationships and records.'
    },
    {
      icon: 'bi bi-exclamation-triangle',
      title: 'Error handling',
      description:
        'Handle unsuccessful API responses predictably and avoid exposing sensitive implementation details to users.'
    },
    {
      icon: 'bi bi-bug',
      title: 'Debugging across layers',
      description:
        'Trace issues through the UI, HTTP request, backend processing, and database interaction instead of treating each layer in isolation.'
    }
  ];

  screenshots = [
    {
      src: 'assets/projects/examdynamics1.avif',
      alt: 'ExamDynamics application screen one',
      label: 'Application overview'
    },
    {
      src: 'assets/projects/examdynamics2.avif',
      alt: 'ExamDynamics application screen two',
      label: 'Academic workflows'
    },
    {
      src: 'assets/projects/examdynamics3.avif',
      alt: 'ExamDynamics application screen three',
      label: 'Application interface'
    }
  ];

  technologyGroups = [
    {
      category: 'Frontend',
      items: [
        'Angular',
        'TypeScript',
        'Bootstrap',
        'SCSS'
      ]
    },
    {
      category: 'Backend',
      items: [
        '.NET 8',
        'C#',
        'ASP.NET Core Web API',
        'REST APIs'
      ]
    },
    {
      category: 'Data & Security',
      items: [
        'SQL Server',
        'Entity Framework Core',
        'JWT Authentication'
      ]
    },
    {
      category: 'Development & Deployment',
      items: [
        'Git',
        'GitHub',
        'Vercel',
        'Azure'
      ]
    }
  ];
}

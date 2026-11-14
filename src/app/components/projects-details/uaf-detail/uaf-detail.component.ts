import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-uaf-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uaf-detail.component.html',
  styleUrls: ['./uaf-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UafDetailComponent {
  readonly repositoryUrl = 'https://github.com/aliahsan9/UAF_Management_System';

  scrollToEngineering(event: Event): void {
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('engineering')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  foundationAreas = [
    {
      title: 'Academic structure',
      description: 'Universities, campuses, faculties, departments, and programs.'
    },
    {
      title: 'Admissions',
      description: 'Applications, documents, review, and student conversion.'
    },
    {
      title: 'Student records',
      description: 'Registration, program assignment, and status changes.'
    },
    {
      title: 'Sessions and courses',
      description: 'Academic sessions, catalogue courses, and offerings.'
    },
    {
      title: 'Enrollment and timetable',
      description: 'Seat allocation, clash checks, and teaching rooms.'
    },
    {
      title: 'Identity and access',
      description: 'ASP.NET Core Identity, JWT, and role-based policies.'
    }
  ];

  academicProblems = [
    {
      number: '01',
      icon: 'bi bi-diagram-3',
      title: 'Academic records live apart',
      description:
        'Faculties, departments, programs, sessions, and student records are hard to trust when each one is maintained in a separate spreadsheet or tool.',
      impact: 'Model the university as one hierarchy'
    },
    {
      number: '02',
      icon: 'bi bi-file-earmark-text',
      title: 'Admissions is a paper trail',
      description:
        'Applications, required documents, reviewer decisions, and the step from applicant to registered student need a single auditable workflow.',
      impact: 'Keep ownership and decisions on the server'
    },
    {
      number: '03',
      icon: 'bi bi-person-badge',
      title: 'Roles are not interchangeable',
      description:
        'Students, teachers, registrars, department admins, and finance staff should not share the same operations or see one another’s records.',
      impact: 'Enforce access in the API'
    },
    {
      number: '04',
      icon: 'bi bi-database-lock',
      title: 'Concurrent work can corrupt records',
      description:
        'Two staff members accepting the same application, or two enrollments taking the last seat, should not both succeed.',
      impact: 'Protect critical writes with the database'
    }
  ];

  workflowSteps = [
    {
      icon: 'bi bi-diagram-3',
      title: 'Organize the institution',
      description:
        'Maintain the academic hierarchy, sessions, course catalogue, and scheduled offerings.'
    },
    {
      icon: 'bi bi-file-earmark-check',
      title: 'Run admissions',
      description:
        'Let applicants own their application, then record review, decisions, and conversion to a student.'
    },
    {
      icon: 'bi bi-person-vcard',
      title: 'Manage students',
      description:
        'Register students, assign programs, and move them through active, suspended, graduated, or withdrawn states.'
    },
    {
      icon: 'bi bi-calendar-week',
      title: 'Schedule teaching',
      description:
        'Publish offerings, enroll students, and place classes in rooms without overlapping people or space.'
    }
  ];

  engineeringDecisions = [
    {
      category: 'APPLICATION ARCHITECTURE',
      title: 'Separate domain rules from delivery',
      description:
        'The solution is split into Domain, Application, Infrastructure, API, and Tests projects so university rules do not live inside HTTP endpoints.',
      benefit:
        'Use cases stay testable, and persistence or API changes do not rewrite the domain.',
      technologies: ['ASP.NET Core', 'Clean Architecture', '.NET 10']
    },
    {
      category: 'ACADEMIC MODEL',
      title: 'Treat the university as a hierarchy',
      description:
        'Campuses, faculties, departments, and programs belong to a parent. Codes are normalized, duplicates are rejected, and deactivation is a status change rather than a delete.',
      benefit:
        'Historical records stay intact when a faculty or program is no longer active.',
      technologies: ['Domain entities', 'EF Core', 'SQL Server']
    },
    {
      category: 'ADMISSIONS',
      title: 'Derive the applicant from the token',
      description:
        'Applicant routes take the owner from the authenticated JWT subject. Callers cannot submit another person’s user id, and document review records the reviewer and time.',
      benefit:
        'An applicant cannot read, edit, or upload against someone else’s application.',
      technologies: ['JWT', 'Ownership checks', 'Audit records']
    },
    {
      category: 'DATA INTEGRITY',
      title: 'Make contested writes atomic',
      description:
        'Enrollment, admission decisions, and acceptance-to-student conversion use serializable transactions, row locks, and unique indexes so concurrent requests cannot create duplicate seats or students.',
      benefit:
        'The last seat and the registration number are allocated once.',
      technologies: ['SQL Server', 'Transactions', 'Unique indexes']
    },
    {
      category: 'ACCESS CONTROL',
      title: 'Keep privileges on the server',
      description:
        'Public registration always creates a Student account. Academic, admissions, and timetable operations are gated by role policies such as Registrar, DepartmentAdmin, and SuperAdmin.',
      benefit:
        'A client cannot grant itself a staff role by sending a role name.',
      technologies: ['ASP.NET Core Identity', 'Authorization policies', 'JWT']
    },
    {
      category: 'QUALITY',
      title: 'Document behavior before calling it production',
      description:
        'Use cases have unit tests, Problem Details handling, health checks, and development OpenAPI docs. Migrations, refresh tokens, and full SQL integration runs are still outstanding.',
      benefit:
        'The case study describes the foundation that exists, including what is not finished.',
      technologies: ['xUnit', 'FluentValidation', 'Serilog']
    }
  ];

  architectureLayers = [
    {
      icon: 'bi bi-globe2',
      title: 'API',
      label: 'HTTP',
      description:
        'Versioned minimal endpoints, authentication, authorization policies, middleware, and Problem Details responses.'
    },
    {
      icon: 'bi bi-diagram-3',
      title: 'Application',
      label: 'USE CASES',
      description:
        'Admissions, academic structure, students, sessions, offerings, and timetable workflows with validation.'
    },
    {
      icon: 'bi bi-bank',
      title: 'Domain',
      label: 'UNIVERSITY RULES',
      description:
        'Entities and lifecycle rules for programs, sessions, applications, enrollments, and student status.'
    },
    {
      icon: 'bi bi-database',
      title: 'Infrastructure',
      label: 'PERSISTENCE',
      description:
        'EF Core SQL Server mappings, repositories, Identity integration, and database constraints.'
    }
  ];

  securityPractices = [
    {
      icon: 'bi bi-person-lock',
      title: 'Authentication',
      description:
        'ASP.NET Core Identity issues short-lived JWTs. The API refuses to start without an issuer, audience, and signing key.'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Role policies',
      description:
        'Student, Teacher, DepartmentAdmin, Registrar, FinanceOfficer, HRManager, and SuperAdmin are enforced on the endpoint, not in a future UI.'
    },
    {
      icon: 'bi bi-file-earmark-lock',
      title: 'Document checks',
      description:
        'Admission uploads check extension, content type, and file signature, store a digest, and never use the client file name as a path.'
    },
    {
      icon: 'bi bi-key',
      title: 'Secret handling',
      description:
        'Database passwords and JWT signing keys stay in user secrets or environment variables, outside source control.'
    },
    {
      icon: 'bi bi-arrow-repeat',
      title: 'Idempotent conversion',
      description:
        'Accepting an application and creating the student record happen together, so a repeated request returns the same student.'
    },
    {
      icon: 'bi bi-clipboard2-check',
      title: 'Tests still to run',
      description:
        'Unit and authorization tests are written. They still need execution in a .NET 10 environment, and SQL concurrency tests are opt-in.'
    }
  ];

  technologyGroups = [
    {
      category: 'Backend',
      items: [
        'ASP.NET Core',
        '.NET 10',
        'C#',
        'Minimal APIs',
        'FluentValidation',
        'Problem Details'
      ]
    },
    {
      category: 'Data & Security',
      items: [
        'SQL Server',
        'Entity Framework Core',
        'ASP.NET Core Identity',
        'JWT Authentication'
      ]
    },
    {
      category: 'Engineering',
      items: [
        'Clean Architecture',
        'Serilog',
        'xUnit',
        'OpenAPI',
        'Scalar'
      ]
    }
  ];
}

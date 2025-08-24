import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { AboutService } from '../../services/about.service';
import { About } from '../../models/about.model';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [
    trigger('paragraphAnimation', [
      transition(':enter', [
        query('p', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class AboutComponent implements OnInit, AfterViewInit {
  aboutData!: About;
  aboutParagraphs: string[] = [];
  showScrollIndicator = false;
  particles: any[] = [];

  socialLinks = [
    { name: 'GitHub', url: 'https://github.com/aliahsan9', icon: 'fab fa-github', delay: 0.1 },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/ali-ahsan-6895a9315?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', icon: 'fab fa-linkedin-in', delay: 0.3 },
    { name: 'Twitter', url: 'https://x.com/AliAhsa00861384?t=cX7EqjpG_BysgFzODjR_qw&s=09', icon: 'fab fa-twitter', delay: 0.4 }
  ];

  skills = [
    { name: 'Angular', level: 90, color: '#dd0031', icon: 'bi bi-angular' },
    { name: 'ASP Core DotNet', level: 85, color: '#512bd4', icon: 'bi bi-stack' },
    { name: 'TypeScript', level: 85, color: '#3178c6', icon: 'bi bi-file-code' },
    { name: 'JavaScript', level: 85, color: '#f7df1e', icon: 'bi bi-js-square' },
    { name: 'HTML/CSS', level: 95, color: '#e34c26', icon: 'bi bi-code-slash' },
    { name: 'UI/UX Design', level: 75, color: '#64ffda', icon: 'bi bi-brush' }
  ];

  constructor(private aboutService: AboutService) {}

  ngOnInit(): void {
    this.createParticles();
    this.loadAboutData();
  }

  ngAfterViewInit(): void {
    this.hideScrollIndicatorAfterScroll();
  }

  // Fetch About Data
  loadAboutData(): void {
    this.aboutService.getAbout().subscribe({
      next: (data: About) => this.setAboutData(data),
      error: () => this.setAboutData(this.getDefaultAboutData())
    });
  }

  private setAboutData(data: About) {
    this.aboutData = data;
    this.aboutParagraphs = data.description.split('\n').filter(p => p.trim().length > 0);
  }

  private getDefaultAboutData(): About {
    return {
      id: 0,
      title: 'Full Stack Developer',
      name: 'Ali Ahsan',
      profileImageUrl: 'assets/Images/myImg.jpeg',
      description: `
Passionate frontend developer and problem solver with expertise in Angular, modern web technologies, and full-stack development using .NET and SQL Server.

I specialize in creating beautiful, responsive, and user-friendly web applications, with a strong focus on performance, accessibility, and clean code.

🔹 Tech Stack Expertise: Angular, TypeScript, HTML5, CSS3, Tailwind, Bootstrap, .NET Core, C#, SQL Server.  
🔹 Problem Solving & Algorithms: Active LeetCode problem solver, enhancing logical thinking and coding efficiency.  
🔹 Projects & Achievements: Built dynamic web apps, including portfolio sites, CRUD applications, and interactive dashboards.  
🔹 Passions: Learning new frameworks, contributing to open source, and developing scalable, maintainable software solutions.

I love transforming ideas into functional and visually appealing web experiences, continuously improving my skills, and sharing knowledge with the community. Let's build something amazing together!
`
    };
  }

  // Particles
  createParticles(): void {
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    this.particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 5 + 2,
      delay: Math.random() * 5
    }));
  }

  // Scroll Indicator
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollIndicator = window.scrollY < 100;
  }

  hideScrollIndicatorAfterScroll(): void {
    setTimeout(() => {
      this.showScrollIndicator = window.scrollY < 100;
    }, 3000);
  }

  // Profile 3D hover effect
  onImageHover(event: MouseEvent): void {
    const img = event.target as HTMLElement;
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const angleX = (y - centerY) / 10;
    const angleY = (centerX - x) / 10;

    img.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05)`;
    img.style.boxShadow = `${-angleY}px ${angleX}px 30px rgba(100, 255, 218, 0.3)`;
  }

  onImageLeave(): void {
    const img = document.querySelector('.profile-image') as HTMLElement;
    if (img) {
      img.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      img.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.createParticles();
  }
}

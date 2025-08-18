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
  showScrollIndicator = true;
  particles: any[] = [];
  aboutParagraphs: string[] = [];

  socialLinks = [
    { name: 'GitHub', url: 'https://github.com/aliahsan9', icon: 'fab fa-github', delay: 0.1 },
    { name: 'Facebook', url: 'https://github.com/aliahsan9', icon: 'fab fa-facebook-f', delay: 0.2 },
    { name: 'LinkedIn', url: 'https://github.com/aliahsan9', icon: 'fab fa-linkedin-in', delay: 0.3 },
    { name: 'Twitter', url: 'https://github.com/aliahsan9', icon: 'fab fa-twitter', delay: 0.4 }
  ];
    
  skills = [
    { name: 'Angular', level: 90, color: '#64ffda' },
    { name: 'ASP Core DotNet', level: 85, color: '#b197fc' },
    { name: 'TypeScript', level: 85, color: '#4dabf7' },
    { name: 'JavaScript', level: 85, color: '#ffa94d' },
    { name: 'HTML/CSS', level: 95, color: '#ff8787' },
    { name: 'UI/UX Design', level: 75, color: '#b197fc' }
  ];

  constructor(private aboutService: AboutService) {}

  ngOnInit(): void {
    this.createParticles();
    this.loadAboutData(); 
  }

  ngAfterViewInit(): void {
    this.hideScrollIndicatorAfterScroll();
  }

  loadAboutData(): void {
    this.aboutService.getAbout().subscribe({
      next: (data: About) => {
        this.aboutData = data;
        this.aboutParagraphs = data.description
          .split('\n')
          .filter(p => p.trim().length > 0);
      },
      error: () => {
        this.aboutData = {
          id: 0,
          title: 'Full Stack Developer',
          name: 'Ali Ahsan',
          profileImageUrl: 'assets/Images/myImg.jpeg',
          description:
            'Passionate frontend developer with expertise in Angular and modern web technologies.\n\nI create beautiful, responsive and user-friendly web applications with focus on performance and accessibility.'
        };
        this.aboutParagraphs = this.aboutData.description
          .split('\n')
          .filter(p => p.trim().length > 0);
      }
    });
  }

  createParticles(): void {
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 2,
        delay: Math.random() * 5
      });
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollIndicator = window.scrollY < 100;
  }

  hideScrollIndicatorAfterScroll(): void {
    setTimeout(() => {
      this.showScrollIndicator = window.scrollY < 100;
    }, 3000);
  }

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
    this.particles = [];
    this.createParticles();
  }
}

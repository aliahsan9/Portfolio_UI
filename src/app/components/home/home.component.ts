import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxTypedJsModule } from 'ngx-typed-js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NgxTypedJsModule]
})
export class HomeComponent implements OnInit {
  textPosition = { x: 0, y: 0 };
  particles: any[] = [];

  typedStrings = [
    'Ali Ahsan',
    'I build Full-Stack Apps',
    'Angular Developer',
    'ASP.NET Core Expert',
    'SQL Server Specialist',
    'Web Solutions Architect'
  ];

  ngOnInit(): void { 
    AOS.init({
      duration: 1000, 
      once: true,
      easing: 'ease-in-out'
    });

    this.createParticles();
    window.addEventListener('mousemove', this.updateParticleHover.bind(this));
  }

  moveTextWithMouse(event: MouseEvent) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveFactor = 20;

    this.textPosition = {
      x: (centerX - event.clientX) / moveFactor,
      y: (centerY - event.clientY) / moveFactor
    };
  }

  createParticles() {
    const count = window.innerWidth < 768 ? 20 : 40;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 4,
        delay: Math.random() * 20,
        speed: Math.random() * 5 + 3,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  updateParticleHover(event: MouseEvent) {
    const mouseX = event.clientX / window.innerWidth * 100;
    const mouseY = event.clientY / window.innerHeight * 100;
    this.particles.forEach(particle => {
      const dx = particle.x - mouseX;
      const dy = particle.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        particle.x += dx * 0.2;
        particle.y += dy * 0.2;
      }
    });
  }

  testimonials = [
    {
      name: 'M Jawad',
      title: 'Frontend Developer',
      feedback: 'Ali is a brilliant developer and communicator.',
      image: 'assets/Images/man1.jpg'
    },
    {
      name: 'Jawed Iqbal',
      title: 'Project Manager',
      feedback: 'Always delivers on time with great attention to detail.',
      image: 'assets/Images/man5.jpg'
    },
    {
      name: 'Mr. Ahmad',
      title: 'UX Designer',
      feedback: 'He transforms UI designs into beautiful web apps.',
      image: 'assets/Images/man7.jpg'
    }
  ];

  skills = [
    { name: 'Angular', level: 90 },
    { name: '.NET Core', level: 85 },
    { name: 'SQL Server', level: 80 },
    { name: 'JavaScript', level: 88 },
    { name: 'HTML & CSS', level: 95 },
    { name: 'Bootstrap', level: 90 },
    { name: 'Git & GitHub', level: 85 },
    { name: 'RESTful APIs', level: 80 }
  ];
}
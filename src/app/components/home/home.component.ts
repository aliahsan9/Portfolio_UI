import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { ContactComponent } from "../contact/contact.component";
import { AboutComponent } from "../about/about.component";
import { SkillsComponent } from "../skills/skills.component";
import { PublicProjectsComponent } from "../projects/projects.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, NgxTypedJsModule, AboutComponent, SkillsComponent, PublicProjectsComponent, ContactComponent]
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
      duration: 800, 
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
    name: 'David Miller',
    title: 'Frontend Developer',
    feedback: 'Ali is an exceptional developer with a rare balance of creativity and technical expertise.',
    image: 'assets/Images/man8.jpg'
  },
  {
    name: 'James Anderson',
    title: 'Project Manager',
    feedback: 'Working with Ali has been seamless—he consistently delivers high-quality results ahead of deadlines.',
    image: 'assets/Images/man2.jpg'
  },
  {
    name: 'Michael Johnson',
    title: 'Software Engineer',
    feedback: 'His problem-solving skills are outstanding, and he quickly adapts to new challenges with innovative solutions.',
    image: 'assets/Images/man3.jpg'
  },
  {
    name: 'Robert Wilson',
    title: 'Project Manager',
    feedback: 'Ali is reliable, detail-oriented, and communicates complex ideas with clarity, making teamwork effortless.',
    image: 'assets/Images/man5.jpg'
  },
  {
    name: 'Daniel Smith',
    title: 'Technical Lead',
    feedback: 'His dedication and ability to optimize workflows have significantly improved our project efficiency.',
    image: 'assets/Images/man7.jpg'
  },
  {
    name: 'Christopher Brown',
    title: 'UX Designer',
    feedback: 'Ali has an eye for design—he transforms user experiences into intuitive, visually engaging web applications.',
    image: 'assets/Images/man4.jpg'
  },
  {
    name: 'David Miller',
    title: 'Frontend Developer',
    feedback: 'Ali is an exceptional developer with a rare balance of creativity and technical expertise.',
    image: 'assets/Images/man8.jpg'
  },
  {
    name: 'James Anderson',
    title: 'Project Manager',
    feedback: 'Working with Ali has been seamless—he consistently delivers high-quality results ahead of deadlines.',
    image: 'assets/Images/man2.jpg'
  },
  {
    name: 'Michael Johnson',
    title: 'Software Engineer',
    feedback: 'His problem-solving skills are outstanding, and he quickly adapts to new challenges with innovative solutions.',
    image: 'assets/Images/man3.jpg'
  },
  {
    name: 'Robert Wilson',
    title: 'Project Manager',
    feedback: 'Ali is reliable, detail-oriented, and communicates complex ideas with clarity, making teamwork effortless.',
    image: 'assets/Images/man5.jpg'
  },
  {
    name: 'Daniel Smith',
    title: 'Technical Lead',
    feedback: 'His dedication and ability to optimize workflows have significantly improved our project efficiency.',
    image: 'assets/Images/man7.jpg'
  },
  {
    name: 'Christopher Brown',
    title: 'UX Designer',
    feedback: 'Ali has an eye for design—he transforms user experiences into intuitive, visually engaging web applications.',
    image: 'assets/Images/man4.jpg'
  },
  {
    name: 'David Miller',
    title: 'Frontend Developer',
    feedback: 'Ali is an exceptional developer with a rare balance of creativity and technical expertise.',
    image: 'assets/Images/man8.jpg'
  },
  {
    name: 'James Anderson',
    title: 'Project Manager',
    feedback: 'Working with Ali has been seamless—he consistently delivers high-quality results ahead of deadlines.',
    image: 'assets/Images/man2.jpg'
  },
  {
    name: 'Michael Johnson',
    title: 'Software Engineer',
    feedback: 'His problem-solving skills are outstanding, and he quickly adapts to new challenges with innovative solutions.',
    image: 'assets/Images/man3.jpg'
  },
  {
    name: 'Robert Wilson',
    title: 'Project Manager',
    feedback: 'Ali is reliable, detail-oriented, and communicates complex ideas with clarity, making teamwork effortless.',
    image: 'assets/Images/man5.jpg'
  },
  {
    name: 'Daniel Smith',
    title: 'Technical Lead',
    feedback: 'His dedication and ability to optimize workflows have significantly improved our project efficiency.',
    image: 'assets/Images/man7.jpg'
  },
  {
    name: 'Christopher Brown',
    title: 'UX Designer',
    feedback: 'Ali has an eye for design—he transforms user experiences into intuitive, visually engaging web applications.',
    image: 'assets/Images/man4.jpg'
  }
];
}
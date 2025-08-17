import { Component, OnInit } from '@angular/core';
import { SkillsService, Skill } from '../../services/skill.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  particles: {
    top: number;
    left: number;
    delay: number;
    duration: number;
    x: number;
    y: number;
  }[] = [];

  constructor(private skillsService: SkillsService) {}

  ngOnInit(): void {
    this.skillsService.getAll().subscribe({
      next: data => (this.skills = data),
      error: () => alert('Failed to load skills')
    });

    for (let i = 0; i < 50; i++) {
      this.particles.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 6 + Math.random() * 8,
        x: (Math.random() - 0.5) * 40, // Random movement X [-20, +20]
        y: (Math.random() - 0.5) * 40  // Random movement Y [-20, +20]
      });
    }
  }

  getProgress(level: string): number {
    switch (level.toLowerCase()) {
      case 'beginner': return 25;
      case 'intermediate': return 50;
      case 'advanced': return 75;
      case 'expert': return 100;
      default: return 60;
    }
  }
}

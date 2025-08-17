import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SkillsService } from '../../../services/skill.service';
import { Skill, SkillDto } from '../../../models/skill.model';

@Component({
  selector: 'app-manage-skills',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-skills.component.html',
  styleUrls: ['./manage-skills.component.scss']
})
export class ManageSkillsComponent implements OnInit {
  skills: Skill[] = [];
  skillForm!: FormGroup; 
  editMode = false;
  editId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private skillsService: SkillsService
  ) {}

  ngOnInit(): void {
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      level: ['', Validators.required]
    });

    this.loadSkills();
  }

  loadSkills(): void {
    this.skillsService.getAll().subscribe({
      next: data => this.skills = data,
      error: () => alert('Failed to load skills')
    });
  }

  submit(): void {
    if (this.skillForm.invalid) return;

    const skillDto: SkillDto = this.skillForm.value;

    if (this.editMode && this.editId !== null) {
      this.skillsService.update(this.editId, skillDto).subscribe({
        next: () => {
          alert('Skill updated');
          this.loadSkills();
          this.resetForm();
        },
        error: () => alert('Failed to update skill')
      });
    } else {
      this.skillsService.create(skillDto).subscribe({
        next: () => {
          alert('Skill created');
          this.loadSkills();
          this.skillForm.reset();
        },
        error: () => alert('Failed to create skill')
      });
    }
  }

  edit(skill: Skill): void {
    this.skillForm.patchValue(skill);
    this.editMode = true;
    this.editId = skill.id;
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    this.skillsService.delete(id).subscribe({
      next: () => {
        alert('Skill deleted');
        this.loadSkills();
      },
      error: () => alert('Failed to delete skill')
    });
  }

  resetForm(): void {
    this.skillForm.reset();
    this.editMode = false;
    this.editId = null;
  }
}

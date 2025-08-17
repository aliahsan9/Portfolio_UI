import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import AOS from 'aos';
import 'aos/dist/aos.css';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './manage-projects.component.html',
  styleUrls: ['./manage-projects.component.scss']
})
export class AdminProjectsComponent implements OnInit {
  projects: Project[] = [];
  projectForm: FormGroup;
  editingProjectId: number | null = null;

  constructor(private fb: FormBuilder, private projectService: ProjectService) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', Validators.required],
      gitHubLink: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    AOS.init(); // Initialize AOS
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
    });
  }

  onSubmit() {
    if (this.editingProjectId !== null) {
      this.projectService.updateProject(this.editingProjectId, this.projectForm.value).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    } else {
      this.projectService.addProject(this.projectForm.value).subscribe(() => {
        this.loadProjects();
        this.projectForm.reset();
      });
    }
  }

  editProject(project: Project) {
    this.editingProjectId = project.id!;
    this.projectForm.setValue({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      gitHubLink: project.gitHubLink
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProjectId = null;
    this.projectForm.reset();
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.loadProjects();
      });
    }
  }
}

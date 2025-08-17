import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ResumeService } from '../../../services/resume.service';

@Component({
  selector: 'app-admin-resume',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './manage-resume.component.html',
  styleUrls: ['./manage-resume.component.scss']
})
export class AdminResumeComponent implements OnInit {
  resumeForm: FormGroup;
  resumeId: number | null = null;

  constructor(private fb: FormBuilder, private resumeService: ResumeService) {
    this.resumeForm = this.fb.group({
      fileUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    AOS.init();
    this.loadResume();
  }

  loadResume() {
    this.resumeService.getResume().subscribe({
      next: (data) => {
        this.resumeForm.setValue({ fileUrl: data.fileUrl });
        this.resumeId = data.id!;
      },
      error: () => {
        this.resumeId = null;
      }
    });
  }

  onSubmit() {
    const resumeData = this.resumeForm.value;

    if (this.resumeId) {
      this.resumeService.updateResume(this.resumeId, resumeData).subscribe(() => {
        alert('Resume updated!');
      });
    } else {
      this.resumeService.createResume(resumeData).subscribe(() => {
        alert('Resume uploaded!');
        this.loadResume();
      });
    }
  }
}

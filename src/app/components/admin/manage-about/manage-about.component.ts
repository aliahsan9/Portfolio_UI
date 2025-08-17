import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AboutService } from '../../../services/about.service';
import { About } from '../../../models/about.model';
import { AboutDto } from '../../../models/about.dto';
   
@Component({
  selector: 'app-manage-about',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './manage-about.component.html',
  styleUrls: ['./manage-about.component.scss']
})
export class ManageAboutComponent implements OnInit {
  aboutForm!: FormGroup;
  aboutId: number = 0; 

  constructor(private fb: FormBuilder, private aboutService: AboutService ) {}

  ngOnInit(): void {
    this.aboutForm = this.fb.group({
      description: ['', Validators.required],
      profileImageUrl: ['', Validators.required]
    });

    this.loadAbout();
  }

  loadAbout(): void {
    this.aboutService.getAbout().subscribe({
      next: (data: About) => {
        this.aboutId = data.id;
        this.aboutForm.patchValue({
          description: data.description,
          profileImageUrl: data.profileImageUrl
        });
      },
      error: () => alert('Failed to load about data')
    });
  }

  saveAbout(): void {
    if (this.aboutForm.invalid) return;

    const aboutDto: AboutDto = this.aboutForm.value;
    this.aboutService.updateAbout(this.aboutId, aboutDto).subscribe({
      next: () => alert('About updated successfully'),
      error: () => alert('Failed to update about section')
    });
  }
}

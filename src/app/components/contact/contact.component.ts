import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import AOS from 'aos';
import { ContactService } from '../../services/contact.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports:[CommonModule,RouterModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  success = false;
  error = false;

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    AOS.init({ duration: 1000 });
  }

  onSubmit(): void {
    this.submitted = true;
    this.success = false;
    this.error = false;

    if (this.contactForm.invalid) return;

    this.contactService.submitMessage(this.contactForm.value).subscribe({
      next: () => {
        this.success = true;
        this.contactForm.reset();
        this.submitted = false;
      },
      error: () => this.error = true
    });
  }
} 
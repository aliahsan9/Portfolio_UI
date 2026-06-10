import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  selectedType = '';

  sendEmail(form: NgForm) {
    if (form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    emailjs.send(
      'service_5kj01gi',       // Service ID Here
      'template_jtloyfa',      // Template ID Here
      {
        name: form.value.name,
        email: form.value.email,
        project_type: form.value.projectType || 'Not Specified',
        message: form.value.message
      },
      '4lZ0i1d4IiwwRQV2x'       // Public Key
    )
    .then(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      form.resetForm();
      this.selectedType = '';
    })
    .catch((err: any) => {
      console.error('EmailJS Error:', err);
      this.isSubmitting = false;
      this.submitError = true;
    });
  }
}
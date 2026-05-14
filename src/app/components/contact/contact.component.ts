import { Component } from '@angular/core';
import emailjs from '@emailjs/browser';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports:[FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {

  sendEmail(form: NgForm) {

    if (form.invalid) return;

    emailjs.send(
      'service_5kj01gi',        // your Service ID
      'template_jtloyfa',       // replace this from EmailJS dashboard
      {
        name: form.value.name,
        email: form.value.email,
        message: form.value.message
      },
      '4lZ0i1d4IiwwRQV2x'       // Public Key ONLY
    )
    .then(() => {
      alert('Message sent successfully!');
      form.reset();
    })
    .catch((err: any) => {
      console.log('EmailJS Error:', err);
      alert('Failed to send message. Please try again.');
    });

  }
}
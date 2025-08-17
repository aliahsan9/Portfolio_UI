import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../../services/contact.service';
import { ContactMessage } from '../../../models/contact.model';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-contact',
  imports:[CommonModule,RouterModule],
  templateUrl: './manage-contacts.component.html',
  styleUrls: ['./manage-contacts.component.scss']
})
export class AdminContactComponent implements OnInit {
  messages: ContactMessage[] = [];

  constructor(private contactService: ContactService) {}
   
  ngOnInit(): void {
    AOS.init();
    this.loadMessages();
  }

  loadMessages(): void {
    this.contactService.getMessages().subscribe(data => this.messages = data);
  }

  deleteMessage(id: number): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.contactService.deleteMessage(id).subscribe(() => {
        this.messages = this.messages.filter(m => m.id !== id);
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports:[CommonModule,RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  ngOnInit(): void {
    AOS.init({ duration: 400 });
  }
}  
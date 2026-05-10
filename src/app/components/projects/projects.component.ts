import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import AOS from 'aos';
import 'aos/dist/aos.css';

@Component({
  selector: 'app-public-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class PublicProjectsComponent implements OnInit {
 

  ngOnInit(): void {
    // AOS.init({ duration: 100, once: true });
  }
} 
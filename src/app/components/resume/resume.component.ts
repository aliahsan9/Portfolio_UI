import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-resume',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class PublicResumeComponent implements OnInit {
  resumeUrl: string = 'assets/Resume1.pdf';
  safeResumeUrl: SafeResourceUrl | null = null;  

  constructor(private sanitizer: DomSanitizer) {}
 
  ngOnInit(): void {
    AOS.init({ duration: 1000 });

    // Convert resumeUrl into a safe resource for iframe
    this.safeResumeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.resumeUrl);
  }
}
 
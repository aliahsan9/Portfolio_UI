import { Component, OnInit } from '@angular/core';
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
 
  ngOnInit(): void {

      }
}
 
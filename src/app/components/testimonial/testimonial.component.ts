import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-testimonial',
  imports:[CommonModule, RouterModule],
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss']
})
export class TestimonialComponent {

  testimonials = [
    {
      name: 'John Smith',
      role: 'Startup Founder',
      message: 'Delivered an excellent full-stack web application. Clean code, fast delivery, and great communication throughout the project.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=12'
    },
    {
      name: 'Sarah Khan',
      role: 'Business Owner',
      message: 'Very professional developer. The API and dashboard were built exactly as required. Highly recommended for backend work.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=32'
    },
    {
      name: 'Michael Lee',
      role: 'UI/UX Designer',
      message: 'Converted my Figma design into a perfect responsive Angular UI. Pixel-perfect and smooth performance.',
      rating: 4,
      image: 'https://i.pravatar.cc/150?img=45'
    }
  ];
}
// src/app/services/about.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AboutDto } from '../models/about.dto';
import { AboutComponent } from '../components/about/about.component';
import { About } from '../models/about.model';

@Injectable({ providedIn: 'root' })
export class AboutService {
  private baseUrl = `${environment.apiUrl}/about`;

  constructor(private http: HttpClient) {}

  getAbout(): Observable<About> {
    return this.http.get<About>(this.baseUrl);
  } 

  createAbout(dto: AboutDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }

  updateAbout(id: number, dto: AboutDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }
}
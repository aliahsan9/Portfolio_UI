import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Skill {
  id: number;
  name: string;
  level: string;
}

export interface SkillDto {
  name: string;
  level: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private baseUrl = `${environment.apiUrl}/skills`;

  constructor(private http: HttpClient) {}

  // GET all skills
  getAll(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.baseUrl);
  }

  // POST a new skill
  create(skillDto: SkillDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, skillDto);
  }

  // PUT (update) a skill by ID
  update(id: number, skillDto: SkillDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, skillDto);
  }

  // DELETE a skill by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

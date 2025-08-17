import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Resume {
  id?: number;
  fileUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private apiUrl = `${environment.apiUrl}/resume`;

  constructor(private http: HttpClient) {}

  getResume(): Observable<Resume> {
    return this.http.get<Resume>(this.apiUrl);
  }

  createResume(resume: Resume): Observable<any> {
    return this.http.post(this.apiUrl, resume);
  }

  updateResume(id: number, resume: Resume): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, resume);
  }
}

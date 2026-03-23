import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DemoRequest {
  nom: string;
  email: string;
  entreprise: string;
  taille: string;
}

@Injectable({ providedIn: 'root' })
export class LandingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitDemoRequest(form: DemoRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/demo-request`,
      form
    );
  }
}

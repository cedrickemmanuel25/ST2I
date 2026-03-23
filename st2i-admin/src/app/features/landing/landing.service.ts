import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemoFormData {
  nom: string;
  email: string;
  entreprise: string;
  taille: string;
}

@Injectable({ providedIn: 'root' })
export class LandingService {
  private http = inject(HttpClient);

  submitDemo(data: DemoFormData): Observable<any> {
    return this.http.post('/api/demo-request', data);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Schedule {
  id: number;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  active: boolean;
  description?: string;
}

export interface ScheduleException {
  id: number;
  date: string;
  type: 'ferie' | 'conge' | 'exceptionnel';
  heure_debut?: string;
  heure_fin?: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/horaires`;

  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl);
  }

  createSchedule(data: Partial<Schedule>): Observable<Schedule> {
    return this.http.post<Schedule>(this.apiUrl, data);
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getExceptions(): Observable<ScheduleException[]> {
    // This endpoint wasn't specifically defined but implied for the list
    return this.http.get<ScheduleException[]>(`${this.apiUrl}/exceptions`);
  }

  addException(data: Partial<ScheduleException>): Observable<ScheduleException> {
    return this.http.post<ScheduleException>(`${this.apiUrl}/exceptions`, data);
  }

  checkToday(): Observable<any> {
    return this.http.get(`${this.apiUrl}/today`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Attendance {
  id: number;
  user_id: number;
  timestamp: string;
  type: 'arrivée' | 'départ';
  statut: 'succès' | 'hors_zone' | 'hors_horaires' | 'manuel';
  latitude?: number;
  longitude?: number;
  note?: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  };
  created_by?: {
    nom: string;
    prenom: string;
  };
}

export interface AttendanceListResponse {
  total: number;
  items: Attendance[];
}

export interface CalendarStat {
  date: string;
  present_count: number;
  absent_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pointage`;

  getHistory(params: any): Observable<AttendanceListResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<AttendanceListResponse>(`${this.apiUrl}/history`, { params: httpParams });
  }

  getCalendarStats(month: number, year: number): Observable<CalendarStat[]> {
    return this.http.get<CalendarStat[]>(`${this.apiUrl}/calendar-stats?month=${month}&year=${year}`);
  }

  getWeeklyMatrix(startDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/weekly-matrix?start_date=${startDate}`);
  }

  submitManualEntry(data: any): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/manual`, data);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardKPIs {
  total_users: number;
  daily_attendees: number;
  yesterday_attendees: number;
  attendance_rate: number;
  monthly_rate: number;
  latecomers: number;
  absents: number;
}

export interface AttendanceTrend {
  date: string;
  real_count: number;
  theoretical_count: number;
}

export interface DashboardAlert {
  id: number;
  user_name: string;
  type: string;
  statut: string;
  timestamp: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  getSummary(): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>(`${this.apiUrl}/summary`);
  }

  getTrends(days: number = 30): Observable<AttendanceTrend[]> {
    return this.http.get<AttendanceTrend[]>(`${this.apiUrl}/trends?days=${days}`);
  }

  getAlerts(limit: number = 5): Observable<DashboardAlert[]> {
    return this.http.get<DashboardAlert[]>(`${this.apiUrl}/alerts?limit=${limit}`);
  }

  getUserStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  exportReport(format: 'excel' | 'pdf', userId?: number): Observable<Blob> {
    let params = new HttpParams().set('type', format);
    if (userId) params = params.set('user_id', userId.toString());

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}

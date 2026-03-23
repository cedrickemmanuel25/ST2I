import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserListResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  getUsers(page = 1, limit = 10, search?: string, role?: string, statut?: string): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (statut) params = params.set('statut', statut);

    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User> & { mot_de_passe: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  generateQrCode(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/generate-qr`, {});
  }

  getQrCodeImage(id: number): Observable<{ qr_code_base64: string }> {
    return this.http.get<{ qr_code_base64: string }>(`${this.apiUrl}/${id}/qr-code`);
  }
}

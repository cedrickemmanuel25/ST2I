import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Attendance } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-presence-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Détails du Pointage</h2>
    <mat-dialog-content>
      <div class="detail-row">
        <label>Utilisateur :</label>
        <span>{{ data.attendance.user?.prenom }} {{ data.attendance.user?.nom }}</span>
      </div>
      <div class="detail-row">
        <label>Date & Heure :</label>
        <span>{{ data.attendance.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</span>
      </div>
      <div class="detail-row">
        <label>Type :</label>
        <span>{{ data.attendance.type | uppercase }}</span>
      </div>
      <div class="detail-row">
        <label>Statut :</label>
        <span [class]="'status-' + data.attendance.statut">{{ data.attendance.statut | titlecase }}</span>
      </div>
      <div class="detail-row" *ngIf="data.attendance.latitude">
        <label>Position :</label>
        <a [href]="'https://www.google.com/maps?q=' + data.attendance.latitude + ',' + data.attendance.longitude" target="_blank">
          <mat-icon>location_on</mat-icon> Voir sur Google Maps
        </a>
      </div>
      <div class="detail-row" *ngIf="data.attendance.note">
        <label>Note :</label>
        <p>{{ data.attendance.note }}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .detail-row {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      label { font-weight: bold; color: #666; font-size: 12px; margin-bottom: 4px; }
      span { font-size: 16px; }
      .status-succès { color: #2e7d32; font-weight: bold; }
      .status-hors_zone, .status-hors_horaires { color: #c62828; font-weight: bold; }
    }
  `]
})
export class PresenceDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { attendance: Attendance }) {}
}

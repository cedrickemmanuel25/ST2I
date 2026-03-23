import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AttendanceService } from '../../../core/services/attendance.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-presence-manual-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>Saisie Manuelle</h2>
    <mat-dialog-content>
      <form [formGroup]="manualForm" class="manual-form">
        <mat-form-field appearance="outline">
          <mat-label>Utilisateur</mat-label>
          <mat-select formControlName="user_id">
            <mat-option *ngFor="let user of users" [value]="user.id">
              {{ user.prenom }} {{ user.nom }} ({{ user.role }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Date & Heure</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="timestamp">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="arrivée">Arrivée</mat-option>
            <mat-option value="départ">Départ</mat-option>
            <mat-option value="absence_justifiée">Absence Justifiée</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Note / Justification</mat-label>
          <textarea matInput formControlName="note" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" [disabled]="manualForm.invalid || isLoading" (click)="onSubmit()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .manual-form { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
  `]
})
export class PresenceManualDialogComponent {
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);
  private userService = inject(UserService);
  dialogRef = inject(MatDialogRef<PresenceManualDialogComponent>);

  manualForm: FormGroup = this.fb.group({
    user_id: ['', Validators.required],
    timestamp: [new Date(), Validators.required],
    type: ['arrivée', Validators.required],
    note: ['', Validators.required]
  });

  users: User[] = [];
  isLoading = false;

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(1, 100).subscribe(res => {
      this.users = res.users;
    });
  }

  onSubmit(): void {
    if (this.manualForm.valid) {
      this.isLoading = true;
      this.attendanceService.submitManualEntry(this.manualForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: () => this.isLoading = false
      });
    }
  }
}

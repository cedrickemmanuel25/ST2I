import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { StatsService } from '../../../core/services/stats.service';
import { AttendanceService, Attendance } from '../../../core/services/attendance.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsPageComponent {
  private statsService = inject(StatsService);
  private attendanceService = inject(AttendanceService);
  private fb = inject(FormBuilder);

  filterForm: FormGroup = this.fb.group({
    userId: [null],
    format: ['excel']
  });

  previewData: Attendance[] = [];
  isLoading = false;
  displayedColumns: string[] = ['date', 'user', 'type', 'statut'];

  loadPreview(): void {
    this.isLoading = true;
    this.attendanceService.getHistory({ 
      user_id: this.filterForm.value.userId,
      limit: 10 
    }).subscribe({
      next: (res) => {
        this.previewData = res.items;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  exportReport(): void {
    const format = this.filterForm.value.format;
    const userId = this.filterForm.value.userId;
    
    this.statsService.exportReport(format, userId).subscribe(blob => {
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      saveAs(blob, `Rapport_Presence_${new Date().getTime()}.${extension}`);
    });
  }
}

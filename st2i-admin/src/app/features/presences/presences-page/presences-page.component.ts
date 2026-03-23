import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

import { AttendanceService, CalendarStat } from '../../../core/services/attendance.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { PresenceManualDialogComponent } from '../presence-manual-dialog/presence-manual-dialog.component';

@Component({
  selector: 'app-presences-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './presences-page.component.html',
  styleUrls: ['./presences-page.component.scss']
})
export class PresencesPageComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  currentDate = new Date();
  calendarDays: Date[] = [];
  calendarStats: CalendarStat[] = [];
  
  weeklyMatrix: any = null;
  users: User[] = [];
  
  isLoading = false;
  activeView: 'calendar' | 'weekly' = 'calendar';

  ngOnInit(): void {
    this.generateCalendar();
    this.loadData();
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(1, 100).subscribe(res => this.users = res.users);
  }

  generateCalendar(): void {
    const start = startOfWeek(startOfMonth(this.currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(this.currentDate), { weekStartsOn: 1 });
    
    this.calendarDays = [];
    let day = start;
    while (day <= end) {
      this.calendarDays.push(day);
      day = addDays(day, 1);
    }
  }

  loadData(): void {
    this.isLoading = true;
    if (this.activeView === 'calendar') {
      this.attendanceService.getCalendarStats(
        this.currentDate.getMonth() + 1, 
        this.currentDate.getFullYear()
      ).subscribe({
        next: (res) => {
          this.calendarStats = res;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      const start = startOfWeek(this.currentDate, { weekStartsOn: 1 });
      this.attendanceService.getWeeklyMatrix(format(start, 'yyyy-MM-dd')).subscribe({
        next: (res) => {
          this.weeklyMatrix = res;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  getDayStat(day: Date): CalendarStat | undefined {
    const dayStr = format(day, 'yyyy-MM-dd');
    return this.calendarStats.find(s => s.date === dayStr);
  }

  isCurrentMonth(day: Date): boolean {
    return isSameMonth(day, this.currentDate);
  }

  isToday(day: Date): boolean {
    return isSameDay(day, new Date());
  }

  prevMonth(): void {
    this.currentDate = addDays(startOfMonth(this.currentDate), -1);
    this.generateCalendar();
    this.loadData();
  }

  nextMonth(): void {
    this.currentDate = addDays(endOfMonth(this.currentDate), 1);
    this.generateCalendar();
    this.loadData();
  }

  openManualEntry(): void {
    const dialogRef = this.dialog.open(PresenceManualDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  exportWeekly(): void {
    // Implement excel export trigger
    alert('Export Excel en cours...');
  }
}

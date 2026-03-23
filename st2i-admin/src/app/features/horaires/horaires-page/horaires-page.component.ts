import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ScheduleService, Schedule, ScheduleException } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-horaires-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule
  ],
  templateUrl: './horaires-page.component.html',
  styleUrls: ['./horaires-page.component.scss']
})
export class HorairesPageComponent implements OnInit {
  private scheduleService = inject(ScheduleService);
  private fb = inject(FormBuilder);

  schedules: Schedule[] = [];
  exceptions: ScheduleException[] = [];
  isLoading = false;
  tolerance = 15; // Standard default

  scheduleForm: FormGroup = this.fb.group({
    jour_semaine: [0, Validators.required],
    heure_debut: ['08:00', Validators.required],
    heure_fin: ['17:00', Validators.required],
    description: ['']
  });

  exceptionForm: FormGroup = this.fb.group({
    date: [new Date(), Validators.required],
    type: ['ferie', Validators.required],
    description: ['', Validators.required],
    heure_debut: [null],
    heure_fin: [null]
  });

  days = [
    { value: 0, label: 'Lundi' },
    { value: 1, label: 'Mardi' },
    { value: 2, label: 'Mercredi' },
    { value: 3, label: 'Jeudi' },
    { value: 4, label: 'Vendredi' },
    { value: 5, label: 'Samedi' },
    { value: 6, label: 'Dimanche' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.scheduleService.getSchedules().subscribe({
      next: (res) => {
        this.schedules = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    this.scheduleService.getExceptions().subscribe({
        next: (res) => this.exceptions = res,
        error: () => {}
    });
  }

  onSubmitSchedule(): void {
    if (this.scheduleForm.valid) {
      this.isLoading = true;
      this.scheduleService.createSchedule(this.scheduleForm.value).subscribe({
        next: () => {
          this.loadData();
          this.scheduleForm.reset({ jour_semaine: 0, heure_debut: '08:00', heure_fin: '17:00' });
        },
        error: () => this.isLoading = false
      });
    }
  }

  onSubmitException(): void {
    if (this.exceptionForm.valid) {
      this.isLoading = true;
      this.scheduleService.addException(this.exceptionForm.value).subscribe({
        next: () => {
          this.loadData();
          this.exceptionForm.reset({ date: new Date(), type: 'ferie' });
        },
        error: () => this.isLoading = false
      });
    }
  }

  deleteSchedule(id: number): void {
    if (confirm('Supprimer cet horaire ?')) {
      this.scheduleService.deleteSchedule(id).subscribe(() => this.loadData());
    }
  }

  getDayLabel(value: number): string {
    return this.days.find(d => d.value === value)?.label || '';
  }
}

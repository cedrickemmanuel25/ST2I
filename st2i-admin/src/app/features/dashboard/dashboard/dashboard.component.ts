import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';
import { interval, Subscription, forkJoin } from 'rxjs';
import { StatsService, DashboardKPIs, DashboardAlert } from '../../../core/services/stats.service';
import { AttendanceService, Attendance } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private statsService = inject(StatsService);
  private attendanceService = inject(AttendanceService);
  private pollingSub?: Subscription;

  kpis?: DashboardKPIs;
  latestScans: Attendance[] = [];
  alerts: DashboardAlert[] = [];
  isLoading = false;
  lastRefresh = new Date();

  // Line Chart Config (Real vs Theoretical)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Présences Réelles',
        fill: true,
        borderColor: '#1E3A5F',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        tension: 0.4
      },
      {
        data: [],
        label: 'Effectif Théorique',
        borderColor: '#2E86C1',
        borderDash: [5, 5],
        fill: false,
        tension: 0
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  displayedColumns: string[] = ['user', 'type', 'time', 'duration', 'statut'];

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.refreshData();
    // Auto-refresh every 60 seconds
    this.pollingSub = interval(60000).subscribe(() => this.refreshData());
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  refreshData(): void {
    this.isLoading = true;
    
    forkJoin({
      summary: this.statsService.getSummary(),
      trends: this.statsService.getTrends(30),
      alerts: this.statsService.getAlerts(5),
      history: this.attendanceService.getHistory({ page: 1, limit: 10 })
    }).subscribe({
      next: (res) => {
        this.kpis = res.summary;
        this.alerts = res.alerts;
        this.latestScans = res.history.items;
        
        // Update Chart
        this.lineChartData.labels = res.trends.map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
        this.lineChartData.datasets[0].data = res.trends.map(t => t.real_count);
        this.lineChartData.datasets[1].data = res.trends.map(t => t.theoretical_count);
        
        this.lastRefresh = new Date();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getAttendanceTrend(): number {
    if (!this.kpis || this.kpis.yesterday_attendees === 0) return 0;
    return ((this.kpis.daily_attendees - this.kpis.yesterday_attendees) / this.kpis.yesterday_attendees) * 100;
  }

  getStatusColor(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'succès': return 'green';
      case 'hors_horaires': return 'orange';
      case 'absent': return 'red';
      default: return 'grey';
    }
  }
}

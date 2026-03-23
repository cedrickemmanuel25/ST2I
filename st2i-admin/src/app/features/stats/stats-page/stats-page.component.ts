import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';
import { StatsService, DashboardKPIs } from '../../../core/services/stats.service';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.scss']
})
export class StatsPageComponent implements OnInit {
  private statsService = inject(StatsService);
  kpis?: DashboardKPIs;
  isLoading = true;

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Présents', 'Absents', 'En retard'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#2E7D32', '#C62828', '#EF6C00']
    }]
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Taux de présence (%)', backgroundColor: '#2E86C1' }]
  };

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.statsService.getSummary().subscribe(res => {
      this.kpis = res;
      this.pieChartData.datasets[0].data = [
        res.daily_attendees,
        res.absents,
        res.latecomers
      ];
      this.isLoading = false;
    });

    this.statsService.getTrends(7).subscribe(trends => {
      this.barChartData.labels = trends.map(t => t.date);
      this.barChartData.datasets[0].data = trends.map(t => (t.real_count / t.theoretical_count) * 100);
    });
  }
}

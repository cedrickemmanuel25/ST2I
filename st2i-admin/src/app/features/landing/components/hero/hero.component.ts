import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { fadeInUp, staggerChildren } from '../../../../shared/animations';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  animations: [fadeInUp, staggerChildren]
})
export class HeroComponent implements OnInit, OnDestroy {
  scanActive = false;
  private scanInterval?: ReturnType<typeof setInterval>;

  trustItems = [
    { emoji: '🔐', label: 'JWT sécurisé' },
    { emoji: '📡', label: 'Temps réel' },
    { emoji: '📱', label: 'iOS & Android' },
    { emoji: '🛡️', label: 'QR dynamique' }
  ];

  ngOnInit(): void {
    // Animate QR scan effect every 3 seconds
    this.scanInterval = setInterval(() => {
      this.scanActive = true;
      setTimeout(() => this.scanActive = false, 1200);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.scanInterval) clearInterval(this.scanInterval);
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}

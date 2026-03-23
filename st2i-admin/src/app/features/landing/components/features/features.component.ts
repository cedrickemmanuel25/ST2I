import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staggerChildren } from '../../../../shared/animations';

interface Feature {
  icon: string; title: string; description: string;
  colorClass: string; glowClass: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  animations: [staggerChildren]
})
export class FeaturesComponent implements AfterViewInit {
  visible = false;

  features: Feature[] = [
    { icon: '📡', title: 'Scan QR Dynamique', colorClass: 'fi-blue', glowClass: 'fc-blue',
      description: 'QR Code unique par utilisateur avec rotation automatique quotidienne. Impossible à copier ou partager.' },
    { icon: '📊', title: 'Dashboard Temps Réel', colorClass: 'fi-indigo', glowClass: 'fc-indigo',
      description: 'KPIs critiques, courbes Chart.js et flux d\'alertes en direct. Mise à jour toutes les 60 secondes.' },
    { icon: '👥', title: 'Gestion des Équipes', colorClass: 'fi-violet', glowClass: 'fc-violet',
      description: 'CRUD complet, attribution de rôles (Admin / Employé / Étudiant) et génération de QR automatique.' },
    { icon: '⏰', title: 'Horaires Intelligents', colorClass: 'fi-cyan', glowClass: 'fc-cyan',
      description: 'Définissez des plages horaires avec exceptions. Calcul automatique des retards et alertes.' },
    { icon: '📑', title: 'Rapports & Exports', colorClass: 'fi-green', glowClass: 'fc-green',
      description: 'Générez des rapports mensuels. Export PDF et Excel avec filtres avancés.' },
    { icon: '🔔', title: 'Alertes & Notifications', colorClass: 'fi-amber', glowClass: 'fc-amber',
      description: 'Notifications email automatiques via APScheduler dès qu\'une anomalie est détectée.' }
  ];

  ngAfterViewInit(): void {
    const el = document.getElementById('features');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { this.visible = true; obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
  }
}

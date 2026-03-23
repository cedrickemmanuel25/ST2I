import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.scss']
})
export class BenefitsComponent {
  stats = [
    { value: '3+', label: 'Modules intégrés' },
    { value: '100%', label: 'API RESTful' },
    { value: 'JWT', label: 'Sécurisé' },
    { value: '60s', label: 'Refresh automatique' }
  ];
  benefits = [
    { icon: '⚡', title: 'Gain de temps', desc: 'Éliminez les feuilles de présence papier. Le pointage se fait en 1 seconde.' },
    { icon: '🎯', title: 'Précision maximale', desc: 'QR dynamique infalsifiable. Chaque pointage est horodaté et tracé.' },
    { icon: '🔒', title: 'Sécurité enterprise', desc: 'RBAC, JWT, rotation automatique des QR. Zéro compromis sur la sécurité.' },
    { icon: '📈', title: 'Analyse des données', desc: 'Visualisez les tendances, identifiez les patterns et prenez de meilleures décisions.' }
  ];
}

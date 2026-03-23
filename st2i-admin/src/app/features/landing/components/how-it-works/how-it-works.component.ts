import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideInLeft } from '../../../../shared/animations';

interface Step { num: number; icon: string; title: string; description: string; }

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
  animations: [slideInLeft]
})
export class HowItWorksComponent {
  steps: Step[] = [
    { num: 1, icon: '👤', title: 'Création du compte', description: 'L\'administrateur crée le profil de l\'employé et génère automatiquement son QR Code personnel sécurisé.' },
    { num: 2, icon: '📱', title: 'Scan via mobile', description: 'À l\'entrée, l\'employé scanne son QR Code via l\'application Flutter. Le pointage est enregistré en temps réel.' },
    { num: 3, icon: '📊', title: 'Suivi en temps réel', description: 'Le tableau de bord admin se met à jour instantanément. Les retards et absences déclenchent des alertes automatiques.' },
    { num: 4, icon: '📑', title: 'Rapports automatiques', description: 'À la fin du mois, générez en un clic un rapport complet exportable en PDF ou Excel.' }
  ];
}

import { Component, ElementRef, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent implements OnInit {
  isVisible = signal(false);

  steps = [
    { num: '01', title: 'Création du compte', desc: "L'administrateur crée le profil de l'employé et génère automatiquement son QR Code personnel sécurisé." },
    { num: '02', title: 'Scan via mobile', desc: "À l'entrée, l'employé scanne son QR Code via l'application Flutter. Le pointage est enregistré." },
    { num: '03', title: 'Suivi en temps réel', desc: "Le tableau de bord admin se met à jour instantanément. Les alertes sont déclenchées." },
    { num: '04', title: 'Rapports automatiques', desc: "Générez un rapport complet exportable en PDF ou Excel à la fin du mois." }
  ];

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.isVisible.set(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    
    observer.observe(this.el.nativeElement);
  }
}

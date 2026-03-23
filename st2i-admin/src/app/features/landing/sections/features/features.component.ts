import { Component, ElementRef, OnInit, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  isVisible = signal(false);

  features = [
    { icon: '📱', title: 'Scan QR Code', desc: 'Pointage en 1 seconde via caméra mobile' },
    { icon: '🔐', title: 'Sécurité avancée', desc: 'QR Code renouvelé automatiquement chaque jour' },
    { icon: '📍', title: 'Géolocalisation', desc: 'Vérification dans un rayon de 50m configurable' },
    { icon: '📊', title: 'Statistiques', desc: 'Dashboard complet avec exports Excel et PDF' },
    { icon: '🔔', title: 'Alertes', desc: 'Notifications automatiques absences et retards' },
    { icon: '👥', title: 'Multi-rôles', desc: 'Gestion admin, employés et étudiants' }
  ];

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.isVisible.set(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    
    observer.observe(this.el.nativeElement);
  }
}

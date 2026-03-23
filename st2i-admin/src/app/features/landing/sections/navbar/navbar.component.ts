import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  scrolled = signal(false);
  mobileOpen = signal(false);
  activeSection = signal('');

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
    this.checkScrollspy();
  }

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  scrollTo(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    this.mobileOpen.set(false);
  }

  private checkScrollspy(): void {
    const sections = ['hero', 'features', 'how-it-works', 'contact'];
    let current = '';
    for (const sec of sections) {
      const el = document.getElementById(sec);
      if (el && window.scrollY >= el.offsetTop - 100) {
        current = sec;
      }
    }
    if (this.activeSection() !== current) {
      this.activeSection.set(current);
    }
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LandingService } from '../../landing.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private landingService = inject(LandingService);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    entreprise: ['', Validators.required],
    taille: ['', Validators.required]
  });

  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.landingService.submitDemo(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.form.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue lors de l\'envoi de la demande. Veuillez réessayer.';
        console.error('Demo request failed', err);
      }
    });
  }
}

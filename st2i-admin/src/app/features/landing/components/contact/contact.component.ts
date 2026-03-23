import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LandingService } from '../../landing.service';
import { fadeInUp } from '../../../../shared/animations';

type FormState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [fadeInUp]
})
export class ContactComponent {
  form: FormGroup;
  state: FormState = 'idle';
  errorMessage = '';

  companyOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];

  constructor(private fb: FormBuilder, private landingService: LandingService) {
    this.form = this.fb.group({
      nom:        ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      entreprise: ['', Validators.required],
      taille:     ['', Validators.required]
    });
  }

  get isLoading() { return this.state === 'loading'; }
  get isSuccess() { return this.state === 'success'; }
  get isError()   { return this.state === 'error'; }

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.state = 'loading';
    this.landingService.submitDemoRequest(this.form.value).subscribe({
      next: () => { this.state = 'success'; this.form.reset(); },
      error: (err) => {
        this.state = 'error';
        this.errorMessage = err?.error?.detail || 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  retry(): void { this.state = 'idle'; }
}

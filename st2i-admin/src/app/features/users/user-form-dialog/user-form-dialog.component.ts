import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);

  userForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user?: User }) {
    this.isEditMode = !!data.user;
    this.userForm = this.fb.group({
      nom: [data.user?.nom || '', Validators.required],
      prenom: [data.user?.prenom || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      role: [data.user?.role || 'employé', Validators.required],
      statut: [data.user?.statut || 'actif', Validators.required],
      mot_de_passe: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const request = this.isEditMode 
        ? this.userService.updateUser(this.data.user!.id, this.userForm.value)
        : this.userService.createUser(this.userForm.value);

      request.subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: () => this.isLoading = false
      });
    }
  }
}

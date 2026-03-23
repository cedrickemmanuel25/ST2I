import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RelativeDatePipe } from '../../../core/pipes/relative-date.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { QrCodeDialogComponent } from '../qr-code-dialog/qr-code-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatSidenavModule,
    RelativeDatePipe
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  users: User[] = [];
  selectedUser: User | null = null;
  totalUsers = 0;
  isLoading = true;

  displayedColumns: string[] = ['avatar', 'fullName', 'email', 'role', 'statut', 'last_presence', 'actions'];
  
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  statutFilter = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadUsers();

    // Listen to filters
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.resetAndLoad());

    this.roleFilter.valueChanges.subscribe(() => this.resetAndLoad());
    this.statutFilter.valueChanges.subscribe(() => this.resetAndLoad());
  }

  loadUsers(): void {
    this.isLoading = true;
    const page = this.paginator ? this.paginator.pageIndex + 1 : 1;
    const limit = this.paginator ? this.paginator.pageSize : 10;
    
    this.userService.getUsers(
      page,
      limit,
      this.searchControl.value?.toString(),
      this.roleFilter.value?.toString(),
      this.statutFilter.value?.toString()
    ).subscribe({
      next: (res) => {
        this.users = res.users;
        this.totalUsers = res.total;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  resetAndLoad(): void {
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadUsers();
  }

  onPageChange(): void {
    this.loadUsers();
  }

  openUserForm(user?: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  viewQrCode(user: User): void {
    this.dialog.open(QrCodeDialogComponent, {
      width: '400px',
      data: { user }
    });
  }

  disableUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Désactiver l\'utilisateur',
        message: `Êtes-vous sûr de vouloir désactiver ${user.prenom} ${user.nom} ?`,
        confirmText: 'DÉSACTIVER',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id).subscribe(() => this.loadUsers());
      }
    });
  }

  onRowClick(user: User): void {
    this.selectedUser = user;
  }

  regenerateQr(user: User): void {
    this.userService.generateQrCode(user.id).subscribe(() => {
      this.loadUsers();
    });
  }
}

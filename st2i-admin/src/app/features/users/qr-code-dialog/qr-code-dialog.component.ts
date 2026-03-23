import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-qr-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './qr-code-dialog.component.html',
  styles: [`
    .qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 0;
    }
    .user-id-card {
        width: 300px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        padding: 24px;
        border-top: 5px solid #1e3a5f;
        text-align: center;
    }
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        .brand { font-weight: 800; font-size: 14px; color: #1e3a5f; }
    }
    .role-chip {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 10px;
        text-transform: uppercase;
        font-weight: 700;
        &.admin { background: #1e3a5f; color: #fff; }
        &.employé { background: #e3f2fd; color: #1976d2; }
        &.étudiant { background: #f5f5f5; color: #757575; }
    }
    .qr-wrapper {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 20px;
        display: inline-block;
    }
    .qr-image {
        width: 180px;
        height: 180px;
    }
    .user-meta {
        h3 { margin: 0; font-weight: 700; color: #1e3a5f; }
        p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
    }
    .expiry-note {
        margin-top: 16px;
        font-size: 11px;
        color: #94a3b8;
    }
  `]
})
export class QrCodeDialogComponent implements OnInit {
  private userService = inject(UserService);
  
  qrBase64: string | null = null;
  isLoading = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User }) {}

  ngOnInit(): void {
    this.userService.getQrCodeImage(this.data.user.id).subscribe({
      next: (res) => {
        this.qrBase64 = res.qr_code_base64;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  downloadQR(): void {
    if (!this.qrBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${this.qrBase64}`;
    link.download = `QR_${this.data.user.nom}_${this.data.user.prenom}.png`;
    link.click();
  }

  printQR(): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Impression QR Code - ${this.data.user.nom}</title></head>
          <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
            <h1>ST2I - Carte d'Accès</h1>
            <img src="data:image/png;base64,${this.qrBase64}" style="width:300px; height:300px; padding:20px; border:1px solid #ccc;">
            <h2 style="margin-top:20px;">${this.data.user.prenom} ${this.data.user.nom}</h2>
            <p style="font-size:18px; color:#555;">${this.data.user.role.toUpperCase()}</p>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}

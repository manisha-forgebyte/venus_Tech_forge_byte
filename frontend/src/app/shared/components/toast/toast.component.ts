import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="visible" [class]="'toast toast-' + toast.type" (click)="dismiss()">
      <span class="toast-icon" *ngIf="toast.type === 'success'">&#10003;</span>
      <span class="toast-icon" *ngIf="toast.type === 'error'">&#10007;</span>
      <span class="toast-icon" *ngIf="toast.type === 'warning'">&#9888;</span>
      <span class="toast-icon" *ngIf="toast.type === 'info'">&#8505;</span>
      <span class="toast-text">{{ toast.text }}</span>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 480px;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      cursor: pointer;
      animation: slideIn 0.3s ease-out, fadeOut 0.4s ease-in 4.6s forwards;
    }
    .toast-icon { font-size: 18px; flex-shrink: 0; }
    .toast-success { background: #01B574; }
    .toast-error { background: #E31A1A; }
    .toast-warning { background: #FFB547; color: #333; }
    .toast-info { background: #2B3674; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  visible = false;
  toast: ToastMessage = { text: '', type: 'info' };
  private sub!: Subscription;
  private timer: any;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe((msg) => {
      this.toast = msg;
      this.visible = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.dismiss(), 5000);
    });
  }

  dismiss(): void {
    this.visible = false;
    this.toastService.markClosed();
    clearTimeout(this.timer);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.timer);
  }
}

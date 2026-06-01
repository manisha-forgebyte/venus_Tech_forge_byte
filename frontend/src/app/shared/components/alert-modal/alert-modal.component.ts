import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';

export interface AlertMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
}

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-overlay" *ngIf="visible" (click)="dismiss()">
      <div class="alert-modal" (click)="$event.stopPropagation()">
        <div class="alert-header" [class]="'alert-header-' + alert.type">
          <h3 class="alert-title">{{ alert.title }}</h3>
          <button class="close-btn" (click)="dismiss()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="alert-body">
          <div class="alert-icon" [class]="'icon-' + alert.type">
            <span *ngIf="alert.type === 'success'">✓</span>
            <span *ngIf="alert.type === 'error'">✕</span>
            <span *ngIf="alert.type === 'warning'">⚠</span>
            <span *ngIf="alert.type === 'info'">ℹ</span>
          </div>
          <p class="alert-text">{{ alert.text }}</p>
        </div>
        <div class="alert-footer">
          <button class="btn-ok" (click)="dismiss()">OK</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 11000;
      animation: fadeIn 0.2s ease-out;
    }

    .alert-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
      max-width: 450px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    .alert-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 2px solid #E2E8F0;
    }

    .alert-header-success { border-bottom-color: #01B574; background: rgba(1, 181, 116, 0.05); }
    .alert-header-error { border-bottom-color: #E31A1A; background: rgba(227, 26, 26, 0.05); }
    .alert-header-warning { border-bottom-color: #FFB547; background: rgba(255, 181, 71, 0.05); }
    .alert-header-info { border-bottom-color: #2B3674; background: rgba(43, 54, 116, 0.05); }

    .alert-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #152238;
    }

    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      color: #718096;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #152238;
    }

    .alert-body {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px;
    }

    .alert-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }

    .icon-success { background: rgba(1, 181, 116, 0.1); color: #01B574; }
    .icon-error { background: rgba(227, 26, 26, 0.1); color: #E31A1A; }
    .icon-warning { background: rgba(255, 181, 71, 0.1); color: #FF9800; }
    .icon-info { background: rgba(43, 54, 116, 0.1); color: #2B3674; }

    .alert-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4A5568;
      flex: 1;
    }

    .alert-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #E2E8F0;
      background: #F8F9FA;
    }

    .btn-ok {
      padding: 10px 24px;
      background: #2B3674;
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-ok:hover {
      background: #1a1f4a;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class AlertModalComponent implements OnInit, OnDestroy {
  visible = false;
  alert: AlertMessage = { text: '', type: 'info', title: 'Alert' };
  private sub!: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.sub = this.alertService.alert$.subscribe((msg) => {
      this.alert = msg;
      this.visible = true;
    });
  }

  dismiss(): void {
    this.visible = false;
    this.alertService.markClosed();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

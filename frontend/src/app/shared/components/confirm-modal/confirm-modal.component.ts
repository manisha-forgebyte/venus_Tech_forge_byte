import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmService, ConfirmMessage } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-overlay" *ngIf="visible" (click)="dismiss()">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <div class="confirm-header">
          <h3 class="confirm-title">{{ message.title }}</h3>
          <button class="close-btn" (click)="dismiss()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="confirm-body">
          <p class="confirm-text">{{ message.text }}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn-cancel" (click)="dismiss()">{{ message.cancelText || 'Cancel' }}</button>
          <button class="btn-confirm" (click)="confirm()">{{ message.okText || 'OK' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-overlay {
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

    .confirm-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
      max-width: 450px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    .confirm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 2px solid #3182CE;
      background: rgba(49, 130, 206, 0.05);
    }

    .confirm-title {
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

    .confirm-body {
      padding: 24px;
    }

    .confirm-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4A5568;
    }

    .confirm-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #E2E8F0;
      background: #F8F9FA;
    }

    .btn-cancel {
      padding: 10px 24px;
      background: #E2E8F0;
      border: none;
      border-radius: 6px;
      color: #152238;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-cancel:hover {
      background: #CBD5E0;
    }

    .btn-confirm {
      padding: 10px 24px;
      background: #3182CE;
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-confirm:hover {
      background: #2c5aa0;
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
export class ConfirmModalComponent implements OnInit, OnDestroy {
  visible = false;
  message: ConfirmMessage = { text: '', title: 'Confirm' };
  private sub!: Subscription;

  constructor(private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.sub = this.confirmService.confirm$.subscribe((msg) => {
      this.message = msg;
      this.visible = true;
    });
  }

  confirm(): void {
    this.visible = false;
    this.confirmService.resolve(true);
  }

  dismiss(): void {
    this.visible = false;
    this.confirmService.resolve(false);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

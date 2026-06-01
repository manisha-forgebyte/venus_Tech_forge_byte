import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  private active = false;

  show(text: string, type: ToastMessage['type'] = 'info'): void {
    
    if (this.active) return;
    this.active = true;
    this.toastSubject.next({ text, type });
  }

  success(text: string): void { this.show(text, 'success'); }
  error(text: string): void { this.show(text, 'error'); }
  warning(text: string): void { this.show(text, 'warning'); }
  info(text: string): void { this.show(text, 'info'); }

  
  markClosed(): void { this.active = false; }
}

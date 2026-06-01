import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AlertMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertSubject = new Subject<AlertMessage>();
  alert$ = this.alertSubject.asObservable();

  private active = false;

  show(text: string, title: string = 'Alert', type: AlertMessage['type'] = 'info'): void {
    this.active = true;
    this.alertSubject.next({ text, type, title });
  }

  success(text: string, title: string = 'Success'): void { this.show(text, title, 'success'); }
  error(text: string, title: string = 'Error'): void { this.show(text, title, 'error'); }
  warning(text: string, title: string = 'Warning'): void { this.show(text, title, 'warning'); }
  info(text: string, title: string = 'Information'): void { this.show(text, title, 'info'); }

  
  markClosed(): void { this.active = false; }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmMessage {
  text: string;
  title: string;
  okText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private confirmSubject = new Subject<ConfirmMessage>();
  confirm$ = this.confirmSubject.asObservable();

  private resultSubject = new Subject<boolean>();

  show(text: string, title: string = 'Confirm', okText: string = 'OK', cancelText: string = 'Cancel'): Promise<boolean> {
    this.confirmSubject.next({ text, title, okText, cancelText });
    
    return new Promise(resolve => {
      const sub = this.resultSubject.subscribe(result => {
        resolve(result);
        sub.unsubscribe();
      });
    });
  }

  resolve(confirmed: boolean): void {
    this.resultSubject.next(confirmed);
  }
}

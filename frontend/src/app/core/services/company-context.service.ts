import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyContextService {
  private currentCompanySubject = new BehaviorSubject<any>(null);
  currentCompany$: Observable<any> = this.currentCompanySubject.asObservable();

  constructor() {
    
    const saved = localStorage.getItem('selectedCompany');
    if (saved) {
      try {
        this.currentCompanySubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved company', e);
      }
    }
  }

  setCompany(company: any) {
    this.currentCompanySubject.next(company);
    if (company) {
      localStorage.setItem('selectedCompany', JSON.stringify(company));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }

  getCompany() {
    return this.currentCompanySubject.value;
  }
}

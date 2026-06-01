import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class DateFormatterService {

  
  formatToDisplay(val: any): string {
    if (!val) return '';
    const date = this.parseDate(val);
    if (!date) return '';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  }

  
  formatToInputDate(val: any): string {
    if (!val) return '';
    const date = this.parseDate(val);
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  
  parseDisplayFormat(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900) {
        return new Date(year, month - 1, day);
      }
    }
    
    return null;
  }

  
  parseDisplayFormatToIso(dateStr: string): string {
    const date = this.parseDisplayFormat(dateStr);
    if (!date) return '';
    return this.formatToInputDate(date);
  }

  
  formatToIsoWithTime(val: any, hours: number = 0, minutes: number = 0, seconds: number = 0): string {
    if (!val) return '';
    const date = this.parseDate(val);
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    
    return `${year}-${month}-${day}T${h}:${m}:${s}`;
  }

  
  private parseDate(val: any): Date | null {
    if (!val) return null;
    
    
    if (val instanceof Date) {
      return !isNaN(val.getTime()) ? val : null;
    }
    
    const s = val.toString().trim();
    
    
    if (s.includes('T')) {
      const d = new Date(s);
      return !isNaN(d.getTime()) ? d : null;
    }
    
    if (s.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = new Date(s + 'T00:00:00');
      return !isNaN(d.getTime()) ? d : null;
    }
    
    
    const slashParts = s.split('/');
    if (slashParts.length === 3) {
      const mm = parseInt(slashParts[0], 10);
      const dd = parseInt(slashParts[1], 10);
      const yyyy = parseInt(slashParts[2], 10);
      
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && yyyy > 1900) {
        return new Date(yyyy, mm - 1, dd);
      }
    }
    
    
    const dashParts = s.split('-');
    if (dashParts.length === 3) {
      const mm = parseInt(dashParts[0], 10);
      const dd = parseInt(dashParts[1], 10);
      const yyyy = parseInt(dashParts[2], 10);
      
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && yyyy > 1900) {
        return new Date(yyyy, mm - 1, dd);
      }
    }
    
    
    if (slashParts.length === 3) {
      const dd = parseInt(slashParts[0], 10);
      const mm = parseInt(slashParts[1], 10);
      const yyyy = parseInt(slashParts[2], 10);
      
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && yyyy > 1900) {
        return new Date(yyyy, mm - 1, dd);
      }
    }
    
    return null;
  }
}

export class MBRAuthorizationValidator {
  
  static validateAuthorizationEffectiveDate(date: string | Date): boolean {
    if (!date) return false;
    const d = this.parseDate(date);
    return d !== null && !isNaN(d.getTime());
  }

  static getAuthorizationEffectiveDateError(date: string | Date): string | null {
    if (!date) {
      return 'Authorization effective date is required';
    }
    const d = this.parseDate(date);
    if (d === null || isNaN(d.getTime())) {
      return 'Invalid date format. Use YYYY-MM-DD (e.g., 2026-04-10)';
    }
    return null;
  }

  
  static validateCancellationDocketNumber(docket: string): boolean {
    if (!docket) return true; 
    const trimmed = docket.trim();
    if (trimmed.length > 15) return false;
    
    const docketRegex = /^\d{4}-\d{1,4}-\d{3}$/;
    return docketRegex.test(trimmed);
  }

  static getCancellationDocketNumberError(docket: string): string | null {
    if (!docket) return null; 
    const trimmed = docket.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 15) {
      return `Docket number exceeds maximum length of 15 characters (found ${trimmed.length})`;
    }
    const docketRegex = /^\d{4}-\d{1,4}-\d{3}$/;
    if (!docketRegex.test(trimmed)) {
      return 'Docket number format must be XXXX-X-XXX, XXXX-XX-XXX, XXXX-XXX-XXX, or XXXX-XXXX-XXX (e.g., 2026-1-001)';
    }
    return null;
  }

  
  static validateCancellationEffectiveDate(date: string | Date, authEffectiveDate?: string | Date): boolean {
    if (!date) return true; 
    const d = this.parseDate(date);
    if (d === null || isNaN(d.getTime())) return false;
    
    if (authEffectiveDate) {
      const authDate = this.parseDate(authEffectiveDate);
      if (authDate !== null && !isNaN(authDate.getTime())) {
        
        authDate.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        if (d < authDate) return false;
      }
    }
    return true;
  }

  static getCancellationEffectiveDateError(date: string | Date, authEffectiveDate?: string | Date): string | null {
    if (!date) return null; 
    
    const d = this.parseDate(date);
    if (d === null || isNaN(d.getTime())) {
      return 'Invalid date format. Use YYYY-MM-DD (e.g., 2026-04-10)';
    }

    if (authEffectiveDate) {
      const authDate = this.parseDate(authEffectiveDate);
      if (authDate !== null && !isNaN(authDate.getTime())) {
        authDate.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        if (d < authDate) {
          return `Cancellation date must be on or after authorization effective date (${this.formatDate(authDate)})`;
        }
      }
    }
    return null;
  }

  
  static parseDate(value: string | Date): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return value;
    }

    const s = String(value).trim();
    if (!s) return null;

    
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(s + 'T00:00:00Z');
      if (!isNaN(d.getTime())) return d;
    }

    
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    }

    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const parts = s.split('/');
      let m = parseInt(parts[0], 10);
      let d = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);

      
      if (m > 12) {
        const tmp = m;
        m = d;
        d = tmp;
      }

      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  }

  
  static formatDate(date: Date | null): string {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  
  static toIsoDateTime(value: any): string | null {
    const d = this.parseDate(value);
    if (!d || isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}T00:00:00`;
  }

  
  static validateAuthorizationRecord(record: any): {
    valid: boolean;
    errors: { [key: string]: string };
  } {
    const errors: { [key: string]: string } = {};

    
    if (record.authorizationEffectiveDate || record.authorization_effective_date) {
      const dateVal = record.authorizationEffectiveDate || record.authorization_effective_date;
      const err = this.getAuthorizationEffectiveDateError(dateVal);
      if (err) errors['authorizationEffectiveDate'] = err;
    } else {
      errors['authorizationEffectiveDate'] = 'Authorization effective date is required';
    }

    
    if (record.cancellationDocketNumber || record.cancellation_docket_number) {
      const docketVal = record.cancellationDocketNumber || record.cancellation_docket_number;
      const err = this.getCancellationDocketNumberError(docketVal);
      if (err) errors['cancellationDocketNumber'] = err;
    }

    
    if (record.cancellationEffectiveDate || record.cancellation_effective_date) {
      const dateVal = record.cancellationEffectiveDate || record.cancellation_effective_date;
      const authDateVal = record.authorizationEffectiveDate || record.authorization_effective_date;
      const err = this.getCancellationEffectiveDateError(dateVal, authDateVal);
      if (err) errors['cancellationEffectiveDate'] = err;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

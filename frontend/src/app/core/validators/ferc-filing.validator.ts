export class FERCFilingValidator {
  
  static validateReportingEntityCid(cid: string): boolean {
    if (!cid) return false;
    const cidRegex = /^C\d{6}$/;
    return cidRegex.test(cid.toUpperCase().trim());
  }

  
  static getCidErrorMessage(cid: string): string | null {
    if (!cid) {
      return 'Company Identifier (CID) is required';
    }
    const trimmed = cid.toUpperCase().trim();
    if (!trimmed.startsWith('C')) {
      return 'CID must start with "C"';
    }
    const digits = trimmed.substring(1);
    if (digits.length !== 6) {
      return `CID must have exactly 6 digits after "C" (found ${digits.length})`;
    }
    if (!/^\d+$/.test(digits)) {
      return 'CID digits must be numeric';
    }
    return null;
  }

  
  static validateERegEmail(email: string): boolean {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  
  static getEmailErrorMessage(email: string): string | null {
    if (!email) {
      return 'eRegistered email is required';
    }
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      return 'Email must contain "@" symbol';
    }
    if (!trimmed.includes('.')) {
      return 'Email must contain a domain (e.g., example.com)';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Invalid email format';
    }
    return null;
  }

  
  static validateRecordTypeCd(recordType: string): boolean {
    if (!recordType) return false;
    const trimmed = recordType.trim();
    return trimmed === 'New' || trimmed === 'Update';
  }

  
  static getRecordTypeCdErrorMessage(recordType: string): string | null {
    if (!recordType) {
      return 'Record Type is required';
    }
    const trimmed = recordType.trim();
    if (trimmed !== 'New' && trimmed !== 'Update') {
      return 'Record Type must be either "New" or "Update"';
    }
    return null;
  }

  
  static validateReferenceId(referenceId: string | number, recordType?: string): boolean {
    
    if (recordType === 'New') {
      return true;
    }
    
    
    if (!referenceId) return false;
    
    const numValue = typeof referenceId === 'string' ? parseInt(referenceId.trim(), 10) : referenceId;
    return !isNaN(numValue) && Number.isInteger(numValue) && numValue > 0;
  }

  
  static getReferenceIdErrorMessage(referenceId?: string | number, recordType?: string): string | null {
    
    if (!recordType || recordType === 'New') {
      return null;
    }

    
    if (!referenceId) {
      return 'Reference ID is required when updating an existing record';
    }

    const trimmed = typeof referenceId === 'string' ? referenceId.trim() : String(referenceId);
    
    if (!trimmed) {
      return 'Reference ID is required when updating an existing record';
    }

    const numValue = typeof referenceId === 'string' ? parseInt(trimmed, 10) : referenceId;
    
    if (isNaN(numValue)) {
      return 'Reference ID must be a valid number';
    }

    if (!Number.isInteger(numValue)) {
      return 'Reference ID must be a whole number (no decimals)';
    }

    if (numValue <= 0) {
      return 'Reference ID must be a positive number';
    }

    return null;
  }

  
  static parseDate(dateStr: string, format?: 'US' | 'ISO' | 'EU'): Date | null {
    if (!dateStr) return null;

    const trimmed = dateStr.trim();
    let date: Date | null = null;

    
    if (format === 'ISO' || !format) {
      const isoRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
      const isoMatch = trimmed.match(isoRegex);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (this.isValidDate(date) && date.getFullYear() === parseInt(year)) {
          return date;
        }
      }
    }

    
    if (format === 'US' || !format) {
      const usRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
      const usMatch = trimmed.match(usRegex);
      if (usMatch) {
        const [, month, day, year] = usMatch;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (this.isValidDate(date) && date.getFullYear() === parseInt(year)) {
          return date;
        }
      }
    }

    
    if (format === 'EU' || !format) {
      const euRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
      const euMatch = trimmed.match(euRegex);
      if (euMatch) {
        const [, day, month, year] = euMatch;
        const monthNum = parseInt(month);
        const dayNum = parseInt(day);
        
        if (dayNum > 12) {
          date = new Date(parseInt(year), monthNum - 1, dayNum);
          if (this.isValidDate(date) && date.getFullYear() === parseInt(year)) {
            return date;
          }
        }
      }
    }

    return null;
  }

  
  static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  
  static validateDate(dateStr: string, options?: { minDate?: string; maxDate?: string }): boolean {
    const date = this.parseDate(dateStr);
    if (!date) return false;

    
    if (options?.minDate) {
      const minDate = new Date(options.minDate);
      if (date < minDate) {
        return false;
      }
    }
    if (options?.maxDate) {
      const maxDate = new Date(options.maxDate);
      if (date > maxDate) {
        return false;
      }
    }

    return true;
  }

  
  static getDateErrorMessage(dateStr: string, options?: { minDate?: string; maxDate?: string }): string | null {
    if (!dateStr) {
      return 'Date is required';
    }

    if (!dateStr.trim()) {
      return 'Date is required';
    }

    const date = this.parseDate(dateStr);
    if (!date) {
      return 'Invalid date format. Use MM/DD/YYYY, YYYY-MM-DD, or DD/MM/YYYY';
    }

    
    if (options?.minDate) {
      const minDate = new Date(options.minDate);
      minDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < minDate) {
        return `Date must be on or after ${options.minDate}`;
      }
    }
    if (options?.maxDate) {
      const maxDate = new Date(options.maxDate);
      maxDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date > maxDate) {
        return `Date must be on or before ${options.maxDate}`;
      }
    }

    return null;
  }

  
  static validateFilingSubmission(cid: string, email: string, recordType?: string, referenceId?: string | number): { valid: boolean; cidError?: string; emailError?: string; recordTypeError?: string; referenceIdError?: string } {
    const cidError = this.getCidErrorMessage(cid);
    const emailError = this.getEmailErrorMessage(email);
    const recordTypeError = recordType ? this.getRecordTypeCdErrorMessage(recordType) : undefined;
    const referenceIdError = this.getReferenceIdErrorMessage(referenceId, recordType);

    return {
      valid: !cidError && !emailError && !recordTypeError && !referenceIdError,
      cidError: cidError || undefined,
      emailError: emailError || undefined,
      recordTypeError: recordTypeError || undefined,
      referenceIdError: referenceIdError || undefined
    };
  }
}

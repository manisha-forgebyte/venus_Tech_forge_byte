export class MBRSelfLimitationValidator {
  
  private static readonly REGION_CODES = ['NW', 'SW', 'CE', 'SPP', 'NE', 'SE'];

  
  static validateRecordTypeCd(recordType: string): boolean {
    if (!recordType || typeof recordType !== 'string') return false;
    const valid = ['New', 'Update', 'Deactivate'].includes(recordType.trim());
    return valid;
  }

  
  static getRecordTypeCdError(recordType: string): string | null {
    if (!recordType || recordType.trim() === '') {
      return 'Record Type is required';
    }
    if (!this.validateRecordTypeCd(recordType)) {
      return 'Record Type must be "New", "Update", or "Deactivate"';
    }
    return null;
  }

  
  static validateRegionCd(regionCode: string): boolean {
    if (!regionCode || typeof regionCode !== 'string') return false;
    return this.REGION_CODES.includes(regionCode.trim().toUpperCase());
  }

  
  static getRegionCdError(regionCode: string): string | null {
    if (!regionCode || regionCode.trim() === '') {
      return 'Region is required';
    }
    if (!this.validateRegionCd(regionCode)) {
      const validCodes = this.REGION_CODES.join(', ');
      return `Region must be one of: ${validCodes}`;
    }
    return null;
  }

  
  static validateReferenceId(referenceId: string | null | undefined, recordType: string): boolean {
    
    if (recordType !== 'Update') {
      return true;
    }

    
    if (!referenceId || String(referenceId).trim() === '') {
      return false;
    }

    const refId = parseInt(String(referenceId), 10);
    return !isNaN(refId) && refId > 0;
  }

  
  static getReferenceIdError(referenceId: string | null | undefined, recordType: string): string | null {
    
    if (recordType !== 'Update') {
      return null;
    }

    if (!referenceId || String(referenceId).trim() === '') {
      return 'Reference ID is required for Update record type';
    }

    const refId = parseInt(String(referenceId), 10);
    if (isNaN(refId)) {
      return 'Reference ID must be a valid number';
    }

    if (refId <= 0) {
      return 'Reference ID must be a positive integer';
    }

    return null;
  }

  
  static validateBalancingAuthorityCd(code: string): boolean {
    if (!code || code.trim() === '') {
      return true; 
    }
    if (typeof code !== 'string') return false;
    return code.trim().length > 0 && code.trim().length <= 5;
  }

  
  static getBalancingAuthorityCdError(code: string): string | null {
    if (!code || code.trim() === '') {
      return null; 
    }

    if (code.trim().length > 5) {
      return 'Balancing Authority code cannot exceed 5 characters';
    }

    return null;
  }

  
  static validateSelfLimitEffectiveDate(dateStr: string): boolean {
    if (!dateStr || dateStr.trim() === '') {
      return false; 
    }

    const date = this.parseDate(dateStr);
    return date !== null;
  }

  
  static getSelfLimitEffectiveDateError(dateStr: string): string | null {
    if (!dateStr || dateStr.trim() === '') {
      return 'Effective Date is required';
    }

    const date = this.parseDate(dateStr);
    if (!date) {
      return 'Effective Date must be a valid date (YYYY-MM-DD)';
    }

    return null;
  }

  
  static validateSelfLimitEndDate(endDateStr: string | null, effectiveDateStr: string): boolean {
    if (!endDateStr || endDateStr.trim() === '') {
      return true; 
    }

    const endDate = this.parseDate(endDateStr);
    if (!endDate) return false;

    if (effectiveDateStr && effectiveDateStr.trim()) {
      const effectiveDate = this.parseDate(effectiveDateStr);
      if (effectiveDate && endDate < effectiveDate) {
        return false; 
      }
    }

    return true;
  }

  
  static getSelfLimitEndDateError(endDateStr: string | null, effectiveDateStr: string): string | null {
    if (!endDateStr || endDateStr.trim() === '') {
      return null; 
    }

    const endDate = this.parseDate(endDateStr);
    if (!endDate) {
      return 'End Date must be a valid date (YYYY-MM-DD)';
    }

    if (effectiveDateStr && effectiveDateStr.trim()) {
      const effectiveDate = this.parseDate(effectiveDateStr);
      if (effectiveDate && endDate < effectiveDate) {
        return 'End Date must be greater than or equal to Effective Date';
      }
    }

    return null;
  }

  
  static validateSelfLimitationRecord(form: any): { valid: boolean; errors: any } {
    const errors: any = {};

    
    const recordTypeErr = this.getRecordTypeCdError(form.recordType);
    if (recordTypeErr) errors.recordType = recordTypeErr;

    
    const regionErr = this.getRegionCdError(form.region);
    if (regionErr) errors.region = regionErr;

    
    const effectiveDateErr = this.getSelfLimitEffectiveDateError(form.effectiveDate);
    if (effectiveDateErr) errors.effectiveDate = effectiveDateErr;

    
    const endDateErr = this.getSelfLimitEndDateError(form.endDate, form.effectiveDate);
    if (endDateErr) errors.endDate = endDateErr;

    
    const baErr = this.getBalancingAuthorityCdError(form.balancingAuthority);
    if (baErr) errors.balancingAuthority = baErr;

    
    const refIdErr = this.getReferenceIdError(form.referenceId, form.recordType);
    if (refIdErr) errors.referenceId = refIdErr;

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  
  private static parseDate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;

    
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) ? date : null;
    }

    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      let month = parseInt(parts[0], 10);
      let day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      
      if (month > 12) {
        [month, day] = [day, month];
      }

      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime()) && date.getMonth() === month - 1) {
        return date;
      }
    }

    
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date : null;
  }

  
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  
  static toIsoDateTime(dateStr: string | null): string | null {
    if (!dateStr) return null;

    const date = this.parseDate(dateStr);
    if (!date) return null;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00`;
  }
}

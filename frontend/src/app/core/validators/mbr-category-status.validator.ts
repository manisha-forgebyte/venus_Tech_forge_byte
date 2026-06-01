export class MBRCategoryStatusValidator {
  
  static readonly REGION_CODES = {
    'NW': 'Northwest',
    'SW': 'Southwest',
    'CE': 'Central',
    'SPP': 'Southwest Power Pool',
    'NE': 'Northeast',
    'SE': 'Southeast'
  };

  
  static readonly CATEGORY_STATUS_OPTIONS = {
    1: 'Category 1',
    2: 'Category 2',
    3: 'No MBR authority in the region'
  };

  
  static validateRecordTypeCd(recordType: string): boolean {
    if (!recordType) return false;
    const trimmed = recordType.trim().toUpperCase();
    return trimmed === 'NEW' || trimmed === 'UPDATE';
  }

  static getRecordTypeCdError(recordType: string): string | null {
    if (!recordType) {
      return 'Record type is required';
    }
    const trimmed = recordType.trim().toUpperCase();
    if (trimmed !== 'NEW' && trimmed !== 'UPDATE') {
      return 'Record type must be either "New" or "Update"';
    }
    return null;
  }

  
  static validateReferenceId(referenceId: string | number, recordType?: string): boolean {
    
    if (!recordType || recordType.trim().toUpperCase() === 'NEW') {
      return true;
    }

    
    if (!referenceId) return false;

    const numValue = typeof referenceId === 'string' ? parseInt(referenceId.trim(), 10) : referenceId;
    return !isNaN(numValue) && Number.isInteger(numValue) && numValue > 0;
  }

  static getReferenceIdError(referenceId: string | number, recordType?: string): string | null {
    
    if (!recordType || recordType.trim().toUpperCase() === 'NEW') {
      return null;
    }

    
    if (!referenceId) {
      return 'Reference ID is required when record type is "Update"';
    }

    const trimmed = typeof referenceId === 'string' ? referenceId.trim() : String(referenceId);
    
    if (!trimmed) {
      return 'Reference ID is required when record type is "Update"';
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

  
  static validateRegionCd(region: string): boolean {
    if (!region) return false;
    const trimmed = region.trim().toUpperCase();
    return trimmed in this.REGION_CODES;
  }

  static getRegionCdError(region: string): string | null {
    if (!region) {
      return 'Region code is required';
    }
    const trimmed = region.trim().toUpperCase();
    if (!(trimmed in this.REGION_CODES)) {
      const validCodes = Object.keys(this.REGION_CODES).join(', ');
      return `Invalid region code. Must be one of: ${validCodes}`;
    }
    return null;
  }

  
  static validateCategoryStatus(status: number | string): boolean {
    if (status === null || status === undefined || status === '') return false;
    const numValue = typeof status === 'string' ? parseInt(status, 10) : status;
    return !isNaN(numValue) && [1, 2, 3].includes(numValue);
  }

  static getCategoryStatusError(status: number | string): string | null {
    if (status === null || status === undefined || status === '') {
      return 'Category status is required';
    }
    const numValue = typeof status === 'string' ? parseInt(status, 10) : status;
    if (isNaN(numValue)) {
      return 'Category status must be a valid number';
    }
    if (![1, 2, 3].includes(numValue)) {
      return 'Category status must be 1 (Category 1), 2 (Category 2), or 3 (No MBR authority)';
    }
    return null;
  }

  
  static validateCategoryStatusEffectiveDate(date: string | Date, categoryStatus?: number | string): boolean {
    
    const numStatus = typeof categoryStatus === 'string' ? parseInt(categoryStatus, 10) : categoryStatus;
    if (!categoryStatus || numStatus === 3) {
      return !date || this.parseDate(date) !== null;
    }

    
    if (!date) return false;

    const d = this.parseDate(date);
    return d !== null && !isNaN(d.getTime());
  }

  static getCategoryStatusEffectiveDateError(date: string | Date, categoryStatus?: number | string): string | null {
    const numStatus = typeof categoryStatus === 'string' ? parseInt(categoryStatus, 10) : categoryStatus;
    
    
    if (categoryStatus && (numStatus === 1 || numStatus === 2)) {
      if (!date) {
        return 'Effective date is required for Category 1 or Category 2';
      }

      const d = this.parseDate(date);
      if (d === null || isNaN(d.getTime())) {
        return 'Invalid date format. Use YYYY-MM-DD (e.g., 2026-04-10)';
      }
    } else if (date) {
      
      const d = this.parseDate(date);
      if (d === null || isNaN(d.getTime())) {
        return 'Invalid date format. Use YYYY-MM-DD (e.g., 2026-04-10)';
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

  
  static validateCategoryStatusRecord(record: any): {
    valid: boolean;
    errors: { [key: string]: string };
  } {
    const errors: { [key: string]: string } = {};

    
    const recordTypeVal = record.recordTypeCd || record.record_type_cd;
    if (recordTypeVal) {
      const err = this.getRecordTypeCdError(recordTypeVal);
      if (err) errors['recordTypeCd'] = err;
    } else {
      errors['recordTypeCd'] = 'Record type is required';
    }

    
    const referenceIdVal = record.referenceId || record.reference_id;
    const err = this.getReferenceIdError(referenceIdVal, recordTypeVal);
    if (err) errors['referenceId'] = err;

    
    const regionVal = record.regionCd || record.region_cd;
    if (regionVal) {
      const err = this.getRegionCdError(regionVal);
      if (err) errors['regionCd'] = err;
    } else {
      errors['regionCd'] = 'Region code is required';
    }

    
    const catStatusVal = record.catStatusInRegionFk || record.cat_status_in_region_fk;
    if (catStatusVal !== null && catStatusVal !== undefined && catStatusVal !== '') {
      const err = this.getCategoryStatusError(catStatusVal);
      if (err) errors['catStatusInRegionFk'] = err;
    } else {
      errors['catStatusInRegionFk'] = 'Category status is required';
    }

    
    const dateVal = record.catStatusEffectiveDate || record.cat_status_effective_date;
    const err2 = this.getCategoryStatusEffectiveDateError(dateVal, catStatusVal);
    if (err2) errors['catStatusEffectiveDate'] = err2;

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class MBREntitiestoEntitiesValidator {
  private static readonly VALID_ENTITY_TYPES = ['CID', 'LEI', 'GID'];
  private static readonly RECORD_TYPE_OPTIONS = ['New', 'Update', 'Deactivate'];

  static getRecordTypeCdError(recordType: string): string | null {
    if (!recordType || recordType.trim() === '') {
      return 'Record Type is required';
    }
    if (!this.RECORD_TYPE_OPTIONS.includes(recordType)) {
      return `Record Type must be one of: ${this.RECORD_TYPE_OPTIONS.join(', ')}`;
    }
    return null;
  }

  static getReferenceIdError(refId: string, recordType: string): string | null {
    
    if (recordType === 'Update') {
      if (!refId || refId.trim() === '') {
        return 'Reference ID is required for Update records';
      }
      const parsedId = parseInt(refId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return 'Reference ID must be a valid positive number';
      }
    }
    return null;
  }

  static getReportableEntityTypeError(entityType: string): string | null {
    if (!entityType || entityType.trim() === '') {
      return 'Reportable Entity Type is required';
    }
    if (!this.VALID_ENTITY_TYPES.includes(entityType)) {
      return `Entity Type must be one of: ${this.VALID_ENTITY_TYPES.join(', ')}`;
    }
    return null;
  }

  static getReportableEntityIdError(entityId: string): string | null {
    if (!entityId || entityId.trim() === '') {
      return 'Reportable Entity ID is required';
    }
    if (entityId.trim().length < 1 || entityId.trim().length > 50) {
      return 'Entity ID must be between 1 and 50 characters';
    }
    return null;
  }

  static getRelationshipStartDateError(startDate: string): string | null {
    if (!startDate || startDate.trim() === '') {
      return 'Relationship Start Date is required';
    }
    const date = this.parseDate(startDate);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY';
    }
    return null;
  }

  static getRelationshipEndDateError(endDate: string, startDate: string): string | null {
    
    if (!endDate || endDate.trim() === '') {
      return null; 
    }
    
    const endDateObj = this.parseDate(endDate);
    if (!endDateObj || isNaN(endDateObj.getTime())) {
      return 'Invalid Relationship End Date format. Use YYYY-MM-DD or MM/DD/YYYY';
    }

    if (!startDate || startDate.trim() === '') {
      return null;
    }

    const startDateObj = this.parseDate(startDate);
    if (!startDateObj || isNaN(startDateObj.getTime())) {
      return null;
    }

    if (endDateObj < startDateObj) {
      return 'Relationship End Date must be greater than or equal to Start Date';
    }

    return null;
  }

  static validateRecord(form: any): { valid: boolean; errors: any } {
    const errors: any = {
      recordType: this.getRecordTypeCdError(form.recordType),
      referenceId: this.getReferenceIdError(form.referenceId || '', form.recordType),
      reportableEntityType: this.getReportableEntityTypeError(form.reportableEntityType),
      reportableEntityId: this.getReportableEntityIdError(form.reportableEntityId),
      relationshipStartDate: this.getRelationshipStartDateError(form.relationshipStartDate),
      relationshipEndDate: this.getRelationshipEndDateError(form.relationshipEndDate, form.relationshipStartDate)
    };

    const hasErrors = Object.values(errors).some((err: any) => err !== null);
    return {
      valid: !hasErrors,
      errors
    };
  }

  private static parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const date = new Date(`${dateStr}T00:00:00`);
      return isNaN(date.getTime()) ? null : date;
    }

    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split('/');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return isNaN(date.getTime()) ? null : date;
    }

    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      if (parts[0] as any > 12) {
        
        const [day, month, year] = parts;
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return isNaN(date.getTime()) ? null : date;
      }
    }

    return null;
  }

  static toIsoDateTime(dateStr: string | null): string | null {
    if (!dateStr || dateStr.trim() === '') return null;

    const date = this.parseDate(dateStr);
    if (!date || isNaN(date.getTime())) return null;

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
  }
}

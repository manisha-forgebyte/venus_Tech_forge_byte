export class MBREntitiesToVerticalAssetsValidator {
  private static readonly VALID_ENTITY_TYPES = ['CID', 'LEI', 'GID'];
  private static readonly VERTICAL_ASSET_TYPES = ['1', '2', '3', '4', '5'];
  private static readonly RECORD_TYPE_OPTIONS = ['New', 'Update'];

  static getRecordTypeCdError(recordType: string): string | null {
    if (!recordType || recordType.trim() === '') {
      return 'Record Type is required';
    }
    if (!this.RECORD_TYPE_OPTIONS.includes(recordType)) {
      return 'Record Type must be either "New" or "Update"';
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

  static getEntityIdTypeError(entityType: string): string | null {
    if (!entityType || entityType.trim() === '') {
      return 'Entity ID Type is required';
    }
    if (!this.VALID_ENTITY_TYPES.includes(entityType)) {
      return `Entity ID Type must be one of: ${this.VALID_ENTITY_TYPES.join(', ')}`;
    }
    return null;
  }

  static getEntityIdError(entityId: string): string | null {
    if (!entityId || entityId.trim() === '') {
      return 'Entity ID is required';
    }
    
    if (entityId.trim().length > 20) {
      return 'Entity ID must not exceed 20 characters';
    }
    
    if (!/^[A-Z0-9]*$/.test(entityId.trim())) {
      return 'Entity ID must contain only alphanumeric characters';
    }
    return null;
  }

  static getVerticalAssetTypeError(assetType: string): string | null {
    if (!assetType || assetType.trim() === '') {
      return 'Vertical Asset Type is required';
    }
    if (!this.VERTICAL_ASSET_TYPES.includes(assetType)) {
      return 'Vertical Asset Type must be one of: 1-Transmission, 2-Intrastate Pipeline, 3-Gas Storage, 4-Gas Distribution, 5-Other';
    }
    return null;
  }

  static getBalancingAuthorityError(balancingAuthority: string): string | null {
    if (!balancingAuthority || balancingAuthority.trim() === '') {
      return 'Balancing Authority is required';
    }
    
    if (balancingAuthority.trim().length > 5) {
      return 'Invalid Balancing Authority Code format';
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

  static getExplanatoryNotesError(notes: string): string | null {
    
    if (!notes || notes.trim() === '') {
      return null;
    }
    if (notes.trim().length > 255) {
      return 'Explanatory Notes must not exceed 255 characters';
    }
    return null;
  }

  static validateRecord(form: any): { valid: boolean; errors: any } {
    const errors: any = {
      recordType: this.getRecordTypeCdError(form.recordTypeCd),
      referenceId: this.getReferenceIdError(form.referenceId || '', form.recordTypeCd),
      entityIdType: this.getEntityIdTypeError(form.entityIdType),
      entityId: this.getEntityIdError(form.entityId),
      verticalAssetType: this.getVerticalAssetTypeError(form.verticalAssetType),
      balancingAuthority: this.getBalancingAuthorityError(form.balancingAuthority),
      relationshipStartDate: this.getRelationshipStartDateError(form.relationshipStartDate),
      relationshipEndDate: this.getRelationshipEndDateError(form.relationshipEndDate, form.relationshipStartDate),
      explanatoryNotes: this.getExplanatoryNotesError(form.explanatoryNotes)
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

export class MBREntitiesToGenAssetsValidator {
  private static readonly VALID_ENTITY_TYPES = ['CID', 'LEI', 'GID'];
  private static readonly ASSET_TYPE_EIA = '1';
  private static readonly ASSET_TYPE_ASSET_ID = '2';
  private static readonly RELATIONSHIP_TYPES = ['1', '2', '3'];
  private static readonly ADJUSTED_RATING_OPTIONS = ['1', '2', '3', '4', '5'];
  private static readonly RECORD_TYPE_OPTIONS = ['New', 'Update', 'Deactivate'];

  static getGenAssetTypeError(assetType: string): string | null {
    if (!assetType || assetType.trim() === '') {
      return 'Gen Asset Type is required';
    }
    if (assetType !== this.ASSET_TYPE_EIA && assetType !== this.ASSET_TYPE_ASSET_ID) {
      return 'Gen Asset Type must be either EIA (1) or Asset ID (2)';
    }
    return null;
  }

  static getEiaPlantCodeError(plantCode: string, assetType: string): string | null {
    
    if (assetType === this.ASSET_TYPE_EIA) {
      if (!plantCode || plantCode.trim() === '') {
        return 'EIA Plant Code is required for EIA asset type';
      }
      if (plantCode.trim().length > 5) {
        return 'EIA Plant Code must not exceed 5 characters';
      }
    }
    return null;
  }

  static getEiaGeneratorIdError(generatorId: string, assetType: string): string | null {
    
    if (assetType === this.ASSET_TYPE_EIA) {
      if (!generatorId || generatorId.trim() === '') {
        return 'EIA Generator ID is required for EIA asset type';
      }
      if (generatorId.trim().length > 5) {
        return 'EIA Generator ID must not exceed 5 characters';
      }
    }
    return null;
  }

  static getEiaUnitCodeError(unitCode: string, assetType: string): string | null {
    
    if (assetType === this.ASSET_TYPE_EIA) {
      if (unitCode && unitCode.trim().length > 7) {
        return 'EIA Unit Code must not exceed 7 characters';
      }
    }
    return null;
  }

  static getFercAssetGenCodeError(assetCode: string, assetType: string): string | null {
    
    if (assetType === this.ASSET_TYPE_ASSET_ID) {
      if (!assetCode || assetCode.trim() === '') {
        return 'FERC Asset Generator Code is required for Asset ID type';
      }
      if (assetCode.trim().length > 10) {
        return 'FERC Asset Generator Code must not exceed 10 characters';
      }
    }
    return null;
  }

  static getEntityIdTypeError(entityType: string): string | null {
    if (!entityType || entityType.trim() === '') {
      return 'Reportable Entity Type is required';
    }
    if (!this.VALID_ENTITY_TYPES.includes(entityType)) {
      return `Entity Type must be one of: ${this.VALID_ENTITY_TYPES.join(', ')}`;
    }
    return null;
  }

  static getEntityIdError(entityId: string): string | null {
    if (!entityId || entityId.trim() === '') {
      return 'Reportable Entity ID is required';
    }
    if (entityId.trim().length > 20) {
      return 'Entity ID must not exceed 20 characters';
    }
    return null;
  }

  static getRelationshipTypeError(relationshipType: string): string | null {
    if (!relationshipType || relationshipType.trim() === '') {
      return 'Relationship Type is required';
    }
    if (!this.RELATIONSHIP_TYPES.includes(relationshipType)) {
      return 'Relationship Type must be Ownership (1), Control (2), or Both (3)';
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

  static getPhysicalLocationBaaError(baa: string): string | null {
    if (!baa || baa.trim() === '') {
      return 'Physical Location Balancing Authority is required';
    }
    return null;
  }

  static getTelemeteredLocationBaaError(baa: string): string | null {
    if (!baa || baa.trim() === '') {
      return 'Telemetered Location Balancing Authority is required';
    }
    return null;
  }

  static getCapRatingAdjustedError(capRating: string): string | null {
    if (!capRating || capRating.trim() === '') {
      return 'Cap Rating Adjusted is required';
    }
    const num = parseFloat(capRating);
    if (isNaN(num)) {
      return 'Cap Rating Adjusted must be a valid number';
    }
    if (num < 0) {
      return 'Cap Rating Adjusted must be a positive number';
    }
    return null;
  }

  static getAdjustedRatingOptionsError(option: string): string | null {
    if (!option || option.trim() === '') {
      return 'Adjusted Rating Options is required';
    }
    if (!this.ADJUSTED_RATING_OPTIONS.includes(option)) {
      return 'Adjusted Rating Options must be one of: Nameplate (1), Seasonal (2), 5-yr Unit (3), 5-yr EIA (4), Alternative (5)';
    }
    return null;
  }

  static getAmountError(amount: string): string | null {
    if (!amount || amount.trim() === '') {
      return 'Amount is required';
    }
    const num = parseFloat(amount);
    if (isNaN(num)) {
      return 'Amount must be a valid number';
    }
    if (num < 0) {
      return 'Amount must be a non-negative number';
    }
    return null;
  }

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

  static validateRecord(form: any): { valid: boolean; errors: any } {
    const errors: any = {
      genAssetType: this.getGenAssetTypeError(form.reportableEntityType),
      eiaPlantCode: this.getEiaPlantCodeError(form.eiaPlantCode, form.reportableEntityType),
      eiaGeneratorId: this.getEiaGeneratorIdError(form.eiaGeneratorId, form.reportableEntityType),
      eiaUnitCode: this.getEiaUnitCodeError(form.eiaUnitCode, form.reportableEntityType),
      fercAssetGenCode: this.getFercAssetGenCodeError(form.fercAssetGeneratorCode, form.reportableEntityType),
      entityIdType: this.getEntityIdTypeError(form.reportableEntityTypeSecond),
      entityId: this.getEntityIdError(form.reportableEntityId),
      relationshipType: this.getRelationshipTypeError(form.relationshipType),
      relationshipStartDate: this.getRelationshipStartDateError(form.relationshipStartDate),
      relationshipEndDate: this.getRelationshipEndDateError(form.relationshipEndDate, form.relationshipStartDate),
      physicalLocationBaa: this.getPhysicalLocationBaaError(form.physicalLocationBaa),
      telemeteredLocationBaa: this.getTelemeteredLocationBaaError(form.telemeteredLocationBaa),
      capRatingAdjusted: this.getCapRatingAdjustedError(form.capRatingAdjusted),
      adjustedRatingOptions: this.getAdjustedRatingOptionsError(form.adjustedRatingOptions),
      amount: this.getAmountError(form.amount),
      recordType: this.getRecordTypeCdError(form.recordType),
      referenceId: this.getReferenceIdError(form.referenceId || '', form.recordType)
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

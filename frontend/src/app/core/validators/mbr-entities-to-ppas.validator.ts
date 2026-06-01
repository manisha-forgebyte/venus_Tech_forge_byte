export class MBREntitiesToPPAsValidator {
  private static readonly VALID_ENTITY_TYPES = ['CID', 'LEI', 'GID'];
  private static readonly PPA_TYPE_OPTIONS = ['1', '2'];
  private static readonly SUPPLY_TYPE_OPTIONS = ['1', '2', '3', '4'];
  private static readonly ADJUSTED_RATING_OPTIONS = ['1', '2', '3', '4', '5'];
  private static readonly ASSET_TYPE_EIA = '1';
  private static readonly ASSET_TYPE_ASSET_ID = '2';
  private static readonly SUPPLY_TYPE_GENERATOR_SPECIFIC = '1';
  private static readonly RECORD_TYPE_OPTIONS = ['New', 'Update'];

  static getRecordTypeCdError(recordType: string): string | null {
    if (!recordType || recordType.trim() === '') {
      return 'Record Type is required';
    }
    if (!this.RECORD_TYPE_OPTIONS.includes(recordType)) {
      return `Record Type must be either "New" or "Update"`;
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
    return null;
  }

  static getDateOfLastChangeError(date: string, recordType: string): string | null {
    
    if (recordType === 'Update') {
      if (!date || date.trim() === '') {
        return 'Date of Last Change is required for Update records';
      }
      const parsedDate = this.parseDate(date);
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        return 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY';
      }
    }
    return null;
  }

  static getPpaAgreementIdError(ppaId: string): string | null {
    if (!ppaId || ppaId.trim() === '') {
      return 'PPA Agreement ID is required';
    }
    if (ppaId.trim().length > 30) {
      return 'PPA Agreement ID must not exceed 30 characters';
    }
    return null;
  }

  static getCounterpartyIdTypeError(idType: string): string | null {
    if (!idType || idType.trim() === '') {
      return 'Counterparty ID Type is required';
    }
    if (!this.VALID_ENTITY_TYPES.includes(idType)) {
      return `Counterparty ID Type must be one of: ${this.VALID_ENTITY_TYPES.join(', ')}`;
    }
    return null;
  }

  static getCounterpartyIdError(counterpartyId: string): string | null {
    if (!counterpartyId || counterpartyId.trim() === '') {
      return 'Counterparty ID is required';
    }
    if (counterpartyId.trim().length > 20) {
      return 'Counterparty ID must not exceed 20 characters';
    }
    return null;
  }

  static getPpaTypeFkError(ppaType: string): string | null {
    if (!ppaType || ppaType.trim() === '') {
      return 'PPA Type is required';
    }
    if (!this.PPA_TYPE_OPTIONS.includes(ppaType)) {
      return 'PPA Type must be either "Purchase" (1) or "Sale" (2)';
    }
    return null;
  }

  static getSupplyTypeFkError(supplyType: string): string | null {
    if (!supplyType || supplyType.trim() === '') {
      return 'Supply Type is required';
    }
    if (!this.SUPPLY_TYPE_OPTIONS.includes(supplyType)) {
      return 'Supply Type must be one of: 1-Generator Specific, 2-Slice of System, 3-Portfolio, 4-Other';
    }
    return null;
  }

  static getGenAssetTypeError(assetType: string, supplyType: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC) {
      if (!assetType || assetType.trim() === '') {
        return 'Generation Asset Type is required for Generator Specific supply';
      }
      if (assetType !== this.ASSET_TYPE_EIA && assetType !== this.ASSET_TYPE_ASSET_ID) {
        return 'Generation Asset Type must be either EIA (1) or Asset ID (2)';
      }
    }
    return null;
  }

  static getEiaPlantCodeError(plantCode: string, supplyType: string, assetType: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC && assetType === this.ASSET_TYPE_EIA) {
      if (!plantCode || plantCode.trim() === '') {
        return 'EIA Plant Code is required for EIA asset type with Generator Specific supply';
      }
      if (plantCode.trim().length > 5) {
        return 'EIA Plant Code must not exceed 5 characters';
      }
    }
    return null;
  }

  static getEiaGeneratorIdError(generatorId: string, supplyType: string, assetType: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC && assetType === this.ASSET_TYPE_EIA) {
      if (!generatorId || generatorId.trim() === '') {
        return 'EIA Generator ID is required for EIA asset type with Generator Specific supply';
      }
      if (generatorId.trim().length > 5) {
        return 'EIA Generator ID must not exceed 5 characters';
      }
      
      if (!/^\d+$/.test(generatorId.trim())) {
        return 'EIA Generator ID must be a valid numeric identifier';
      }
    }
    return null;
  }

  static getEiaUnitCodeError(unitCode: string, supplyType: string, assetType: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC && assetType === this.ASSET_TYPE_EIA) {
      
      if (!unitCode || unitCode.trim() === '') {
        return null; 
      }
      if (unitCode.trim().length > 7) {
        return 'EIA Unit Code must not exceed 7 characters';
      }
    }
    return null;
  }

  static getFercAssetGeneratorCodeError(code: string, supplyType: string, assetType: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC && assetType === this.ASSET_TYPE_ASSET_ID) {
      if (!code || code.trim() === '') {
        return 'FERC Asset Generator Code is required for Asset ID type with Generator Specific supply';
      }
      
      if (!/^\d{10}$/.test(code.trim())) {
        return 'FERC Asset Generator Code must be a valid 10-digit identifier';
      }
    }
    return null;
  }

  static getAltMethodologyUsedError(methodology: string, supplyType: string, adjustedRating: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC && adjustedRating === '5') {
      if (!methodology || methodology.trim() === '') {
        return 'Alternative Methodology description is required when Alternative rating is selected';
      }
      if (methodology.trim().length > 290) {
        return 'Alternative Methodology must not exceed 290 characters';
      }
    }
    return null;
  }

  static getSourceBalancingAuthorityError(sourceBA: string): string | null {
    
    if (!sourceBA || sourceBA.trim() === '') {
      return null;
    }
    
    return null;
  }

  static getSourceBalancingAuthorityHubError(hub: string, sourceBA: string): string | null {
    
    if (sourceBA === 'Hub' && (!hub || hub.trim() === '')) {
      return 'Source Balancing Authority Hub is required when Source BAA is "Hub"';
    }
    
    if (hub && hub.trim() !== '') {
      
      if (hub.trim().length > 11) {
        return 'Invalid Hub Code format';
      }
    }
    return null;
  }

  static getSinkBalancingAuthorityError(sinkBA: string, ppaType: string): string | null {
    
    if (ppaType === '1') {
      if (!sinkBA || sinkBA.trim() === '') {
        return 'Sink Balancing Authority is required for Purchase type PPAs';
      }
    }
    return null;
  }

  static getSinkBalancingAuthorityHubError(hub: string, sinkBA: string): string | null {
    
    if (sinkBA === 'Hub' && (!hub || hub.trim() === '')) {
      return 'Sink Balancing Authority Hub is required when Sink BAA is "Hub"';
    }
    
    if (hub && hub.trim() !== '') {
      if (hub.trim().length > 11) {
        return 'Invalid Hub Code format';
      }
    }
    return null;
  }

  static getExplanatoryNotesError(notes: string, supplyType: string, adjustedRating: string): string | null {
    
    if (supplyType === this.SUPPLY_TYPE_GENERATOR_SPECIFIC && adjustedRating === '5') {
      if (!notes || notes.trim() === '') {
        return 'Explanatory Notes are required when Alternative rating is selected';
      }
    }
    return null;
  }

  static getPpaStartDateError(startDate: string): string | null {
    if (!startDate || startDate.trim() === '') {
      return 'PPA Start Date is required';
    }
    const date = this.parseDate(startDate);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY';
    }
    return null;
  }

  static getScheduledEndDateError(endDate: string, startDate: string): string | null {
    
    if (!endDate || endDate.trim() === '') {
      return null;
    }

    const endDateObj = this.parseDate(endDate);
    if (!endDateObj || isNaN(endDateObj.getTime())) {
      return 'Invalid Scheduled End Date format. Use YYYY-MM-DD or MM/DD/YYYY';
    }

    if (!startDate || startDate.trim() === '') {
      return null;
    }

    const startDateObj = this.parseDate(startDate);
    if (!startDateObj || isNaN(startDateObj.getTime())) {
      return null;
    }

    if (endDateObj < startDateObj) {
      return 'Scheduled End Date must be greater than or equal to Start Date';
    }

    return null;
  }

  static getActualEndDateError(endDate: string, startDate: string): string | null {
    
    if (!endDate || endDate.trim() === '') {
      return null;
    }

    const endDateObj = this.parseDate(endDate);
    if (!endDateObj || isNaN(endDateObj.getTime())) {
      return 'Invalid Actual End Date format. Use YYYY-MM-DD or MM/DD/YYYY';
    }

    if (!startDate || startDate.trim() === '') {
      return null;
    }

    const startDateObj = this.parseDate(startDate);
    if (!startDateObj || isNaN(startDateObj.getTime())) {
      return null;
    }

    if (endDateObj < startDateObj) {
      return 'Actual End Date must be greater than or equal to Start Date';
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

  static getAmountAdjustedError(amountAdjusted: string): string | null {
    
    if (!amountAdjusted || amountAdjusted.trim() === '') {
      return null;
    }
    const num = parseFloat(amountAdjusted);
    if (isNaN(num)) {
      return 'Amount Adjusted must be a valid number';
    }
    if (num < 0) {
      return 'Amount Adjusted must be a non-negative number';
    }
    return null;
  }

  static getAdjustedRatingOptionsError(option: string): string | null {
    
    if (!option || option.trim() === '') {
      return null;
    }
    if (!this.ADJUSTED_RATING_OPTIONS.includes(option)) {
      return 'Adjusted Rating Options must be one of: 1-Nameplate, 2-Seasonal, 3-5yr Unit, 4-5yr EIA, 5-Alternative';
    }
    return null;
  }

  static validateRecord(form: any): { valid: boolean; errors: any } {
    const errors: any = {
      recordType: this.getRecordTypeCdError(form.recordType),
      referenceId: this.getReferenceIdError(form.referenceId || '', form.recordType),
      entityIdType: this.getEntityIdTypeError(form.entityIdTypeCd),
      entityId: this.getEntityIdError(form.entityId),
      dateOfLastChange: this.getDateOfLastChangeError(form.lastChangedDate, form.recordType),
      ppaAgreementId: this.getPpaAgreementIdError(form.ppaAgreementId),
      counterpartyIdType: this.getCounterpartyIdTypeError(form.counterpartyIdTypeCd),
      counterpartyId: this.getCounterpartyIdError(form.counterpartyId),
      ppaType: this.getPpaTypeFkError(form.ppaTypeFk),
      supplyType: this.getSupplyTypeFkError(form.supplyTypeFk),
      genAssetType: this.getGenAssetTypeError(form.genAssetType, form.supplyTypeFk),
      eiaPlantCode: this.getEiaPlantCodeError(form.eiaPlantCode, form.supplyTypeFk, form.genAssetType),
      eiaGeneratorId: this.getEiaGeneratorIdError(form.eiaGeneratorId, form.supplyTypeFk, form.genAssetType),
      eiaUnitCode: this.getEiaUnitCodeError(form.eiaUnitCode, form.supplyTypeFk, form.genAssetType),
      fercAssetGeneratorCode: this.getFercAssetGeneratorCodeError(form.fercAssetGeneratorCode, form.supplyTypeFk, form.genAssetType),
      ppaStartDate: this.getPpaStartDateError(form.ppaStartDate),
      scheduledEndDate: this.getScheduledEndDateError(form.scheduledEndDate, form.ppaStartDate),
      actualEndDate: this.getActualEndDateError(form.actualEndDate, form.ppaStartDate),
      amount: this.getAmountError(form.amount),
      amountAdjusted: this.getAmountAdjustedError(form.amountAdjusted),
      adjustedRatingOptions: this.getAdjustedRatingOptionsError(form.adjustedRatingOptions),
      altMethodologyUsed: this.getAltMethodologyUsedError(form.altMethodologyUsed, form.supplyTypeFk, form.adjustedRatingOptions),
      sourceBalancingAuthority: this.getSourceBalancingAuthorityError(form.sourceBalancingAuthority),
      sourceBalancingAuthorityHub: this.getSourceBalancingAuthorityHubError(form.sourceBalancingAuthorityHub, form.sourceBalancingAuthority),
      sinkBalancingAuthority: this.getSinkBalancingAuthorityError(form.sinkBalancingAuthority, form.ppaTypeFk),
      sinkBalancingAuthorityHub: this.getSinkBalancingAuthorityHubError(form.sinkBalancingAuthorityHub, form.sinkBalancingAuthority),
      explanatoryNotes: this.getExplanatoryNotesError(form.explanatoryNotes, form.supplyTypeFk, form.adjustedRatingOptions)
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

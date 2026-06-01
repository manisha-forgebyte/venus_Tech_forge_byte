export class MBRIndicativeMssValidator {
  private static readonly STUDY_TYPE_OPTIONS = ['New', 'Update'];
  private static readonly SCENARIO_TYPE_OPTIONS = ['1', '2'];
  private static readonly SEASON_OPTIONS = ['1', '2', '3', '4'];
  private static readonly STUDY_PARAMETERS = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
  ];

  static getStudyTypeError(studyType: string): string | null {
    if (!studyType || studyType.trim() === '') {
      return 'Study Type is required';
    }
    if (!this.STUDY_TYPE_OPTIONS.includes(studyType)) {
      return 'Study Type must be either "New" or "Update"';
    }
    return null;
  }

  static getStudyAmendedReferenceError(refId: string, studyType: string): string | null {
    
    if (studyType === 'Update') {
      if (!refId || refId.trim() === '') {
        return 'Study Amended Reference is required for Update records';
      }
      const parsedId = parseInt(refId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return 'Study Amended Reference must be a valid positive number';
      }
    }
    return null;
  }

  static getStudyEndYearError(year: string): string | null {
    if (!year || year.trim() === '') {
      return 'Study End Year is required';
    }
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return 'Study End Year must be a valid year (1900-2100)';
    }
    
    const currentYear = new Date().getFullYear();
    if (yearNum > currentYear) {
      return `Study End Year must be a current or historical year (not future: ${yearNum})`;
    }
    return null;
  }

  static getStudyAreaBalancingAuthorityError(ba: string): string | null {
    if (!ba || ba.trim() === '') {
      return 'Study Area Balancing Authority is required';
    }
    
    if (ba.trim().length > 5) {
      return 'Invalid Balancing Authority Code format';
    }
    return null;
  }

  static getScenarioTypeError(scenarioType: string): string | null {
    if (!scenarioType || scenarioType.trim() === '') {
      return 'Scenario Type is required';
    }
    if (!this.SCENARIO_TYPE_OPTIONS.includes(scenarioType)) {
      return 'Scenario Type must be either "1" (Base Case) or "2" (Sensitivity Analysis)';
    }
    return null;
  }

  static getSeasonError(season: string): string | null {
    if (!season || season.trim() === '') {
      return 'Season is required';
    }
    if (!this.SEASON_OPTIONS.includes(season)) {
      return 'Season must be one of: 1-Winter, 2-Spring, 3-Summer, 4-Fall';
    }
    return null;
  }

  static getStudyParameterError(parameter: string): string | null {
    if (!parameter || parameter.trim() === '') {
      return 'Study Parameter is required';
    }
    if (!this.STUDY_PARAMETERS.includes(parameter)) {
      return 'Study Parameter must be one of the valid parameter types (1-30)';
    }
    return null;
  }

  static getStudyParameterValueError(value: string, parameter: string): string | null {
    
    if (!parameter || parameter.trim() === '') {
      return null;
    }
    
    if (!value || value.trim() === '') {
      return 'Study Parameter Value is required when a Study Parameter is selected';
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Study Parameter Value must be a valid number';
    }
    
    
    const parts = value.split('.');
    const integerPart = parts[0].replace(/^-/, ''); 
    const decimalPart = parts[1] || '';
    
    if (integerPart.length > 6) {
      return 'Study Parameter Value integer part must not exceed 6 digits';
    }
    if (decimalPart.length > 2) {
      return 'Study Parameter Value decimal part must not exceed 2 places';
    }
    
    return null;
  }

  static getStudyParameterReferenceError(reference: string): string | null {
    
    if (!reference || reference.trim() === '') {
      return null;
    }
    
    return null;
  }

  static getMssStudyReferenceError(refId: string): string | null {
    
    
    
    return null;
  }

  static validateRecord(form: any): { valid: boolean; errors: any } {
    const errors: any = {
      studyType: this.getStudyTypeError(form.studyTypeCd),
      studyAmendedReference: this.getStudyAmendedReferenceError(form.previousStudyRefId || '', form.studyTypeCd),
      studyEndYear: this.getStudyEndYearError(form.studyEndYear),
      studyAreaBalancingAuthority: this.getStudyAreaBalancingAuthorityError(form.studyAreaBalancingAuthorityCd),
      scenarioType: this.getScenarioTypeError(form.scenarioType),
      season: this.getSeasonError(form.season || ''),
      studyParameter: null,
      studyParameterValue: this.getStudyParameterValueError(form.studyParameterValue || '', form.studyParameter || ''),
      studyParameterReference: this.getStudyParameterReferenceError(form.studyParameterReference || '')
    };

    const hasErrors = Object.values(errors).some((err: any) => err !== null);
    return {
      valid: !hasErrors,
      errors
    };
  }

  static toIsoDateTime(dateStr: string | null): string | null {
    if (!dateStr || dateStr.trim() === '') return null;
    
    
    if (dateStr.includes('T')) return dateStr;
    
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
  }
}

import { Injectable } from '@angular/core';
import { DateFormatterService } from './date-formatter.service';


@Injectable({
  providedIn: 'root'
})
export class InputValidatorService {
  constructor(private dateFormatter: DateFormatterService) {}

  
  validateTextInput(value: string | null | undefined, fieldName: string, allowedCharacters?: RegExp): { valid: boolean; error?: string } {
    if (!value) return { valid: true }; 

    const trimmed = value.trim();
    if (!trimmed) return { valid: false, error: `${fieldName} cannot be empty` };
    if (trimmed.length < 1) return { valid: false, error: `${fieldName} is too short` };
    if (trimmed.length > 500) return { valid: false, error: `${fieldName} exceeds maximum length (500 characters)` };

    
    const defaultPattern = /^[a-zA-Z0-9\s\-_.,'()\/&:;]+$/;
    const pattern = allowedCharacters || defaultPattern;

    if (!pattern.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid characters. Only alphanumeric, spaces, and basic punctuation allowed.` };
    }

    return { valid: true };
  }

  
  validateNarrative(value: string | null | undefined, fieldName: string): { valid: boolean; error?: string } {
    if (!value) return { valid: true }; 

    const trimmed = value.trim();
    if (!trimmed) return { valid: false, error: `${fieldName} cannot be empty` };
    if (trimmed.length > 2000) return { valid: false, error: `${fieldName} exceeds maximum length (2000 characters)` };

    
    const pattern = /^[a-zA-Z0-9\s\-_.,;:'()\/&\n]+$/;

    if (!pattern.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid characters` };
    }

    return { valid: true };
  }

  
  validateNumeric(value: string | number | null | undefined, fieldName: string, options?: { min?: number; max?: number; decimals?: number }): { valid: boolean; error?: string } {
    if (value === null || value === undefined || value === '') {
      return { valid: true }; 
    }

    const numValue = typeof value === 'number' ? value : parseFloat(value);

    if (isNaN(numValue)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }

    if (options?.min !== undefined && numValue < options.min) {
      return { valid: false, error: `${fieldName} must be at least ${options.min}` };
    }

    if (options?.max !== undefined && numValue > options.max) {
      return { valid: false, error: `${fieldName} cannot exceed ${options.max}` };
    }

    if (options?.decimals !== undefined) {
      const decimalPlaces = (numValue.toString().split('.')[1] || '').length;
      if (decimalPlaces > options.decimals) {
        return { valid: false, error: `${fieldName} cannot have more than ${options.decimals} decimal places` };
      }
    }

    return { valid: true };
  }

  
  validateDate(value: string | null | undefined, fieldName: string, options?: { minDate?: Date; maxDate?: Date }): { valid: boolean; error?: string } {
    if (!value) return { valid: true }; 

    const trimmed = value.trim();
    if (!trimmed) return { valid: false, error: `${fieldName} is required` };

    
    const date = new Date(trimmed);
    
    if (isNaN(date.getTime())) {
      return { valid: false, error: `${fieldName} is not a valid date format` };
    }

    if (options?.minDate && date < options.minDate) {
      return { valid: false, error: `${fieldName} cannot be before ${this.dateFormatter.formatToDisplay(options.minDate)}` };
    }

    if (options?.maxDate && date > options.maxDate) {
      return { valid: false, error: `${fieldName} cannot be after ${this.dateFormatter.formatToDisplay(options.maxDate)}` };
    }

    return { valid: true };
  }

  
  validateEmail(value: string | null | undefined, fieldName: string): { valid: boolean; error?: string } {
    if (!value) return { valid: true }; 

    const trimmed = value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmed)) {
      return { valid: false, error: `${fieldName} is not a valid email address` };
    }

    return { valid: true };
  }

  
  validatePhone(value: string | null | undefined, fieldName: string): { valid: boolean; error?: string } {
    if (!value) return { valid: true }; 

    const trimmed = value.trim();
    const phonePattern = /^[\d\-\(\)\s+]+$/;

    if (!phonePattern.test(trimmed)) {
      return { valid: false, error: `${fieldName} contains invalid characters. Only digits, hyphens, parentheses, and spaces allowed.` };
    }

    return { valid: true };
  }

  
  sanitizeText(value: string | null | undefined): string {
    if (!value) return '';

    return value
      .trim()
      .replace(/[<>'"`;]/g, '') 
      .replace(/\s+/g, ' ') 
      .substring(0, 500); 
  }

  
  sanitizeNarrative(value: string | null | undefined): string {
    if (!value) return '';

    return value
      .trim()
      .replace(/[<>'"`;]/g, '') 
      .replace(/\s+/g, ' ') 
      .substring(0, 2000); 
  }

  
  sanitizeNumeric(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';

    return value.toString()
      .trim()
      .replace(/[^0-9\-+.]/g, ''); 
  }

  
  validateObject(obj: any, schema: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = obj[fieldName];
      let result: any = { valid: true };

      if (rules.type === 'text') {
        result = this.validateTextInput(value, fieldName);
      } else if (rules.type === 'narrative') {
        result = this.validateNarrative(value, fieldName);
      } else if (rules.type === 'numeric') {
        result = this.validateNumeric(value, fieldName, rules.options);
      } else if (rules.type === 'date') {
        result = this.validateDate(value, fieldName, rules.options);
      } else if (rules.type === 'email') {
        result = this.validateEmail(value, fieldName);
      } else if (rules.type === 'phone') {
        result = this.validatePhone(value, fieldName);
      }

      if (!result.valid && result.error) {
        errors[fieldName] = result.error;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  
  isDangerous(value: string | null | undefined): boolean {
    if (!value) return false;

    const xssPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /<iframe/i, /<img/i];
    const sqlPatterns = [/UNION\s+SELECT/i, /DROP\s+TABLE/i, /INSERT\s+INTO/i, /DELETE\s+FROM/i];

    const decoded = decodeURIComponent(value);
    return [...xssPatterns, ...sqlPatterns].some(pattern => pattern.test(decoded));
  }
}

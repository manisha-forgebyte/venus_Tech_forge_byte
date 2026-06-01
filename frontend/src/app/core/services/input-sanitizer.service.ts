import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class InputSanitizerService {

  
  private readonly xssPatterns: RegExp[] = [
    /<script[\s>]/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /document\s*\.\s*(cookie|write|domain)/i,
    /window\s*\.\s*location/i,
    /\.innerHTML\s*=/i,
  ];

  private readonly sqlPatterns: RegExp[] = [
    /('\s*(OR|AND)\s+')/i,
    /(--\s*$|;\s*DROP\s|;\s*DELETE\s|;\s*INSERT\s|;\s*UPDATE\s)/i,
    /UNION\s+(ALL\s+)?SELECT/i,
    /\/\*.*?\*\//i,
    /xp_cmdshell/i,
  ];

  
  isDangerous(value: string | null | undefined): boolean {
    if (!value) return false;

    let decoded = value;
    try { decoded = decodeURIComponent(value); } catch {  }

    for (const p of this.xssPatterns) {
      if (p.test(decoded)) return true;
    }
    for (const p of this.sqlPatterns) {
      if (p.test(decoded)) return true;
    }
    return false;
  }

  
  sanitize(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '')           
      .replace(/[<>'"`;]/g, '')          
      .trim()
      .replace(/\s{2,}/g, ' ');          
  }

  
  sanitizeStrict(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .replace(/[^a-zA-Z0-9\s\-_.,@#()/\\:]/g, '')
      .trim()
      .replace(/\s{2,}/g, ' ');
  }

  
  sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
      if (typeof result[key] === 'string') {
        (result as any)[key] = this.sanitize(result[key]);
      }
    }
    return result;
  }

  
  findDangerousField<T extends Record<string, any>>(obj: T): string | null {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && this.isDangerous(obj[key])) {
        return key;
      }
    }
    return null;
  }
}

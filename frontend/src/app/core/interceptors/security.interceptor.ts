import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';


const XSS_PATTERNS: RegExp[] = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  /on\w+\s*=/i,                        
  /eval\s*\(/i,
  /expression\s*\(/i,
  /url\s*\(\s*['"]?\s*data:/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<form/i,
  /document\s*\.\s*(cookie|write|domain)/i,
  /window\s*\.\s*location/i,
  /\.innerHTML\s*=/i,
  /String\s*\.\s*fromCharCode/i,
  /atob\s*\(/i,
  /btoa\s*\(/i,
];

const SQL_PATTERNS: RegExp[] = [
  /('\s*(OR|AND)\s+')/i,               
  /(--\s*$|;\s*DROP\s|;\s*DELETE\s|;\s*INSERT\s|;\s*UPDATE\s)/i,
  /UNION\s+(ALL\s+)?SELECT/i,
  /\/\*.*?\*\//i,
  /xp_cmdshell/i,
  /exec\s*\(/i,
];


function containsDangerousContent(value: unknown): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    
    let decoded = value;
    try {
      decoded = decodeURIComponent(value);
    } catch {  }

    for (const pat of XSS_PATTERNS) {
      if (pat.test(decoded)) return true;
    }
    for (const pat of SQL_PATTERNS) {
      if (pat.test(decoded)) return true;
    }
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(item => containsDangerousContent(item));
  }

  if (value instanceof FormData) {
    return false;
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(v => containsDangerousContent(v));
  }

  return false;
}


function sanitizePayload<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    
    return value
      .replace(/<[^>]*>/g, '')          
      .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>') 
      .replace(/<[^>]*>/g, '')
      .trim()
      .replace(/\s{2,}/g, ' ') as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizePayload(item)) as unknown as T;
  }

  if (value instanceof FormData) {
    return value; 
  }

  if (typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      cleaned[k] = sanitizePayload(v);
    }
    return cleaned as T;
  }

  return value;
}


export const securityInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  
  if (req.body !== null && req.body !== undefined) {
    if (containsDangerousContent(req.body)) {
      console.error(
        `🛑 [Security] Blocked request to ${req.url} — dangerous content detected in payload.`
      );
      throw new Error('Request blocked: potentially dangerous content detected. Please remove any special characters and try again.');
    }
  }

  
  if (containsDangerousContent(req.urlWithParams)) {
    console.error(
      `🛑 [Security] Blocked request to ${req.urlWithParams} — dangerous content detected in URL.`
    );
    throw new Error('Request blocked: potentially dangerous content detected in URL parameters.');
  }

  
  let sanitizedReq = req;
  if (req.body !== null && req.body !== undefined && typeof req.body === 'object') {
    sanitizedReq = req.clone({ body: sanitizePayload(req.body) });
  }

  
  sanitizedReq = sanitizedReq.clone({
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',         
      'X-Request-Timestamp': Date.now().toString(),  
    }
  });

  return next(sanitizedReq);
};

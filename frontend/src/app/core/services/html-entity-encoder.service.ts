import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlEntityEncoderService {
  
  
  private readonly entityMap: {[key: string]: string} = {
    '&': '&#38;',
    '<': '&#60;',
    '>': '&#62;',
    '"': '&#34;',
    "'": '&#39;',
    '#': '&#35;',
    '%': '&#37;',
    '(': '&#40;',
    ')': '&#41;',
    '*': '&#42;',
    '+': '&#43;',
    ',': '&#44;',
    '/': '&#47;',
    ':': '&#58;',
    ';': '&#59;',
    '=': '&#61;',
    '?': '&#63;',
    '@': '&#64;',
    '[': '&#91;',
    '\\': '&#92;',
    ']': '&#93;',
    '^': '&#94;',
    '`': '&#96;',
    '{': '&#123;',
    '|': '&#124;',
    '}': '&#125;',
    '~': '&#126;',
    '!': '&#33;',
    
    
    
    
    
    
  };

  
  private reverseEntityMap: {[key: string]: string} = {};

  constructor() {
    this.buildReverseMap();
  }

  
  private buildReverseMap(): void {
    
    const namedEntities: {[key: string]: string} = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
      '&#38;': '&',
      '&#60;': '<',
      '&#62;': '>',
      '&#34;': '"',
      '&#39;': "'",
      '&#35;': '#',
      '&#37;': '%',
      '&#40;': '(',
      '&#41;': ')',
      '&#42;': '*',
      '&#43;': '+',
      '&#44;': ',',
      '&#47;': '/',
      '&#58;': ':',
      '&#59;': ';',
      '&#61;': '=',
      '&#63;': '?',
      '&#64;': '@',
      '&#91;': '[',
      '&#92;': '\\',
      '&#93;': ']',
      '&#94;': '^',
      '&#96;': '`',
      '&#123;': '{',
      '&#124;': '|',
      '&#125;': '}',
      '&#126;': '~',
      '&#33;': '!',
      
      
      
      
      
      
    };

    this.reverseEntityMap = { ...namedEntities };
  }

  
  encodeToEntity(value: string): string {
    if (!value) return value;
    
    let result = '';
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      
      if (this.entityMap.hasOwnProperty(char)) {
        result += this.entityMap[char];
      } else {
        result += char;
      }
    }
    return result;
  }

  
  decodeFromEntity(value: string): string {
    if (!value) return value;

    
    let result = value;
    
    
    result = result.replace(/&#(\d+);/g, (match, dec) => {
      const code = parseInt(dec, 10);
      return String.fromCharCode(code);
    });

    
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      const code = parseInt(hex, 16);
      return String.fromCharCode(code);
    });

    
    Object.keys(this.reverseEntityMap).forEach(entity => {
      const regex = new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, this.reverseEntityMap[entity]);
    });

    return result;
  }

  
  hasEntities(value: string): boolean {
    if (!value) return false;
    return /&#\d+;|&#x[0-9a-fA-F]+;|&[a-zA-Z]+;/.test(value);
  }

  
  getEncodableSymbols(): string[] {
    return Object.keys(this.entityMap);
  }

  
  getDecodableEntities(): string[] {
    return Object.keys(this.reverseEntityMap);
  }
}

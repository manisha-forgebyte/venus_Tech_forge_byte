import { Pipe, PipeTransform } from '@angular/core';
import { HtmlEntityEncoderService } from '../../core/services/html-entity-encoder.service';


@Pipe({
  name: 'htmlEntityDisplay',
  standalone: true
})
export class HtmlEntityDisplayPipe implements PipeTransform {
  
  constructor(private encoderService: HtmlEntityEncoderService) {}

  
  transform(value: any): string {
    if (value == null) return '';
    
    
    const stringValue = typeof value === 'string' ? value : String(value);
    
    
    return this.encoderService.decodeFromEntity(stringValue);
  }
}

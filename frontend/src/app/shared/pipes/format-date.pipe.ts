import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatterService } from '../../core/services/date-formatter.service';


@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  constructor(private dateFormatter: DateFormatterService) {}

  transform(value: any): string {
    return this.dateFormatter.formatToDisplay(value);
  }
}

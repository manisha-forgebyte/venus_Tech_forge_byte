import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string | number, number> {
  transform(value: string | number) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException('Validation failed: expected integer');
    }
    return Math.trunc(parsed);
  }
}

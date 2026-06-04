import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return data;
        }

        if (Array.isArray(data)) {
          return data;
        }

        if (data && typeof data === 'object' && ('success' in data || 'message' in data || 'data' in data)) {
          return data;
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}

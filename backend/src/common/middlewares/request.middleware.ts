import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    req.headers['x-request-start'] = new Date().toISOString();
    next();
  }
}

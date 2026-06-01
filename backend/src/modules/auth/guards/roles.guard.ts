import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {

  // Check user role access
  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest();

    // Logged in user
    const user = request.user;

    // If no user -> deny access
    if (!user) {
      return false;
    }

    // Allow all authenticated users for now
    return true;
  }
}
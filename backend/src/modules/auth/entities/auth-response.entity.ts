import { TokenEntity } from './token.entity';
import { UserEntity } from './user.entity';

export class AuthResponseEntity {

  // Authenticated user details
  user!: UserEntity;

  // JWT token details
  tokens!: TokenEntity;
}
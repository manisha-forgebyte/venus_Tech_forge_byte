export class TokenEntity {

  // JWT access token
  accessToken!: string;

  // JWT refresh token
  refreshToken!: string;

  // Token expiry time
  expiresIn!: number;
}
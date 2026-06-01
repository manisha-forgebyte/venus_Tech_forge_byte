export class JwtPayloadEntity {

  // User unique ID
  sub!: string;

  // User email
  email!: string;

  // User role
  role!: string;
}
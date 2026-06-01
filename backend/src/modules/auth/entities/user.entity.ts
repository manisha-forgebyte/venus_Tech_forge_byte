export class UserEntity {

  // Unique user ID
  id!: string;

  // User full name
  name!: string;

  // User email
  email!: string;

  // User role
  role!: string;

  // Account creation date
  createdAt!: Date;

  // Account update date
  updatedAt!: Date;
}
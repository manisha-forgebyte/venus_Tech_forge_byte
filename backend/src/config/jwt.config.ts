import {
  AUTH_REFRESH_TOKEN_EXPIRES_IN,
  AUTH_TOKEN_EXPIRES_IN,
  DEFAULT_JWT_REFRESH_SECRET,
  DEFAULT_JWT_SECRET,
} from '../constants/auth.constants';

export const getJwtSecret = () => process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
export const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET || DEFAULT_JWT_REFRESH_SECRET;

export default () => ({
  secret: getJwtSecret(),
  refreshSecret: getJwtRefreshSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || AUTH_TOKEN_EXPIRES_IN,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || AUTH_REFRESH_TOKEN_EXPIRES_IN,
});

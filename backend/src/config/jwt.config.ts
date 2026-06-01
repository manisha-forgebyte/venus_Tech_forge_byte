export default () => ({
  secret: process.env.JWT_SECRET || 'secretKey',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
});

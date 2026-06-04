export const getDatabaseUrl = () => process.env.DATABASE_URL || '';

export default () => ({
  url: getDatabaseUrl(),
  isConfigured: Boolean(getDatabaseUrl()),
});

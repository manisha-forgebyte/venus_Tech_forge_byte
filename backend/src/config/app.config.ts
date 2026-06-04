import { DEFAULT_FRONTEND_ORIGIN, DEFAULT_PORT } from '../constants/app.constants';

export default () => ({
  port: Number(process.env.PORT || DEFAULT_PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || DEFAULT_FRONTEND_ORIGIN,
});

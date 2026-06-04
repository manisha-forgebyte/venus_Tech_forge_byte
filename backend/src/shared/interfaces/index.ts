export interface LegacyApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  resultId?: number | string;
  ResultId?: number | string;
}

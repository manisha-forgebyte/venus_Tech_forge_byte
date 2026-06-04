export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
};

export function successResponse<T>(data: T, message = 'Success'): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message: string, statusCode = 500): ApiErrorResponse {
  return {
    success: false,
    message,
    statusCode,
  };
}

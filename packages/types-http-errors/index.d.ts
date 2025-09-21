import { IncomingHttpHeaders } from 'http';

declare namespace createHttpError {
  interface HttpError extends Error {
    status?: number;
    statusCode?: number;
    expose?: boolean;
    headers?: IncomingHttpHeaders;
  }

  type HttpErrorOptions = {
    cause?: unknown;
    headers?: IncomingHttpHeaders;
  } & Record<string, unknown>;

  interface Factory {
    (status: number, message?: string, options?: HttpErrorOptions): HttpError;
    <T>(status: number, options?: HttpErrorOptions): HttpError;
    (message: string, options?: HttpErrorOptions): HttpError;
    isHttpError(value: unknown): value is HttpError;
    HttpError: new (
      status: number,
      message?: string,
      options?: HttpErrorOptions,
    ) => HttpError;
  }
}

declare const createHttpError: createHttpError.Factory;

export = createHttpError;

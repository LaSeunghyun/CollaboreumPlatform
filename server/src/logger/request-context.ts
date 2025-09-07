import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
    reqId: string;
    userId?: string;
    traceId?: string; // (선택) OTEL 연동 시
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function withRequestContext<T>(ctx: RequestContext, fn: () => T) {
    return requestContext.run(ctx, fn);
}

export function getRequestContext(): RequestContext | undefined {
    return requestContext.getStore();
}

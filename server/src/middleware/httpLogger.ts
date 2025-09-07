import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger';
import { withRequestContext } from '../logger/request-context';
import { Request, Response, NextFunction } from 'express';

export const httpLogger = pinoHttp({
    logger,
    genReqId: function (req, res) {
        const headerId =
            (req.headers['x-request-id'] as string) ||
            (req.headers['x-correlation-id'] as string);
        const id = headerId || randomUUID();
        res.setHeader('X-Request-ID', id);
        return id;
    },
    autoLogging: {
        // 정적 파일/헬스체크 등 제외하고 싶으면 여기서 필터
        ignorePaths: ['/healthz', '/favicon.ico'],
    },
    customLogLevel: function (res, err) {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    // 요청/응답 객체를 과도하게 찍지 않게 serializer 사용
    serializers: {
        req(req) {
            return {
                id: (req as any).id,
                method: req.method,
                url: req.url,
                // 필요한 경우 헤더/바디 제한적으로 포함
                headers: {
                    'user-agent': req.headers['user-agent'],
                },
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
});

// 요청 컨텍스트 주입 (미들웨어 체인 최상단에서 실행)
export function requestContextMiddleware(req: Request, _res: Response, next: NextFunction) {
    const reqId = (req as any).id || req.headers['x-request-id'] || randomUUID();
    const userId = (req as any).user?.id; // 인증 미들웨어가 세팅했다면
    withRequestContext({ reqId: String(reqId), userId }, () => next());
}

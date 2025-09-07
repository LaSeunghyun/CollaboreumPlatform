import pino, { LoggerOptions } from 'pino';

const base: Record<string, any> = {
    service: process.env.SERVICE_NAME || 'app',
    env: process.env.NODE_ENV || 'development',
};

const isDev = process.env.NODE_ENV !== 'production';
const pretty = (process.env.LOG_PRETTY || '').toLowerCase() === 'true';

const options: LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
    base,
    // 민감 정보 마스킹 (중첩 경로 지원)
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.token',
            'req.body.accessToken',
            'req.body.refreshToken',
            'res.headers["set-cookie"]',
            'user.password',
            '*.cardNumber',
            '*.cvv',
        ],
        censor: '***',
    },
    transport: isDev && pretty ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
    // 로그 크기 줄이기: 필요시 timestamp, msg만 보존하도록 조정 가능
};

export const logger = pino(options);

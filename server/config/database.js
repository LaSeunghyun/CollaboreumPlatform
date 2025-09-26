const { PrismaClient } = require('@prisma/client');
const { logger } = require('../src/logger');

const prisma = new PrismaClient();

const maskConnectionString = connectionString => {
  if (!connectionString) {
    return 'undefined';
  }

  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '****';
    }
    if (url.username) {
      url.username = '****';
    }
    return url.toString();
  } catch (error) {
    return connectionString;
  }
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const connectDatabase = async () => {
  const maxRetries = Number(process.env.PRISMA_MAX_RETRIES || 5);
  const baseDelay = Number(process.env.PRISMA_RETRY_DELAY_MS || 2000);
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    attempt += 1;

    try {
      await prisma.$connect();
      logger.info(
        {
          attempt,
          datasource: maskConnectionString(process.env.DATABASE_URL),
        },
        'Connected to PostgreSQL via Prisma',
      );

      return prisma;
    } catch (error) {
      lastError = error;
      logger.error(
        {
          attempt,
          maxRetries,
          error: error.message,
        },
        'Failed to connect to PostgreSQL via Prisma',
      );

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * attempt, 15000);
        logger.warn({ delay }, 'Retrying Prisma connection');
        await wait(delay);
      }
    }
  }

  logger.error('Prisma connection failed after maximum retries');
  throw lastError;
};

const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected cleanly');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting Prisma client');
  }
};

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};

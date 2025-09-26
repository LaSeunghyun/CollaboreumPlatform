const { PrismaClient } = require('@prisma/client');

let prisma;

if (!global.__PRISMA_CLIENT__) {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    global.__PRISMA_CLIENT__ = prisma;
  }
} else {
  prisma = global.__PRISMA_CLIENT__;
}

module.exports = {
  prisma,
};

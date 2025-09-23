// Core HTTP utilities
export * from './core/client';

// Domain-specific API modules
export * from './modules/admin';
export * from './modules/artist';
export * from './modules/auth';
export * from './modules/category';
export * from './modules/community';
export * from './modules/constants';
export * from './modules/events';
export * from './modules/funding';
export * from './modules/gallery';
export * from './modules/interaction';
export * from './modules/livestream';
export * from './modules/stats';
export * from './modules/user';

// Higher level service helpers
export * from './services/constants';
export * from './services/constantsService';
export * from './services/fundingService';
export * from './services/paymentService';
export * from './services/revenueService';

// Data mappers
export { mapFundingProjectDetail } from './mappers/fundingProjectMapper';

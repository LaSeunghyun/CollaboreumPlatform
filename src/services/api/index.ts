// Base utilities and shared helpers
export * from './base';

// Domain-specific API modules
export * from './artist';
export * from './admin';
export * from './gallery';
export * from './community';
export * from './funding';
export * from './user';
export * from './auth';
export * from './interaction';
export * from './events';
export * from './livestream';
export * from './category';
export * from './stats';
export * from './constants';

// Re-export the mapper for backward compatibility
export { mapFundingProjectDetail } from '../fundingProjectMapper';

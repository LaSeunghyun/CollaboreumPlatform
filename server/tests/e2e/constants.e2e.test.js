const request = require('supertest');
const TestSetup = require('../setup/testSetup');

describe('Constants API integration', () => {
  let testSetup;
  let app;
  let shouldSkip = false;

  beforeAll(async () => {
    testSetup = new TestSetup();
    try {
      const uri = await testSetup.setupDatabase();
      if (!uri) {
        shouldSkip = true;
        return;
      }
      app = require('../../server/server');
    } catch (error) {
      console.warn('Skipping constants integration tests: database unavailable.', error);
      shouldSkip = true;
    }
  });

  afterAll(async () => {
    if (testSetup) {
      await testSetup.cleanupDatabase();
    }
  });

  const skipIfNeeded = () => shouldSkip;

  it('returns sort options for funding projects', async () => {
    if (skipIfNeeded()) {
      return;
    }

    await request(app)
      .get('/api/constants/sort-options/funding')
      .expect(200)
      .expect(response => {
        expect(response.body?.success).toBe(true);
        const values = response.body?.data?.map(option => option.value);
        expect(values).toContain('amount');
        expect(values).toContain('backers');
      });
  });
});

const request = require('supertest');
const bcrypt = require('bcryptjs');
const TestSetup = require('../setup/testSetup');
const User = require('../../models/User');

describe('Auth cookie transport', () => {
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
      console.warn('Skipping auth cookie e2e tests: unable to initialise database.', error);
      shouldSkip = true;
    }
  });

  afterAll(async () => {
    if (testSetup) {
      await testSetup.cleanupDatabase();
    }
  });

  beforeEach(async () => {
    if (shouldSkip) {
      return;
    }

    await testSetup.clearCollections();

    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: '쿠키 사용자',
      username: 'cookie-user',
      email: 'cookie@example.com',
      password: hashedPassword,
      role: 'fan',
      isActive: true,
    });
  });

  const skipIfNeeded = () => shouldSkip;

  it('sets httpOnly cookies on login and authenticates via cookie header', async () => {
    if (skipIfNeeded()) {
      return;
    }

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cookie@example.com', password: 'password123' })
      .expect(200);

    const setCookieHeader = loginResponse.headers['set-cookie'];
    expect(Array.isArray(setCookieHeader)).toBe(true);
    const accessCookie = setCookieHeader.find(cookie =>
      cookie.startsWith('collab_access_token='),
    );

    expect(accessCookie).toBeDefined();

    const serializedCookie = accessCookie.split(';')[0];

    await request(app)
      .get('/api/users/profile')
      .set('Cookie', serializedCookie)
      .expect(200)
      .expect(response => {
        expect(response.body?.success).toBe(true);
        expect(response.body?.data?.user?.email).toBe('cookie@example.com');
      });
  });
});

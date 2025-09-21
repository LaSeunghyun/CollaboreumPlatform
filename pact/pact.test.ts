import { Pact } from '@pact-foundation/pact';
import path from 'path';
import fetch from 'node-fetch';

const provider = new Pact({
  consumer: 'Frontend',
  provider: 'Backend',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'INFO',
  spec: 2,
});

describe('API Contract Tests', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('Authentication API', () => {
    it('POST /api/auth/login returns user and token', async () => {
      await provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'a login request',
        withRequest: {
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            token: 'jwt-token-here',
            user: {
              id: 'user-id-123',
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
            },
          },
        },
      });

      const response = await fetch(
        `${provider.mockService.baseUrl}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.token).toBeTruthy();
      expect(data.user.email).toBe('test@example.com');
    });

    it('POST /api/auth/register creates new user', async () => {
      await provider.addInteraction({
        state: 'no user exists',
        uponReceiving: 'a registration request',
        withRequest: {
          method: 'POST',
          path: '/api/auth/register',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            message: 'User created successfully',
            user: {
              id: 'new-user-id-456',
              email: 'newuser@example.com',
              name: 'New User',
              role: 'user',
            },
          },
        },
      });

      const response = await fetch(
        `${provider.mockService.baseUrl}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
          }),
        },
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('newuser@example.com');
    });
  });

  describe('Community API', () => {
    it('GET /api/community/posts returns posts list', async () => {
      await provider.addInteraction({
        state: 'posts exist',
        uponReceiving: 'a request for community posts',
        withRequest: {
          method: 'GET',
          path: '/api/community/posts',
          query: 'page=1&limit=10',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            posts: [
              {
                id: 'post-1',
                title: 'Test Post',
                content: 'This is a test post',
                category: 'general',
                author: {
                  id: 'user-1',
                  name: 'Test Author',
                },
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              pages: 1,
            },
          },
        },
      });

      const response = await fetch(
        `${provider.mockService.baseUrl}/api/community/posts?page=1&limit=10`,
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.pagination).toBeTruthy();
    });
  });

  describe('Projects API', () => {
    it('GET /api/projects returns projects list', async () => {
      await provider.addInteraction({
        state: 'projects exist',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'GET',
          path: '/api/projects',
          query: 'page=1&limit=10',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            projects: [
              {
                id: 'project-1',
                title: 'Test Project',
                description: 'This is a test project',
                status: 'active',
                targetAmount: 10000,
                currentAmount: 5000,
                backersCount: 25,
                deadline: '2024-12-31T23:59:59Z',
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              pages: 1,
            },
          },
        },
      });

      const response = await fetch(
        `${provider.mockService.baseUrl}/api/projects?page=1&limit=10`,
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.projects)).toBe(true);
    });
  });

  describe('Search API', () => {
    it('GET /api/search returns search results', async () => {
      await provider.addInteraction({
        state: 'search data exists',
        uponReceiving: 'a search request',
        withRequest: {
          method: 'GET',
          path: '/api/search',
          query: 'query=test&type=all',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            results: {
              artists: [],
              projects: [],
              events: [],
              posts: [],
              total: 0,
            },
          },
        },
      });

      const response = await fetch(
        `${provider.mockService.baseUrl}/api/search?query=test&type=all`,
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.results).toBeTruthy();
    });
  });
});

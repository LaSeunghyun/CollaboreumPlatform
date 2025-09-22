import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';

import { ArtistProfileRoute } from '../ArtistProfileRoute';
import { EventDetailRoute } from '../EventDetailRoute';
import { ProjectDetailRoute } from '../ProjectDetailRoute';
import { artistAPI } from '@/services/api/artist';
import { eventManagementAPI } from '@/services/api/events';
import { fundingAPI } from '@/services/api/funding';
import { interactionAPI } from '@/services/api/interaction';

jest.mock('@/lib/api/useCategories', () => ({
  useCategories: () => ({ data: null }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

describe('Detail route wrappers', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => undefined as never);
    jest.spyOn(window, 'open').mockImplementation(() => null);
    Object.assign(navigator, {
      share: jest.fn(),
      clipboard: { writeText: jest.fn() },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls artist API with handle from params', async () => {
    const getArtistSpy = jest
      .spyOn(artistAPI, 'getArtistById')
      .mockResolvedValue({
        success: true,
        data: {
          coverImage: '',
          name: '테스트 아티스트',
          category: '음악',
          username: 'artist123',
          bio: '소개',
          location: '서울',
          joinDate: '2024-01-01',
          website: 'https://example.com',
          tags: [],
          followers: 0,
          posts: 0,
          following: 0,
          profileImage: '',
          activeProject: null,
        },
      } as any);

    render(
      <MemoryRouter initialEntries={['/artists/42']}>
        <Routes>
          <Route path='/artists/:handle' element={<ArtistProfileRoute />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getArtistSpy).toHaveBeenCalledWith('42');
    });
  });

  it('calls project API with slug from params', async () => {
    jest
      .spyOn(fundingAPI, 'backProject')
      .mockResolvedValue({ success: true } as any);
    jest
      .spyOn(fundingAPI, 'likeProject')
      .mockResolvedValue({ success: true } as any);
    jest
      .spyOn(fundingAPI, 'bookmarkProject')
      .mockResolvedValue({ success: true } as any);
    jest
      .spyOn(interactionAPI, 'followArtist')
      .mockResolvedValue({ success: true } as any);

    const getProjectSpy = jest
      .spyOn(fundingAPI, 'getProject')
      .mockResolvedValue({
        success: true,
        data: {
          image: '',
          title: '테스트 프로젝트',
          featured: false,
          category: '예술',
          artistAvatar: '',
          artist: '테스트 아티스트',
          artistRating: 4.5,
          artistId: 1,
          description: '설명',
          currentAmount: 0,
          targetAmount: 100,
          backers: 0,
          daysLeft: 10,
          story: '스토리',
          rewards: [],
          updates: [],
          comments: [],
        },
      } as any);

    render(
      <MemoryRouter initialEntries={['/projects/123']}>
        <Routes>
          <Route path='/projects/:slug' element={<ProjectDetailRoute />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getProjectSpy).toHaveBeenCalledWith('123');
    });
  });

  it('calls event API with id from params', async () => {
    jest
      .spyOn(eventManagementAPI, 'joinEvent')
      .mockResolvedValue({ success: true } as any);
    jest
      .spyOn(eventManagementAPI, 'leaveEvent')
      .mockResolvedValue({ success: true } as any);
    jest
      .spyOn(eventManagementAPI, 'likeEvent')
      .mockResolvedValue({ success: true } as any);
    jest
      .spyOn(eventManagementAPI, 'bookmarkEvent')
      .mockResolvedValue({ success: true } as any);

    const getEventSpy = jest
      .spyOn(eventManagementAPI, 'getEvent')
      .mockResolvedValue({
        success: true,
        data: {
          title: '테스트 이벤트',
          coverImage: '',
          status: 'upcoming',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          location: '서울',
          time: '18:00',
          capacity: 100,
          participants: [],
          description: '이벤트 설명',
          agenda: [],
          speaker: {
            name: '연사',
            role: '주최자',
            avatar: '',
          },
          tags: [],
        },
      } as any);

    render(
      <MemoryRouter initialEntries={['/events/alpha']}>
        <Routes>
          <Route path='/events/:id' element={<EventDetailRoute />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getEventSpy).toHaveBeenCalledWith('alpha');
    });
  });
});

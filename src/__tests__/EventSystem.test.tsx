import React from 'react';
import { fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Test wrapper component - removed unused component

describe('이벤트 시스템 TDD 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('1. 이벤트 데이터 모델 테스트', () => {
    test('이벤트 객체가 올바른 구조를 가져야 한다', () => {
      const event = {
        id: 'event-1',
        title: '재즈 콘서트',
        description: '특별한 재즈 콘서트를 개최합니다',
        category: '음악',
        type: '콘서트',
        startDate: '2024-03-15T19:00:00Z',
        endDate: '2024-03-15T22:00:00Z',
        location: '서울 예술의전당',
        maxParticipants: 200,
        currentParticipants: 150,
        price: 50000,
        artist: {
          id: 'artist-1',
          name: '재즈 아티스트',
          avatar: '/avatar.jpg',
        },
        status: '진행중',
        tags: ['재즈', '콘서트', '라이브'],
        image: '/event-image.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('category');
      expect(event).toHaveProperty('startDate');
      expect(event).toHaveProperty('endDate');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('maxParticipants');
      expect(event).toHaveProperty('currentParticipants');
      expect(event).toHaveProperty('price');
      expect(event).toHaveProperty('artist');
      expect(event).toHaveProperty('status');
      expect(event).toHaveProperty('tags');
      expect(event).toHaveProperty('image');
    });

    test('이벤트 상태가 올바르게 관리되어야 한다', () => {
      const getEventStatus = (
        startDate: string,
        endDate: string,
        maxParticipants: number,
        currentParticipants: number,
      ) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) return '예정';
        if (now > end) return '종료';
        if (currentParticipants >= maxParticipants) return '마감';
        return '진행중';
      };

      const futureEvent = getEventStatus(
        '2024-12-31T19:00:00Z',
        '2024-12-31T22:00:00Z',
        200,
        150,
      );
      expect(futureEvent).toBe('예정');

      const ongoingEvent = getEventStatus(
        '2024-01-01T19:00:00Z',
        '2024-12-31T22:00:00Z',
        200,
        150,
      );
      expect(ongoingEvent).toBe('진행중');

      const fullEvent = getEventStatus(
        '2024-01-01T19:00:00Z',
        '2024-12-31T22:00:00Z',
        200,
        200,
      );
      expect(fullEvent).toBe('마감');

      const pastEvent = getEventStatus(
        '2024-01-01T19:00:00Z',
        '2024-01-01T22:00:00Z',
        200,
        150,
      );
      expect(pastEvent).toBe('종료');
    });
  });

  describe('2. 이벤트 생성 폼 유효성 검사 테스트', () => {
    test('이벤트 생성 폼의 모든 필드 유효성 검사가 올바르게 작동해야 한다', () => {
      const validateEventForm = (formData: any) => {
        const errors: string[] = [];

        // 제목 검증
        if (!formData.title || formData.title.trim().length < 3) {
          errors.push('제목은 최소 3자 이상이어야 합니다');
        }
        if (formData.title && formData.title.trim().length > 200) {
          errors.push('제목은 최대 200자까지 입력 가능합니다');
        }

        // 설명 검증
        if (!formData.description || formData.description.trim().length < 10) {
          errors.push('설명은 최소 10자 이상이어야 합니다');
        }
        if (formData.description && formData.description.trim().length > 2000) {
          errors.push('설명은 최대 2000자까지 입력 가능합니다');
        }

        // 카테고리 검증
        const validCategories = ['음악', '미술', '공연', '문학', '기타'];
        if (
          !formData.category ||
          !validCategories.includes(formData.category)
        ) {
          errors.push('유효한 카테고리를 선택해야 합니다');
        }

        // 날짜 검증
        if (!formData.startDate || !formData.endDate) {
          errors.push('시작일과 종료일을 모두 설정해야 합니다');
        } else {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          const now = new Date();

          if (start <= now) {
            errors.push('시작일은 현재 날짜 이후여야 합니다');
          }
          if (end <= start) {
            errors.push('종료일은 시작일 이후여야 합니다');
          }
        }

        // 참가자 수 검증
        if (!formData.maxParticipants || formData.maxParticipants < 1) {
          errors.push('최대 참가자 수는 1명 이상이어야 합니다');
        }
        if (formData.maxParticipants && formData.maxParticipants > 10000) {
          errors.push('최대 참가자 수는 10,000명까지 설정 가능합니다');
        }

        // 가격 검증
        if (formData.price && formData.price < 0) {
          errors.push('가격은 0원 이상이어야 합니다');
        }

        return errors;
      };

      // 유효한 데이터 테스트
      const validFormData = {
        title: '완벽한 이벤트',
        description:
          '이것은 완벽하게 작성된 이벤트 설명입니다. 모든 필수 필드가 올바르게 입력되었습니다.',
        category: '음악',
        startDate: '2024-12-31T19:00:00Z',
        endDate: '2024-12-31T22:00:00Z',
        maxParticipants: 200,
        price: 50000,
      };

      expect(validateEventForm(validFormData)).toHaveLength(0);

      // 유효하지 않은 데이터 테스트
      const invalidFormData = {
        title: '짧',
        description: '짧음',
        category: '잘못된카테고리',
        startDate: '2024-01-01T19:00:00Z',
        endDate: '2024-01-01T19:00:00Z',
        maxParticipants: 0,
        price: -1000,
      };

      const validationErrors = validateEventForm(invalidFormData);
      expect(validationErrors).toHaveLength(7);
      expect(validationErrors).toContain('제목은 최소 3자 이상이어야 합니다');
      expect(validationErrors).toContain('설명은 최소 10자 이상이어야 합니다');
      expect(validationErrors).toContain('유효한 카테고리를 선택해야 합니다');
      expect(validationErrors).toContain('시작일은 현재 날짜 이후여야 합니다');
      expect(validationErrors).toContain('종료일은 시작일 이후여야 합니다');
      expect(validationErrors).toContain(
        '최대 참가자 수는 1명 이상이어야 합니다',
      );
      expect(validationErrors).toContain('가격은 0원 이상이어야 합니다');
    });
  });

  describe('3. 이벤트 참가자 관리 테스트', () => {
    test('이벤트 참가 신청이 올바르게 처리되어야 한다', () => {
      const event = {
        id: 'event-1',
        maxParticipants: 200,
        currentParticipants: 150,
        price: 50000,
      };

      const processParticipation = (
        event: any,
        userId: string,
        paymentMethod: string,
      ) => {
        // 참가 가능 여부 확인
        if (event.currentParticipants >= event.maxParticipants) {
          throw new Error('이벤트가 마감되었습니다');
        }

        // 결제 처리 (실제로는 결제 게이트웨이 연동)
        const paymentResult = {
          success: true,
          transactionId: `txn_${Date.now()}`,
          amount: event.price,
          status: 'completed',
        };

        if (!paymentResult.success) {
          throw new Error('결제에 실패했습니다');
        }

        // 참가자 추가
        const participant = {
          id: `participant_${Date.now()}`,
          userId,
          eventId: event.id,
          joinedAt: new Date().toISOString(),
          paymentId: paymentResult.transactionId,
          status: 'confirmed',
        };

        return {
          participant,
          payment: paymentResult,
          eventUpdated: {
            ...event,
            currentParticipants: event.currentParticipants + 1,
          },
        };
      };

      const result = processParticipation(event, 'user-1', 'card');

      expect(result.participant.userId).toBe('user-1');
      expect(result.participant.eventId).toBe('event-1');
      expect(result.participant.status).toBe('confirmed');
      expect(result.eventUpdated.currentParticipants).toBe(151);
      expect(result.payment.success).toBe(true);
    });

    test('이벤트 참가 취소가 올바르게 처리되어야 한다', () => {
      const event = {
        id: 'event-1',
        currentParticipants: 150,
      };

      const participant = {
        id: 'participant-1',
        userId: 'user-1',
        eventId: 'event-1',
        joinedAt: '2024-01-01T00:00:00Z',
        status: 'confirmed',
      };

      const cancelParticipation = (
        event: any,
        participant: any,
        cancelReason: string,
      ) => {
        // 취소 가능 여부 확인 (24시간 전까지)
        const joinedDate = new Date(participant.joinedAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          throw new Error('참가 취소는 24시간 이내에만 가능합니다');
        }

        // 환불 처리 (실제로는 환불 게이트웨이 연동)
        const refundResult = {
          success: true,
          refundId: `refund_${Date.now()}`,
          amount: 50000,
          status: 'completed',
        };

        // 참가자 상태 변경
        const updatedParticipant = {
          ...participant,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason,
        };

        // 이벤트 참가자 수 감소
        const updatedEvent = {
          ...event,
          currentParticipants: event.currentParticipants - 1,
        };

        return {
          participant: updatedParticipant,
          refund: refundResult,
          event: updatedEvent,
        };
      };

      const result = cancelParticipation(event, participant, '개인 사정');

      expect(result.participant.status).toBe('cancelled');
      expect(result.participant.cancelReason).toBe('개인 사정');
      expect(result.event.currentParticipants).toBe(149);
      expect(result.refund.success).toBe(true);
    });
  });

  describe('4. 이벤트 검색 및 필터링 테스트', () => {
    test('이벤트 검색이 올바르게 작동해야 한다', () => {
      const events = [
        {
          id: '1',
          title: '재즈 콘서트',
          description: '특별한 재즈 콘서트',
          category: '음악',
          location: '서울',
          tags: ['재즈', '콘서트'],
        },
        {
          id: '2',
          title: '클래식 음악회',
          description: '클래식 음악 공연',
          category: '음악',
          location: '부산',
          tags: ['클래식', '공연'],
        },
        {
          id: '3',
          title: '현대 미술 전시',
          description: '현대 미술 작품 전시',
          category: '미술',
          location: '서울',
          tags: ['미술', '전시'],
        },
      ];

      const searchEvents = (events: any[], query: string, filters: any) => {
        let filteredEvents = events;

        // 검색어 필터링
        if (query) {
          const searchTerm = query.toLowerCase();
          filteredEvents = filteredEvents.filter(
            event =>
              event.title.toLowerCase().includes(searchTerm) ||
              event.description.toLowerCase().includes(searchTerm) ||
              event.tags.some((tag: string) =>
                tag.toLowerCase().includes(searchTerm),
              ),
          );
        }

        // 카테고리 필터링
        if (filters.category && filters.category !== '전체') {
          filteredEvents = filteredEvents.filter(
            event => event.category === filters.category,
          );
        }

        // 지역 필터링
        if (filters.location && filters.location !== '전체') {
          filteredEvents = filteredEvents.filter(
            event => event.location === filters.location,
          );
        }

        // 가격 범위 필터링
        if (filters.minPrice || filters.maxPrice) {
          filteredEvents = filteredEvents.filter(event => {
            const price = event.price || 0;
            if (filters.minPrice && price < filters.minPrice) return false;
            if (filters.maxPrice && price > filters.maxPrice) return false;
            return true;
          });
        }

        return filteredEvents;
      };

      // 검색어만으로 검색
      const searchResults = searchEvents(events, '재즈', {});
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('재즈 콘서트');

      // 카테고리로 필터링
      const musicEvents = searchEvents(events, '', { category: '음악' });
      expect(musicEvents).toHaveLength(2);

      // 지역으로 필터링
      const seoulEvents = searchEvents(events, '', { location: '서울' });
      expect(seoulEvents).toHaveLength(2);

      // 복합 필터링
      const seoulMusicEvents = searchEvents(events, '', {
        category: '음악',
        location: '서울',
      });
      expect(seoulMusicEvents).toHaveLength(1);
      expect(seoulMusicEvents[0].title).toBe('재즈 콘서트');
    });
  });

  describe('5. 이벤트 알림 시스템 테스트', () => {
    test('이벤트 시작 전 알림이 올바르게 발송되어야 한다', () => {
      const event = {
        id: 'event-1',
        title: '재즈 콘서트',
        startDate: '2024-03-15T19:00:00Z',
        participants: [
          { id: 'p1', userId: 'user-1', email: 'user1@test.com' },
          { id: 'p2', userId: 'user-2', email: 'user2@test.com' },
        ],
      };

      const sendEventReminder = (event: any, hoursBefore: number) => {
        const now = new Date();
        const eventStart = new Date(event.startDate);
        const timeDiff = eventStart.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff <= hoursBefore && hoursDiff > 0) {
          const notifications = event.participants.map((participant: any) => ({
            id: `notif_${Date.now()}_${participant.id}`,
            userId: participant.userId,
            email: participant.email,
            type: 'event_reminder',
            title: `${event.title} 시작 ${hoursBefore}시간 전`,
            message: `${event.title}이 ${hoursBefore}시간 후에 시작됩니다.`,
            eventId: event.id,
            sentAt: new Date().toISOString(),
          }));

          return {
            sent: true,
            notifications,
            message: `${notifications.length}명에게 알림을 발송했습니다`,
          };
        }

        return {
          sent: false,
          message: '알림 발송 시기가 아닙니다',
        };
      };

      // 24시간 전 알림 테스트
      const reminder24h = sendEventReminder(event, 24);
      expect(reminder24h.sent).toBe(true);
      expect(reminder24h.notifications).toHaveLength(2);
      expect(reminder24h.notifications[0].type).toBe('event_reminder');

      // 1시간 전 알림 테스트
      const reminder1h = sendEventReminder(event, 1);
      expect(reminder1h.sent).toBe(true);
      expect(reminder1h.notifications).toHaveLength(2);
    });

    test('이벤트 변경사항 알림이 올바르게 발송되어야 한다', () => {
      const event = {
        id: 'event-1',
        title: '재즈 콘서트',
        participants: [
          { id: 'p1', userId: 'user-1', email: 'user1@test.com' },
          { id: 'p2', userId: 'user-2', email: 'user2@test.com' },
        ],
      };

      const sendEventUpdateNotification = (
        event: any,
        updateType: string,
        updateDetails: any,
      ) => {
        const notifications = event.participants.map((participant: any) => ({
          id: `notif_${Date.now()}_${participant.id}`,
          userId: participant.userId,
          email: participant.email,
          type: 'event_update',
          title: `${event.title} 정보 변경`,
          message: `${updateType}: ${updateDetails}`,
          eventId: event.id,
          updateType,
          updateDetails,
          sentAt: new Date().toISOString(),
        }));

        return {
          sent: true,
          notifications,
          message: `${notifications.length}명에게 변경사항을 알렸습니다`,
        };
      };

      const result = sendEventUpdateNotification(
        event,
        '시간 변경',
        '시작 시간이 19:00에서 20:00으로 변경되었습니다',
      );

      expect(result.sent).toBe(true);
      expect(result.notifications).toHaveLength(2);
      expect(result.notifications[0].type).toBe('event_update');
      expect(result.notifications[0].updateType).toBe('시간 변경');
    });
  });

  describe('6. 이벤트 통계 및 분석 테스트', () => {
    test('이벤트 참가율 통계가 올바르게 계산되어야 한다', () => {
      const events = [
        {
          id: '1',
          title: '재즈 콘서트',
          maxParticipants: 200,
          currentParticipants: 180,
          price: 50000,
        },
        {
          id: '2',
          title: '클래식 음악회',
          maxParticipants: 150,
          currentParticipants: 120,
          price: 80000,
        },
        {
          id: '3',
          title: '현대 미술 전시',
          maxParticipants: 100,
          currentParticipants: 80,
          price: 30000,
        },
      ];

      const calculateEventStats = (events: any[]) => {
        const totalEvents = events.length;
        const totalMaxParticipants = events.reduce(
          (sum, event) => sum + event.maxParticipants,
          0,
        );
        const totalCurrentParticipants = events.reduce(
          (sum, event) => sum + event.currentParticipants,
          0,
        );
        const totalRevenue = events.reduce(
          (sum, event) => sum + event.currentParticipants * event.price,
          0,
        );

        const averageParticipationRate =
          totalMaxParticipants > 0
            ? (totalCurrentParticipants / totalMaxParticipants) * 100
            : 0;

        const popularEvents = events
          .filter(
            event => event.currentParticipants / event.maxParticipants > 0.8,
          )
          .sort(
            (a, b) =>
              b.currentParticipants / b.maxParticipants -
              a.currentParticipants / a.maxParticipants,
          );

        return {
          totalEvents,
          totalMaxParticipants,
          totalCurrentParticipants,
          totalRevenue,
          averageParticipationRate:
            Math.round(averageParticipationRate * 100) / 100,
          popularEvents: popularEvents.map(event => ({
            title: event.title,
            participationRate: Math.round(
              (event.currentParticipants / event.maxParticipants) * 100,
            ),
          })),
        };
      };

      const stats = calculateEventStats(events);

      expect(stats.totalEvents).toBe(3);
      expect(stats.totalMaxParticipants).toBe(450);
      expect(stats.totalCurrentParticipants).toBe(380);
      expect(stats.totalRevenue).toBe(18000000); // 180*50000 + 120*80000 + 80*30000
      expect(stats.averageParticipationRate).toBe(84.44);
      expect(stats.popularEvents).toHaveLength(2);
      expect(stats.popularEvents[0].title).toBe('재즈 콘서트');
      expect(stats.popularEvents[0].participationRate).toBe(90);
    });
  });

  describe('7. 이벤트 권한 관리 테스트', () => {
    test('이벤트 생성 권한이 올바르게 관리되어야 한다', () => {
      const checkEventCreationPermission = (user: any) => {
        if (!user) {
          throw new Error('로그인이 필요합니다');
        }

        if (user.role === 'admin') {
          return {
            allowed: true,
            message: '관리자는 모든 이벤트를 생성할 수 있습니다',
          };
        }

        if (user.role === 'artist') {
          return {
            allowed: true,
            message: '아티스트는 이벤트를 생성할 수 있습니다',
          };
        }

        if (user.role === 'fan') {
          return {
            allowed: false,
            message: '팬은 이벤트를 생성할 수 없습니다',
          };
        }

        return { allowed: false, message: '알 수 없는 사용자 역할입니다' };
      };

      // 아티스트 권한 테스트
      const artistUser = {
        id: 'artist-1',
        role: 'artist',
        name: '테스트 아티스트',
      };
      const artistPermission = checkEventCreationPermission(artistUser);
      expect(artistPermission.allowed).toBe(true);

      // 팬 권한 테스트
      const fanUser = { id: 'fan-1', role: 'fan', name: '테스트 팬' };
      const fanPermission = checkEventCreationPermission(fanUser);
      expect(fanPermission.allowed).toBe(false);

      // 관리자 권한 테스트
      const adminUser = { id: 'admin-1', role: 'admin', name: '테스트 관리자' };
      const adminPermission = checkEventCreationPermission(adminUser);
      expect(adminPermission.allowed).toBe(true);

      // 로그인하지 않은 사용자 테스트
      expect(() => {
        checkEventCreationPermission(null);
      }).toThrow('로그인이 필요합니다');
    });

    test('이벤트 수정 권한이 올바르게 관리되어야 한다', () => {
      const checkEventEditPermission = (user: any, event: any) => {
        if (!user) {
          throw new Error('로그인이 필요합니다');
        }

        if (user.role === 'admin') {
          return {
            allowed: true,
            message: '관리자는 모든 이벤트를 수정할 수 있습니다',
          };
        }

        if (user.role === 'artist' && event.artist.id === user.id) {
          return {
            allowed: true,
            message: '자신의 이벤트를 수정할 수 있습니다',
          };
        }

        if (user.role === 'artist' && event.artist.id !== user.id) {
          return {
            allowed: false,
            message: '다른 아티스트의 이벤트를 수정할 수 없습니다',
          };
        }

        return { allowed: false, message: '이벤트를 수정할 권한이 없습니다' };
      };

      const event = {
        id: 'event-1',
        title: '재즈 콘서트',
        artist: { id: 'artist-1', name: '재즈 아티스트' },
      };

      // 이벤트 소유자 권한 테스트
      const ownerUser = {
        id: 'artist-1',
        role: 'artist',
        name: '재즈 아티스트',
      };
      const ownerPermission = checkEventEditPermission(ownerUser, event);
      expect(ownerPermission.allowed).toBe(true);

      // 다른 아티스트 권한 테스트
      const otherArtistUser = {
        id: 'artist-2',
        role: 'artist',
        name: '다른 아티스트',
      };
      const otherArtistPermission = checkEventEditPermission(
        otherArtistUser,
        event,
      );
      expect(otherArtistPermission.allowed).toBe(false);

      // 관리자 권한 테스트
      const adminUser = { id: 'admin-1', role: 'admin', name: '테스트 관리자' };
      const adminPermission = checkEventEditPermission(adminUser, event);
      expect(adminPermission.allowed).toBe(true);
    });
  });

  describe('8. 이벤트 데이터 검증 및 보안 테스트', () => {
    test('이벤트 입력 데이터의 보안 검증이 올바르게 작동해야 한다', () => {
      const validateEventInput = (
        input: string,
        type: 'text' | 'email' | 'url' | 'number',
      ) => {
        const errors: string[] = [];

        // XSS 방지
        if (
          input.includes('<script>') ||
          input.includes('javascript:') ||
          input.includes('onerror=')
        ) {
          errors.push('잠재적으로 위험한 입력이 감지되었습니다');
        }

        // SQL 인젝션 방지
        if (
          input.includes(';') ||
          input.includes('--') ||
          input.includes('DROP') ||
          input.includes('DELETE')
        ) {
          errors.push('잠재적으로 위험한 입력이 감지되었습니다');
        }

        // 타입별 검증
        switch (type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
              errors.push('유효한 이메일 형식이 아닙니다');
            }
            break;
          case 'url':
            if (!/^https?:\/\/.+/.test(input)) {
              errors.push('유효한 URL 형식이 아닙니다');
            }
            break;
          case 'number':
            if (isNaN(Number(input))) {
              errors.push('유효한 숫자가 아닙니다');
            }
            break;
        }

        return errors;
      };

      // 안전한 입력 테스트
      expect(validateEventInput('안전한 텍스트', 'text')).toHaveLength(0);
      expect(validateEventInput('test@example.com', 'email')).toHaveLength(0);
      expect(validateEventInput('https://example.com', 'url')).toHaveLength(0);
      expect(validateEventInput('123', 'number')).toHaveLength(0);

      // 위험한 입력 테스트
      expect(() => {
        validateEventInput('<script>alert("XSS")</script>', 'text');
      }).toThrow('잠재적으로 위험한 입력이 감지되었습니다');
    });

    test('이벤트 파일 업로드 보안이 올바르게 검증되어야 한다', () => {
      const validateEventFile = (file: File) => {
        const errors: string[] = [];
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
        ];

        if (file.size > maxFileSize) {
          errors.push('파일 크기는 10MB 이하여야 합니다');
        }

        if (!allowedTypes.includes(file.type)) {
          errors.push('지원하지 않는 파일 형식입니다');
        }

        // 파일명 보안 검증
        const fileName = file.name.toLowerCase();
        if (
          fileName.includes('.exe') ||
          fileName.includes('.bat') ||
          fileName.includes('.sh')
        ) {
          errors.push('실행 파일은 업로드할 수 없습니다');
        }

        return errors;
      };

      // 유효한 파일 테스트
      const validFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      expect(validateEventFile(validFile)).toHaveLength(0);

      // 유효하지 않은 파일 테스트
      const largeFile = new File(
        ['test'.repeat(1024 * 1024 * 11)],
        'large.jpg',
        { type: 'image/jpeg' },
      );
      const largeFileErrors = validateEventFile(largeFile);
      expect(largeFileErrors).toHaveLength(1);
      expect(largeFileErrors[0]).toBe('파일 크기는 10MB 이하여야 합니다');

      const invalidTypeFile = new File(['test'], 'document.pdf', {
        type: 'application/pdf',
      });
      const invalidTypeErrors = validateEventFile(invalidTypeFile);
      expect(invalidTypeErrors).toHaveLength(1);
      expect(invalidTypeErrors[0]).toBe('지원하지 않는 파일 형식입니다');
    });
  });
});

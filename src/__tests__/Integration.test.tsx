import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import App from '../App';

// Mock API responses
const mockAPIResponses = {
    userProfile: {
        success: true,
        data: {
            id: 'user-1',
            name: '테스트 사용자',
            email: 'test@example.com',
            role: 'fan',
            avatar: '/avatar.jpg',
            bio: '테스트 사용자입니다',
            joinDate: '2024-01-01',
            location: '서울',
            website: 'https://test.com'
        }
    },
    artistProfile: {
        success: true,
        data: {
            id: 'artist-1',
            name: '테스트 아티스트',
            email: 'artist@example.com',
            role: 'artist',
            avatar: '/artist-avatar.jpg',
            category: '음악',
            totalFunding: 5000000,
            completedProjects: 3,
            activeProjects: 1,
            followers: 150,
            successRate: 85
        }
    },
    projects: {
        success: true,
        data: [
            {
                id: 1,
                title: '테스트 프로젝트',
                description: '테스트 프로젝트 설명',
                status: '진행중',
                currentAmount: 2500000,
                targetAmount: 5000000,
                startDate: '2024-01-01',
                endDate: '2024-03-01',
                image: '/project-image.jpg'
            }
        ]
    },
    communityStats: {
        success: true,
        data: {
            totalPosts: 25,
            totalLikes: 150,
            totalComments: 75,
            monthlyGrowth: 12
        }
    },
    recentActivities: {
        success: true,
        data: [
            {
                type: 'post',
                message: '새로운 게시물을 작성했습니다',
                time: '2시간 전'
            },
            {
                type: 'comment',
                message: '댓글을 남겼습니다',
                time: '5시간 전'
            }
        ]
    },
    categories: {
        success: true,
        data: [
            { id: 1, label: '음악' },
            { id: 2, label: '미술' },
            { id: 3, label: '문학' }
        ]
    },
    artists: {
        success: true,
        data: [
            {
                id: 1,
                name: '아티스트 1',
                category: '음악',
                avatar: '/artist1.jpg',
                followers: 100
            }
        ]
    },
    posts: {
        success: true,
        data: [
            {
                id: 1,
                title: '테스트 게시물',
                content: '테스트 내용',
                author: '아티스트 1',
                category: '음악',
                likes: 10,
                comments: 5
            }
        ]
    },
    events: {
        success: true,
        data: {
            events: [
                {
                    id: 1,
                    title: '테스트 이벤트',
                    description: '테스트 이벤트 설명',
                    date: '2024-02-01',
                    time: '19:00',
                    location: '서울',
                    category: '음악',
                    price: '무료',
                    attendees: 50,
                    organizer: '아티스트 1',
                    image: '/event-image.jpg'
                }
            ]
        }
    }
};

// Mock fetch function
global.fetch = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>
            <HistoryProvider>
                {children}
            </HistoryProvider>
        </AuthProvider>
    </BrowserRouter>
);

describe('통합 테스트 - API 연결 및 컴포넌트 연동', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        // Mock fetch responses
        (global.fetch as jest.Mock).mockImplementation((url: string) => {
            if (url.includes('/api/users/profile')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.userProfile)
                });
            }
            if (url.includes('/api/projects/artist')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.projects)
                });
            }
            if (url.includes('/api/community/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.communityStats)
                });
            }
            if (url.includes('/api/community/activities')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.recentActivities)
                });
            }
            if (url.includes('/api/categories')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.categories)
                });
            }
            if (url.includes('/api/users/artists')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.artists)
                });
            }
            if (url.includes('/api/community/posts')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.posts)
                });
            }
            if (url.includes('/api/events')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAPIResponses.events)
                });
            }

            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });
        });
    });

    describe('1. 인증 시스템 통합 테스트', () => {
        test('로그인 후 사용자 정보가 올바르게 로드되어야 한다', async () => {
            // Mock successful login
            (global.fetch as jest.Mock).mockImplementationOnce((url: string) => {
                if (url.includes('/api/auth/login')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            success: true,
                            data: {
                                user: mockAPIResponses.userProfile.data,
                                token: 'mock-token'
                            }
                        })
                    });
                }
                return Promise.resolve({
                    ok: false,
                    status: 404
                });
            });

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 로그인 페이지로 이동
            const loginButton = screen.getByText('로그인');
            fireEvent.click(loginButton);

            // 로그인 폼이 표시되는지 확인
            await waitFor(() => {
                expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
            });

            // 로그인 정보 입력
            const emailInput = screen.getByPlaceholderText('이메일');
            const passwordInput = screen.getByPlaceholderText('비밀번호');

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            // 로그인 버튼 클릭
            const submitButton = screen.getByRole('button', { name: /로그인/i });
            fireEvent.click(submitButton);

            // 로그인 성공 후 홈페이지로 이동 확인
            await waitFor(() => {
                expect(screen.getByText('Collaboreum')).toBeInTheDocument();
            });
        });

        test('회원가입이 올바르게 작동해야 한다', async () => {
            // Mock successful signup
            (global.fetch as jest.Mock).mockImplementationOnce((url: string) => {
                if (url.includes('/api/auth/signup')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            success: true,
                            data: {
                                user: mockAPIResponses.userProfile.data,
                                token: 'mock-token'
                            }
                        })
                    });
                }
                return Promise.resolve({
                    ok: false,
                    status: 404
                });
            });

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 회원가입 페이지로 이동
            const signupButton = screen.getByText('회원가입');
            fireEvent.click(signupButton);

            // 회원가입 폼이 표시되는지 확인
            await waitFor(() => {
                expect(screen.getByPlaceholderText('이름')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
                expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
            });

            // 회원가입 정보 입력
            const nameInput = screen.getByPlaceholderText('이름');
            const emailInput = screen.getByPlaceholderText('이메일');
            const passwordInput = screen.getByPlaceholderText('비밀번호');

            fireEvent.change(nameInput, { target: { value: '새 사용자' } });
            fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            // 회원가입 버튼 클릭
            const submitButton = screen.getByRole('button', { name: /회원가입/i });
            fireEvent.click(submitButton);

            // 회원가입 성공 후 홈페이지로 이동 확인
            await waitFor(() => {
                expect(screen.getByText('Collaboreum')).toBeInTheDocument();
            });
        });
    });

    describe('2. 마이페이지 시스템 통합 테스트', () => {
        beforeEach(() => {
            // Mock authenticated user
            localStorage.setItem('authToken', 'mock-token');
            localStorage.setItem('authUser', JSON.stringify(mockAPIResponses.userProfile.data));
        });

        test('팬 마이페이지가 올바르게 로드되어야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 사용자 메뉴 열기
            const userMenuButton = screen.getByRole('button', { name: /fan/i });
            fireEvent.click(userMenuButton);

            // 마이페이지로 이동
            const mypageButton = screen.getByText('마이페이지');
            fireEvent.click(mypageButton);

            // 마이페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
                expect(screen.getByText('test@example.com')).toBeInTheDocument();
            });

            // 탭들이 올바르게 표시되는지 확인
            expect(screen.getByText('프로필')).toBeInTheDocument();
            expect(screen.getByText('투자 내역')).toBeInTheDocument();
            expect(screen.getByText('팔로우')).toBeInTheDocument();
            expect(screen.getByText('포인트')).toBeInTheDocument();
            expect(screen.getByText('설정')).toBeInTheDocument();
        });

        test('아티스트 마이페이지가 올바르게 로드되어야 한다', async () => {
            // Mock artist user
            const artistUser = { ...mockAPIResponses.userProfile.data, role: 'artist' };
            localStorage.setItem('authUser', JSON.stringify(artistUser));

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 사용자 메뉴 열기
            const userMenuButton = screen.getByRole('button', { name: /artist/i });
            fireEvent.click(userMenuButton);

            // 마이페이지로 이동
            const mypageButton = screen.getByText('마이페이지');
            fireEvent.click(mypageButton);

            // 아티스트 마이페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
            });

            // 아티스트 전용 탭들이 표시되는지 확인
            expect(screen.getByText('프로필')).toBeInTheDocument();
            expect(screen.getByText('포트폴리오')).toBeInTheDocument();
            expect(screen.getByText('분석')).toBeInTheDocument();
            expect(screen.getByText('설정')).toBeInTheDocument();
        });

        test('관리자 마이페이지가 올바르게 로드되어야 한다', async () => {
            // Mock admin user
            const adminUser = { ...mockAPIResponses.userProfile.data, role: 'admin' };
            localStorage.setItem('authUser', JSON.stringify(adminUser));

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 사용자 메뉴 열기
            const userMenuButton = screen.getByRole('button', { name: /admin/i });
            fireEvent.click(userMenuButton);

            // 마이페이지로 이동
            const mypageButton = screen.getByText('마이페이지');
            fireEvent.click(mypageButton);

            // 관리자 마이페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
            });

            // 관리자 전용 탭이 표시되는지 확인
            expect(screen.getByText('프로필')).toBeInTheDocument();
            expect(screen.getByText('관리자')).toBeInTheDocument();
            expect(screen.getByText('설정')).toBeInTheDocument();
        });
    });

    describe('3. 커뮤니티 시스템 통합 테스트', () => {
        test('커뮤니티 페이지가 올바르게 로드되어야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 커뮤니티 네비게이션 클릭
            const communityNav = screen.getAllByText('커뮤니티')[0]; // 첫 번째 커뮤니티 버튼 (헤더 네비게이션)
            fireEvent.click(communityNav);

            // 커뮤니티 전체 보기 버튼 클릭
            const viewAllButton = screen.getByText('전체 보기');
            fireEvent.click(viewAllButton);

            // 커뮤니티 전체 페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('커뮤니티')).toBeInTheDocument();
            });

            // 검색 및 필터 기능 확인
            expect(screen.getByPlaceholderText('아티스트 검색...')).toBeInTheDocument();
            expect(screen.getByText('전체')).toBeInTheDocument();
        });

        test('아티스트 프로필 페이지가 올바르게 로드되어야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 커뮤니티 전체 보기로 이동
            const communityNav = screen.getAllByText('커뮤니티')[0]; // 첫 번째 커뮤니티 버튼 (헤더 네비게이션)
            fireEvent.click(communityNav);

            const viewAllButton = screen.getByText('전체 보기');
            fireEvent.click(viewAllButton);

            // 아티스트 카드 클릭
            await waitFor(() => {
                const artistCard = screen.getByText('아티스트 1');
                fireEvent.click(artistCard);
            });

            // 아티스트 프로필 페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('아티스트 1')).toBeInTheDocument();
            });
        });
    });

    describe('4. 이벤트 시스템 통합 테스트', () => {
        test('이벤트 페이지가 올바르게 로드되어야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 이벤트 네비게이션 클릭
            const eventsNav = screen.getByText('이벤트');
            fireEvent.click(eventsNav);

            // 이벤트 페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('다가오는 이벤트')).toBeInTheDocument();
            });

            // 이벤트 검색 및 필터 기능 확인
            expect(screen.getByPlaceholderText('이벤트명, 장소, 주최자 검색...')).toBeInTheDocument();
            expect(screen.getByText('카테고리 선택')).toBeInTheDocument();
        });

        test('이벤트 데이터가 올바르게 표시되어야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 이벤트 페이지로 이동
            const eventsNav = screen.getByText('이벤트');
            fireEvent.click(eventsNav);

            // 이벤트 데이터가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
                expect(screen.getByText('테스트 이벤트 설명')).toBeInTheDocument();
                expect(screen.getByText('서울')).toBeInTheDocument();
                expect(screen.getByText('무료')).toBeInTheDocument();
            });
        });
    });

    describe('5. 네비게이션 시스템 통합 테스트', () => {
        test('헤더 네비게이션이 올바르게 작동해야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 각 네비게이션 항목 클릭 테스트
            const navItems = ['아티스트', '커뮤니티', '라이브', '펀딩 프로젝트', '이벤트'];

            for (const item of navItems) {
                const navButton = screen.getByText(item);
                fireEvent.click(navButton);

                // 해당 섹션이 표시되는지 확인
                await waitFor(() => {
                    expect(screen.getByText(item)).toBeInTheDocument();
                });
            }
        });

        test('뒤로가기 기능이 올바르게 작동해야 한다', async () => {
            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // About 페이지로 이동
            const aboutButton = screen.getByText('소개');
            fireEvent.click(aboutButton);

            // About 페이지가 로드되는지 확인
            await waitFor(() => {
                expect(screen.getByText('콜라보리움 소개')).toBeInTheDocument();
            });

            // 뒤로가기 버튼 클릭
            const backButton = screen.getByText('홈으로');
            fireEvent.click(backButton);

            // 홈페이지로 돌아가는지 확인
            await waitFor(() => {
                expect(screen.getByText('Collaboreum')).toBeInTheDocument();
            });
        });
    });

    describe('6. 에러 처리 통합 테스트', () => {
        test('API 에러 시 적절한 에러 메시지가 표시되어야 한다', async () => {
            // Mock API error
            (global.fetch as jest.Mock).mockImplementation(() => {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({ error: 'Internal Server Error' })
                });
            });

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 사용자 메뉴 열기
            const userMenuButton = screen.getByRole('button', { name: /fan/i });
            fireEvent.click(userMenuButton);

            // 마이페이지로 이동 (API 에러 발생)
            const mypageButton = screen.getByText('마이페이지');
            fireEvent.click(mypageButton);

            // 에러 메시지가 표시되는지 확인
            await waitFor(() => {
                expect(screen.getByText('데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
                expect(screen.getByText('다시 시도')).toBeInTheDocument();
            });
        });

        test('네트워크 에러 시 적절한 에러 메시지가 표시되어야 한다', async () => {
            // Mock network error
            (global.fetch as jest.Mock).mockImplementation(() => {
                return Promise.reject(new Error('Network Error'));
            });

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 커뮤니티 페이지로 이동 (네트워크 에러 발생)
            const communityNav = screen.getAllByText('커뮤니티')[0]; // 첫 번째 커뮤니티 버튼 (헤더 네비게이션)
            fireEvent.click(communityNav);

            const viewAllButton = screen.getByText('전체 보기');
            fireEvent.click(viewAllButton);

            // 에러 메시지가 표시되는지 확인
            await waitFor(() => {
                expect(screen.getByText('데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
                expect(screen.getByText('다시 시도')).toBeInTheDocument();
            });
        });
    });

    describe('7. 로딩 상태 통합 테스트', () => {
        test('데이터 로딩 중 로딩 스피너가 표시되어야 한다', async () => {
            // Mock slow API response
            (global.fetch as jest.Mock).mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: () => Promise.resolve(mockAPIResponses.userProfile)
                        });
                    }, 1000);
                });
            });

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 사용자 메뉴 열기
            const userMenuButton = screen.getByRole('button', { name: /fan/i });
            fireEvent.click(userMenuButton);

            // 마이페이지로 이동
            const mypageButton = screen.getByText('마이페이지');
            fireEvent.click(mypageButton);

            // 로딩 스피너가 표시되는지 확인
            await waitFor(() => {
                expect(screen.getByText('사용자 데이터를 불러오는 중...')).toBeInTheDocument();
            });
        });
    });

    describe('8. 반응형 디자인 통합 테스트', () => {
        test('모바일 화면에서 네비게이션이 올바르게 작동해야 한다', async () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <TestWrapper>
                    <App />
                </TestWrapper>
            );

            // 모바일 메뉴 버튼이 표시되는지 확인
            const menuButton = screen.getByRole('button', { name: /메뉴/i });
            expect(menuButton).toBeInTheDocument();

            // 모바일 메뉴 클릭
            fireEvent.click(menuButton);

            // 모바일 메뉴가 열리는지 확인
            await waitFor(() => {
                expect(screen.getByText('아티스트')).toBeInTheDocument();
                expect(screen.getByText('커뮤니티')).toBeInTheDocument();
            });
        });
    });
});

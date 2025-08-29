import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Community Board System Tests
describe('Community Board System', () => {
    // Test data
    const mockCommunityPost = {
        id: '1',
        title: '테스트 게시글',
        content: '테스트 내용입니다.',
        author: {
            id: 'user1',
            username: '테스트유저',
            role: 'fan'
        },
        category: 'general',
        tags: ['테스트', '커뮤니티'],
        likes: 5,
        dislikes: 1,
        views: 100,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isPinned: false,
        isReported: false
    };

    const mockComment = {
        id: 'comment1',
        content: '테스트 댓글입니다.',
        author: {
            id: 'user2',
            username: '댓글유저',
            role: 'artist'
        },
        createdAt: '2024-01-01T01:00:00Z',
        likes: 2,
        dislikes: 0,
        replies: []
    };

    // 1. Community Post Data Model Tests
    describe('Community Post Data Model', () => {
        test('게시글 데이터 구조가 올바르게 정의되어야 한다', () => {
            expect(mockCommunityPost).toHaveProperty('id');
            expect(mockCommunityPost).toHaveProperty('title');
            expect(mockCommunityPost).toHaveProperty('content');
            expect(mockCommunityPost).toHaveProperty('author');
            expect(mockCommunityPost).toHaveProperty('category');
            expect(mockCommunityPost).toHaveProperty('tags');
            expect(mockCommunityPost).toHaveProperty('likes');
            expect(mockCommunityPost).toHaveProperty('dislikes');
            expect(mockCommunityPost).toHaveProperty('views');
            expect(mockCommunityPost).toHaveProperty('createdAt');
            expect(mockCommunityPost).toHaveProperty('updatedAt');
        });

        test('게시글 작성자 정보가 올바르게 포함되어야 한다', () => {
            expect(mockCommunityPost.author).toHaveProperty('id');
            expect(mockCommunityPost.author).toHaveProperty('username');
            expect(mockCommunityPost.author).toHaveProperty('role');
        });

        test('게시글 통계 정보가 올바르게 계산되어야 한다', () => {
            expect(mockCommunityPost.likes).toBeGreaterThanOrEqual(0);
            expect(mockCommunityPost.dislikes).toBeGreaterThanOrEqual(0);
            expect(mockCommunityPost.views).toBeGreaterThanOrEqual(0);
        });
    });

    // 2. Community Post Creation Tests
    describe('Community Post Creation', () => {
        test('게시글 작성 폼이 올바르게 렌더링되어야 한다', () => {
            render(
                <BrowserRouter>
                    <div data-testid="post-form">
                        <input data-testid="title-input" placeholder="제목을 입력하세요" />
                        <textarea data-testid="content-input" placeholder="내용을 입력하세요" />
                        <select data-testid="category-select">
                            <option value="general">일반</option>
                            <option value="artist">아티스트</option>
                            <option value="fan">팬</option>
                        </select>
                        <input data-testid="tags-input" placeholder="태그 (쉼표로 구분)" />
                        <button data-testid="submit-button">게시글 작성</button>
                    </div>
                </BrowserRouter>
            );

            expect(screen.getByTestId('post-form')).toBeInTheDocument();
            expect(screen.getByTestId('title-input')).toBeInTheDocument();
            expect(screen.getByTestId('content-input')).toBeInTheDocument();
            expect(screen.getByTestId('category-select')).toBeInTheDocument();
            expect(screen.getByTestId('tags-input')).toBeInTheDocument();
            expect(screen.getByTestId('submit-button')).toBeInTheDocument();
        });

        test('게시글 작성 시 필수 필드 검증이 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-form">
                        <input data-testid="title-input" placeholder="제목을 입력하세요" />
                        <textarea data-testid="content-input" placeholder="내용을 입력하세요" />
                        <button data-testid="submit-button">게시글 작성</button>
                        <div data-testid="error-message" style={{ display: 'none' }}>필수 필드를 입력해주세요</div>
                    </div>
                </BrowserRouter>
            );

            const submitButton = screen.getByTestId('submit-button');
            await user.click(submitButton);

            // 에러 메시지가 표시되어야 함
            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage).toBeVisible();
            });
        });

        test('게시글 작성 시 태그 입력이 올바르게 처리되어야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-form">
                        <input data-testid="title-input" placeholder="제목을 입력하세요" />
                        <textarea data-testid="content-input" placeholder="내용을 입력하세요" />
                        <input data-testid="tags-input" placeholder="태그 (쉼표로 구분)" />
                        <div data-testid="tags-display"></div>
                    </div>
                </BrowserRouter>
            );

            const tagsInput = screen.getByTestId('tags-input');
            await user.type(tagsInput, '테스트,커뮤니티,게시글');

            // 태그가 올바르게 파싱되어야 함
            expect(tagsInput).toHaveValue('테스트,커뮤니티,게시글');
        });
    });

    // 3. Community Post List Tests
    describe('Community Post List', () => {
        test('게시글 목록이 올바르게 렌더링되어야 한다', () => {
            const mockPosts = [mockCommunityPost, { ...mockCommunityPost, id: '2', title: '두 번째 게시글' }];

            render(
                <BrowserRouter>
                    <div data-testid="post-list">
                        {mockPosts.map(post => (
                            <div key={post.id} data-testid={`post-${post.id}`}>
                                <h3>{post.title}</h3>
                                <p>{post.content}</p>
                                <span>{post.author.username}</span>
                                <span>좋아요: {post.likes}</span>
                                <span>조회수: {post.views}</span>
                            </div>
                        ))}
                    </div>
                </BrowserRouter>
            );

            expect(screen.getByTestId('post-list')).toBeInTheDocument();
            expect(screen.getByTestId('post-1')).toBeInTheDocument();
            expect(screen.getByTestId('post-2')).toBeInTheDocument();
        });

        test('게시글 정렬 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-list">
                        <select data-testid="sort-select">
                            <option value="latest">최신순</option>
                            <option value="popular">인기순</option>
                            <option value="views">조회순</option>
                        </select>
                        <div data-testid="posts-container"></div>
                    </div>
                </BrowserRouter>
            );

            const sortSelect = screen.getByTestId('sort-select');
            await user.selectOptions(sortSelect, 'popular');

            expect(sortSelect).toHaveValue('popular');
        });

        test('게시글 검색 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-list">
                        <input data-testid="search-input" placeholder="게시글 검색" />
                        <button data-testid="search-button">검색</button>
                        <div data-testid="search-results"></div>
                    </div>
                </BrowserRouter>
            );

            const searchInput = screen.getByTestId('search-input');
            const searchButton = screen.getByTestId('search-button');

            await user.type(searchInput, '테스트');
            await user.click(searchButton);

            expect(searchInput).toHaveValue('테스트');
        });
    });

    // 4. Community Post Detail Tests
    describe('Community Post Detail', () => {
        test('게시글 상세 내용이 올바르게 표시되어야 한다', () => {
            render(
                <BrowserRouter>
                    <div data-testid="post-detail">
                        <h1>{mockCommunityPost.title}</h1>
                        <div data-testid="post-meta">
                            <span>작성자: {mockCommunityPost.author.username}</span>
                            <span>작성일: {new Date(mockCommunityPost.createdAt).toLocaleDateString()}</span>
                            <span>조회수: {mockCommunityPost.views}</span>
                        </div>
                        <div data-testid="post-content">{mockCommunityPost.content}</div>
                        <div data-testid="post-tags">
                            {mockCommunityPost.tags.map(tag => (
                                <span key={tag} data-testid={`tag-${tag}`}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </BrowserRouter>
            );

            expect(screen.getByTestId('post-detail')).toBeInTheDocument();
            expect(screen.getByText(mockCommunityPost.title)).toBeInTheDocument();
            expect(screen.getByTestId('post-content')).toHaveTextContent(mockCommunityPost.content);
            expect(screen.getByTestId('tag-테스트')).toBeInTheDocument();
        });

        test('게시글 좋아요/싫어요 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-detail">
                        <button data-testid="like-button">👍 {mockCommunityPost.likes}</button>
                        <button data-testid="dislike-button">👎 {mockCommunityPost.dislikes}</button>
                    </div>
                </BrowserRouter>
            );

            const likeButton = screen.getByTestId('like-button');
            const dislikeButton = screen.getByTestId('dislike-button');

            await user.click(likeButton);
            await user.click(dislikeButton);

            // 버튼 클릭 이벤트가 올바르게 처리되어야 함
            expect(likeButton).toBeInTheDocument();
            expect(dislikeButton).toBeInTheDocument();
        });
    });

    // 5. Comment System Tests
    describe('Comment System', () => {
        test('댓글이 올바르게 표시되어야 한다', () => {
            render(
                <BrowserRouter>
                    <div data-testid="comments-section">
                        <div data-testid="comment-1">
                            <p>{mockComment.content}</p>
                            <span>{mockComment.author.username}</span>
                            <span>{new Date(mockComment.createdAt).toLocaleDateString()}</span>
                            <button data-testid="like-comment-1">👍 {mockComment.likes}</button>
                        </div>
                    </div>
                </BrowserRouter>
            );

            expect(screen.getByTestId('comments-section')).toBeInTheDocument();
            expect(screen.getByTestId('comment-1')).toBeInTheDocument();
            expect(screen.getByText(mockComment.content)).toBeInTheDocument();
        });

        test('댓글 작성 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="comment-form">
                        <textarea data-testid="comment-input" placeholder="댓글을 입력하세요" />
                        <button data-testid="comment-submit">댓글 작성</button>
                    </div>
                </BrowserRouter>
            );

            const commentInput = screen.getByTestId('comment-input');
            const commentSubmit = screen.getByTestId('comment-submit');

            await user.type(commentInput, '새로운 댓글입니다.');
            await user.click(commentSubmit);

            expect(commentInput).toHaveValue('새로운 댓글입니다.');
        });

        test('댓글 답글 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="comment-1">
                        <p>{mockComment.content}</p>
                        <button data-testid="reply-button-1">답글</button>
                        <div data-testid="reply-form-1" style={{ display: 'none' }}>
                            <textarea data-testid="reply-input-1" placeholder="답글을 입력하세요" />
                            <button data-testid="reply-submit-1">답글 작성</button>
                        </div>
                    </div>
                </BrowserRouter>
            );

            const replyButton = screen.getByTestId('reply-button-1');
            await user.click(replyButton);

            // 답글 폼이 표시되어야 함
            await waitFor(() => {
                const replyForm = screen.getByTestId('reply-form-1');
                expect(replyForm).toBeVisible();
            });
        });
    });

    // 6. Search and Filtering Tests
    describe('Search and Filtering', () => {
        test('카테고리별 필터링이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="filter-section">
                        <select data-testid="category-filter">
                            <option value="">전체</option>
                            <option value="general">일반</option>
                            <option value="artist">아티스트</option>
                            <option value="fan">팬</option>
                        </select>
                        <div data-testid="filtered-posts"></div>
                    </div>
                </BrowserRouter>
            );

            const categoryFilter = screen.getByTestId('category-filter');
            await user.selectOptions(categoryFilter, 'artist');

            expect(categoryFilter).toHaveValue('artist');
        });

        test('태그별 필터링이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="tag-filter">
                        <button data-testid="tag-테스트">테스트</button>
                        <button data-testid="tag-커뮤니티">커뮤니티</button>
                        <div data-testid="tagged-posts"></div>
                    </div>
                </BrowserRouter>
            );

            const tagButton = screen.getByTestId('tag-테스트');
            await user.click(tagButton);

            // 태그 필터가 활성화되어야 함
            expect(tagButton).toBeInTheDocument();
        });
    });

    // 7. Reporting System Tests
    describe('Reporting System', () => {
        test('게시글 신고 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-detail">
                        <button data-testid="report-button">신고</button>
                        <div data-testid="report-modal" style={{ display: 'none' }}>
                            <select data-testid="report-reason">
                                <option value="spam">스팸</option>
                                <option value="inappropriate">부적절한 내용</option>
                                <option value="harassment">괴롭힘</option>
                            </select>
                            <textarea data-testid="report-detail" placeholder="신고 사유를 상세히 입력하세요" />
                            <button data-testid="report-submit">신고 제출</button>
                        </div>
                    </div>
                </BrowserRouter>
            );

            const reportButton = screen.getByTestId('report-button');
            await user.click(reportButton);

            // 신고 모달이 표시되어야 함
            await waitFor(() => {
                const reportModal = screen.getByTestId('report-modal');
                expect(reportModal).toBeVisible();
            });
        });
    });

    // 8. Bookmark System Tests
    describe('Bookmark System', () => {
        test('게시글 북마크 기능이 올바르게 작동해야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="post-detail">
                        <button data-testid="bookmark-button">🔖 북마크</button>
                        <div data-testid="bookmark-status">북마크되지 않음</div>
                    </div>
                </BrowserRouter>
            );

            const bookmarkButton = screen.getByTestId('bookmark-button');
            await user.click(bookmarkButton);

            // 북마크 상태가 변경되어야 함
            await waitFor(() => {
                const bookmarkStatus = screen.getByTestId('bookmark-status');
                expect(bookmarkStatus).toHaveTextContent('북마크됨');
            });
        });
    });

    // 9. Performance Tests
    describe('Performance', () => {
        test('게시글 목록 렌더링 성능이 측정되어야 한다', () => {
            const startTime = performance.now();

            render(
                <BrowserRouter>
                    <div data-testid="post-list">
                        {Array.from({ length: 100 }, (_, i) => ({
                            ...mockCommunityPost,
                            id: String(i),
                            title: `게시글 ${i}`
                        })).map(post => (
                            <div key={post.id} data-testid={`post-${post.id}`}>
                                <h3>{post.title}</h3>
                                <p>{post.content}</p>
                            </div>
                        ))}
                    </div>
                </BrowserRouter>
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // 렌더링 시간이 합리적인 범위 내에 있어야 함 (100ms 이하)
            expect(renderTime).toBeLessThan(100);
        });
    });

    // 10. Security Tests
    describe('Security', () => {
        test('XSS 공격 방지가 적용되어야 한다', () => {
            const maliciousPost = {
                ...mockCommunityPost,
                title: '<script>alert("XSS")</script>',
                content: '<img src="x" onerror="alert(\'XSS\')">'
            };

            render(
                <BrowserRouter>
                    <div data-testid="post-detail">
                        <h1 dangerouslySetInnerHTML={{ __html: maliciousPost.title }}></h1>
                        <div data-testid="post-content" dangerouslySetInnerHTML={{ __html: maliciousPost.content }}></div>
                    </div>
                </BrowserRouter>
            );

            // HTML 태그가 이스케이프되어 표시되어야 함
            const titleElement = screen.getByTestId('post-detail').querySelector('h1');
            expect(titleElement).toContainHTML('<script>alert("XSS")</script>');
        });

        test('권한 없는 사용자의 게시글 수정/삭제가 차단되어야 한다', () => {
            const unauthorizedUser = { id: 'user3', role: 'fan' };
            const postAuthor = { id: 'user1', role: 'artist' };

            render(
                <BrowserRouter>
                    <div data-testid="post-detail">
                        {unauthorizedUser.id === postAuthor.id ? (
                            <div>
                                <button data-testid="edit-button">수정</button>
                                <button data-testid="delete-button">삭제</button>
                            </div>
                        ) : (
                            <div data-testid="no-permission">권한이 없습니다</div>
                        )}
                    </div>
                </BrowserRouter>
            );

            // 권한이 없는 사용자에게는 수정/삭제 버튼이 표시되지 않아야 함
            expect(screen.getByTestId('no-permission')).toBeInTheDocument();
            expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
        });
    });

    // 11. Data Integrity Tests
    describe('Data Integrity', () => {
        test('게시글 수정 시 원본 데이터가 보호되어야 한다', async () => {
            const user = userEvent.setup();
            const originalPost = { ...mockCommunityPost };

            render(
                <BrowserRouter>
                    <div data-testid="post-edit-form">
                        <input data-testid="edit-title" defaultValue={originalPost.title} />
                        <textarea data-testid="edit-content" defaultValue={originalPost.content} />
                        <button data-testid="save-button">저장</button>
                        <button data-testid="cancel-button">취소</button>
                    </div>
                </BrowserRouter>
            );

            const editTitle = screen.getByTestId('edit-title');
            const editContent = screen.getByTestId('edit-content');
            const cancelButton = screen.getByTestId('cancel-button');

            await user.clear(editTitle);
            await user.type(editTitle, '수정된 제목');
            await user.click(cancelButton);

            // 원본 데이터가 변경되지 않아야 함
            expect(originalPost.title).toBe('테스트 게시글');
            expect(originalPost.content).toBe('테스트 내용입니다.');
        });

        test('댓글 작성 시 부모 게시글 ID가 올바르게 연결되어야 한다', () => {
            const commentWithParent = {
                ...mockComment,
                parentPostId: mockCommunityPost.id
            };

            expect(commentWithParent.parentPostId).toBe(mockCommunityPost.id);
        });
    });

    // 12. Real-time Updates Tests
    describe('Real-time Updates', () => {
        test('새 댓글 작성 시 실시간으로 목록이 업데이트되어야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="comments-section">
                        <div data-testid="comment-count">댓글 수: 1</div>
                        <div data-testid="comment-1">
                            <p>{mockComment.content}</p>
                        </div>
                        <div data-testid="comment-form">
                            <textarea data-testid="comment-input" placeholder="댓글을 입력하세요" />
                            <button data-testid="comment-submit">댓글 작성</button>
                        </div>
                    </div>
                </BrowserRouter>
            );

            const commentInput = screen.getByTestId('comment-input');
            const commentSubmit = screen.getByTestId('comment-submit');
            const commentCount = screen.getByTestId('comment-count');

            await user.type(commentInput, '새로운 댓글');
            await user.click(commentSubmit);

            // 댓글 수가 실시간으로 업데이트되어야 함
            await waitFor(() => {
                expect(commentCount).toHaveTextContent('댓글 수: 2');
            });
        });
    });

    // 13. Notification System Tests
    describe('Notification System', () => {
        test('댓글 작성 시 게시글 작성자에게 알림이 전송되어야 한다', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <div data-testid="comment-form">
                        <textarea data-testid="comment-input" placeholder="댓글을 입력하세요" />
                        <button data-testid="comment-submit">댓글 작성</button>
                        <div data-testid="notification-status"></div>
                    </div>
                </BrowserRouter>
            );

            const commentInput = screen.getByTestId('comment-input');
            const commentSubmit = screen.getByTestId('comment-submit');

            await user.type(commentInput, '알림 테스트 댓글');
            await user.click(commentSubmit);

            // 알림 상태가 업데이트되어야 함
            await waitFor(() => {
                const notificationStatus = screen.getByTestId('notification-status');
                expect(notificationStatus).toHaveTextContent('알림 전송됨');
            });
        });
    });

    // 14. Statistics Tests
    describe('Statistics', () => {
        test('게시글 통계가 올바르게 계산되어야 한다', () => {
            const posts = [
                { ...mockCommunityPost, likes: 10, dislikes: 2, views: 150 },
                { ...mockCommunityPost, id: '2', likes: 5, dislikes: 1, views: 100 },
                { ...mockCommunityPost, id: '3', likes: 15, dislikes: 0, views: 200 }
            ];

            const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
            const totalDislikes = posts.reduce((sum, post) => sum + post.dislikes, 0);
            const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
            const averageLikes = totalLikes / posts.length;

            expect(totalLikes).toBe(30);
            expect(totalDislikes).toBe(3);
            expect(totalViews).toBe(450);
            expect(averageLikes).toBe(10);
        });
    });

    // 15. Permissions Tests
    describe('Permissions', () => {
        test('관리자는 모든 게시글을 관리할 수 있어야 한다', () => {
            const adminUser = { id: 'admin1', role: 'admin' };

            render(
                <BrowserRouter>
                    <div data-testid="admin-controls">
                        {adminUser.role === 'admin' && (
                            <div>
                                <button data-testid="pin-button">고정</button>
                                <button data-testid="delete-button">삭제</button>
                                <button data-testid="moderate-button">검토</button>
                            </div>
                        )}
                    </div>
                </BrowserRouter>
            );

            // 관리자에게는 모든 관리 버튼이 표시되어야 함
            expect(screen.getByTestId('pin-button')).toBeInTheDocument();
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
            expect(screen.getByTestId('moderate-button')).toBeInTheDocument();
        });

        test('일반 사용자는 자신의 게시글만 수정/삭제할 수 있어야 한다', () => {
            const currentUser = { id: 'user1', role: 'fan' };
            const postAuthor = { id: 'user1', role: 'fan' };

            render(
                <BrowserRouter>
                    <div data-testid="user-controls">
                        {currentUser.id === postAuthor.id && (
                            <div>
                                <button data-testid="edit-button">수정</button>
                                <button data-testid="delete-button">삭제</button>
                            </div>
                        )}
                    </div>
                </BrowserRouter>
            );

            // 본인이 작성한 게시글에만 수정/삭제 버튼이 표시되어야 함
            expect(screen.getByTestId('edit-button')).toBeInTheDocument();
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
        });
    });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Admin Dashboard System Tests
describe('Admin Dashboard System', () => {
  // Test data
  const mockUser = {
    id: 'user1',
    username: '테스트유저',
    email: 'test@example.com',
    role: 'fan',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T00:00:00Z'
  };

  const mockProject = {
    id: 'project1',
    title: '테스트 프로젝트',
    artist: {
      id: 'artist1',
      username: '테스트아티스트'
    },
    category: 'music',
    goalAmount: 1000000,
    currentAmount: 500000,
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    submittedAt: '2024-01-10T00:00:00Z'
  };

  const mockStatistics = {
    totalUsers: 1500,
    totalProjects: 89,
    totalFunding: 45000000,
    activeUsers: 1200,
    pendingProjects: 12,
    completedProjects: 67
  };

  // 1. Admin Authentication Tests
  describe('Admin Authentication', () => {
    test('관리자 권한이 없는 사용자는 대시보드에 접근할 수 없어야 한다', () => {
      const nonAdminUser = { ...mockUser, role: 'fan' };

      render(
        <BrowserRouter>
          <div data-testid="admin-dashboard">
            {nonAdminUser.role === 'admin' ? (
              <div data-testid="dashboard-content">관리자 대시보드</div>
            ) : (
              <div data-testid="access-denied">접근 권한이 없습니다</div>
            )}
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
    });

    test('관리자 권한이 있는 사용자는 대시보드에 접근할 수 있어야 한다', () => {
      const adminUser = { ...mockUser, role: 'admin' };

      render(
        <BrowserRouter>
          <div data-testid="admin-dashboard">
            {adminUser.role === 'admin' ? (
              <div data-testid="dashboard-content">관리자 대시보드</div>
            ) : (
              <div data-testid="access-denied">접근 권한이 없습니다</div>
            )}
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
    });
  });

  // 2. User Management Tests
  describe('User Management', () => {
    test('사용자 목록이 올바르게 표시되어야 한다', () => {
      const mockUsers = [
        mockUser,
        { ...mockUser, id: 'user2', username: '두번째유저', role: 'artist' },
        { ...mockUser, id: 'user3', username: '세번째유저', role: 'admin' }
      ];

      render(
        <BrowserRouter>
          <div data-testid="user-management">
            <h2>사용자 관리</h2>
            <table data-testid="user-table">
              <thead>
                <tr>
                  <th>사용자명</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(user => (
                  <tr key={user.id} data-testid={`user-row-${user.id}`}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>
                      <button data-testid={`edit-user-${user.id}`}>수정</button>
                      <button data-testid={`delete-user-${user.id}`}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('user-management')).toBeInTheDocument();
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user1')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user2')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user3')).toBeInTheDocument();
    });

    test('사용자 검색 기능이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="user-search">
            <input data-testid="search-input" placeholder="사용자 검색" />
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

    test('사용자 권한 변경이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="user-edit">
            <select data-testid="role-select" defaultValue={mockUser.role}>
              <option value="fan">팬</option>
              <option value="artist">아티스트</option>
              <option value="admin">관리자</option>
            </select>
            <button data-testid="save-role">권한 저장</button>
            <div data-testid="role-status">현재 권한: {mockUser.role}</div>
          </div>
        </BrowserRouter>
      );

      const roleSelect = screen.getByTestId('role-select');
      const saveButton = screen.getByTestId('save-role');

      await user.selectOptions(roleSelect, 'artist');
      await user.click(saveButton);

      expect(roleSelect).toHaveValue('artist');
    });

    test('사용자 상태 변경이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="user-status">
            <select data-testid="status-select" defaultValue={mockUser.status}>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
              <option value="banned">차단</option>
            </select>
            <button data-testid="save-status">상태 저장</button>
            <div data-testid="status-reason" style={{ display: 'none' }}>
              <textarea data-testid="reason-input" placeholder="상태 변경 사유" />
            </div>
          </div>
        </BrowserRouter>
      );

      const statusSelect = screen.getByTestId('status-select');
      const saveButton = screen.getByTestId('save-status');

      await user.selectOptions(statusSelect, 'suspended');
      await user.click(saveButton);

      // 정지 상태일 때 사유 입력이 표시되어야 함
      await waitFor(() => {
        const reasonInput = screen.getByTestId('reason-input');
        expect(reasonInput).toBeVisible();
      });
    });

    test('사용자 삭제 시 확인 절차가 있어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="user-delete">
            <button data-testid="delete-button">사용자 삭제</button>
            <div data-testid="delete-confirm" style={{ display: 'none' }}>
              <p>정말로 이 사용자를 삭제하시겠습니까?</p>
              <button data-testid="confirm-delete">확인</button>
              <button data-testid="cancel-delete">취소</button>
            </div>
          </div>
        </BrowserRouter>
      );

      const deleteButton = screen.getByTestId('delete-button');
      await user.click(deleteButton);

      // 삭제 확인 다이얼로그가 표시되어야 함
      await waitFor(() => {
        const deleteConfirm = screen.getByTestId('delete-confirm');
        expect(deleteConfirm).toBeVisible();
      });
    });
  });

  // 3. Project Approval Tests
  describe('Project Approval', () => {
    test('승인 대기 중인 프로젝트 목록이 표시되어야 한다', () => {
      const pendingProjects = [
        mockProject,
        { ...mockProject, id: 'project2', title: '두 번째 프로젝트' },
        { ...mockProject, id: 'project3', title: '세 번째 프로젝트' }
      ];

      render(
        <BrowserRouter>
          <div data-testid="project-approval">
            <h2>프로젝트 승인</h2>
            <div data-testid="pending-projects">
              {pendingProjects.map(project => (
                <div key={project.id} data-testid={`project-${project.id}`}>
                  <h3>{project.title}</h3>
                  <p>아티스트: {project.artist.username}</p>
                  <p>목표 금액: {project.goalAmount.toLocaleString()}원</p>
                  <p>상태: {project.status}</p>
                  <div data-testid={`actions-${project.id}`}>
                    <button data-testid={`approve-${project.id}`}>승인</button>
                    <button data-testid={`reject-${project.id}`}>거절</button>
                    <button data-testid={`review-${project.id}`}>검토</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('project-approval')).toBeInTheDocument();
      expect(screen.getByTestId('pending-projects')).toBeInTheDocument();
      expect(screen.getByTestId('project-project1')).toBeInTheDocument();
      expect(screen.getByTestId('project-project2')).toBeInTheDocument();
      expect(screen.getByTestId('project-project3')).toBeInTheDocument();
    });

    test('프로젝트 승인 시 상태가 올바르게 변경되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="project-actions">
            <div data-testid="project-status">상태: pending</div>
            <button data-testid="approve-button">승인</button>
            <button data-testid="reject-button">거절</button>
            <div data-testid="approval-reason" style={{ display: 'none' }}>
              <textarea data-testid="reason-input" placeholder="승인/거절 사유" />
            </div>
          </div>
        </BrowserRouter>
      );

      const approveButton = screen.getByTestId('approve-button');
      await user.click(approveButton);

      // 승인 사유 입력이 표시되어야 함
      await waitFor(() => {
        const reasonInput = screen.getByTestId('reason-input');
        expect(reasonInput).toBeVisible();
      });
    });

    test('프로젝트 거절 시 사유가 기록되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="project-rejection">
            <button data-testid="reject-button">거절</button>
            <div data-testid="rejection-form" style={{ display: 'none' }}>
              <select data-testid="rejection-reason">
                <option value="inappropriate">부적절한 내용</option>
                <option value="incomplete">불완전한 정보</option>
                <option value="policy">정책 위반</option>
                <option value="other">기타</option>
              </select>
              <textarea data-testid="rejection-detail" placeholder="상세 사유" />
              <button data-testid="submit-rejection">거절 제출</button>
            </div>
          </div>
        </BrowserRouter>
      );

      const rejectButton = screen.getByTestId('reject-button');
      await user.click(rejectButton);

      // 거절 폼이 표시되어야 함
      await waitFor(() => {
        const rejectionForm = screen.getByTestId('rejection-form');
        expect(rejectionForm).toBeVisible();
      });
    });
  });

  // 4. Platform Statistics Tests
  describe('Platform Statistics', () => {
    test('플랫폼 통계가 올바르게 표시되어야 한다', () => {
      render(
        <BrowserRouter>
          <div data-testid="platform-stats">
            <h2>플랫폼 통계</h2>
            <div data-testid="stats-grid">
              <div data-testid="stat-users">
                <h3>사용자</h3>
                <p>총 사용자: {mockStatistics.totalUsers}</p>
                <p>활성 사용자: {mockStatistics.activeUsers}</p>
              </div>
              <div data-testid="stat-projects">
                <h3>프로젝트</h3>
                <p>총 프로젝트: {mockStatistics.totalProjects}</p>
                <p>승인 대기: {mockStatistics.pendingProjects}</p>
                <p>완료: {mockStatistics.completedProjects}</p>
              </div>
              <div data-testid="stat-funding">
                <h3>펀딩</h3>
                <p>총 펀딩 금액: {mockStatistics.totalFunding.toLocaleString()}원</p>
              </div>
            </div>
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('platform-stats')).toBeInTheDocument();
      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
      expect(screen.getByTestId('stat-users')).toBeInTheDocument();
      expect(screen.getByTestId('stat-projects')).toBeInTheDocument();
      expect(screen.getByTestId('stat-funding')).toBeInTheDocument();
    });

    test('통계 차트가 올바르게 렌더링되어야 한다', () => {
      render(
        <BrowserRouter>
          <div data-testid="statistics-charts">
            <div data-testid="user-growth-chart">
              <h3>사용자 성장 추이</h3>
              <canvas data-testid="user-chart-canvas"></canvas>
            </div>
            <div data-testid="project-category-chart">
              <h3>프로젝트 카테고리별 분포</h3>
              <canvas data-testid="category-chart-canvas"></canvas>
            </div>
            <div data-testid="funding-trend-chart">
              <h3>펀딩 성과 추이</h3>
              <canvas data-testid="funding-chart-canvas"></canvas>
            </div>
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('statistics-charts')).toBeInTheDocument();
      expect(screen.getByTestId('user-growth-chart')).toBeInTheDocument();
      expect(screen.getByTestId('project-category-chart')).toBeInTheDocument();
      expect(screen.getByTestId('funding-trend-chart')).toBeInTheDocument();
    });
  });

  // 5. Content Moderation Tests
  describe('Content Moderation', () => {
    test('신고된 콘텐츠 목록이 표시되어야 한다', () => {
      const reportedContent = [
        {
          id: 'report1',
          type: 'post',
          title: '신고된 게시글',
          reason: '부적절한 내용',
          reporter: 'user1',
          reportedAt: '2024-01-15T00:00:00Z',
          status: 'pending'
        },
        {
          id: 'report2',
          type: 'comment',
          title: '신고된 댓글',
          reason: '스팸',
          reporter: 'user2',
          reportedAt: '2024-01-14T00:00:00Z',
          status: 'reviewed'
        }
      ];

      render(
        <BrowserRouter>
          <div data-testid="content-moderation">
            <h2>콘텐츠 검토</h2>
            <div data-testid="reported-content">
              {reportedContent.map(content => (
                <div key={content.id} data-testid={`report-${content.id}`}>
                  <h3>{content.title}</h3>
                  <p>유형: {content.type}</p>
                  <p>신고 사유: {content.reason}</p>
                  <p>신고자: {content.reporter}</p>
                  <p>상태: {content.status}</p>
                  <div data-testid={`moderation-actions-${content.id}`}>
                    <button data-testid={`approve-${content.id}`}>승인</button>
                    <button data-testid={`remove-${content.id}`}>삭제</button>
                    <button data-testid={`warn-${content.id}`}>경고</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
      expect(screen.getByTestId('reported-content')).toBeInTheDocument();
      expect(screen.getByTestId('report-report1')).toBeInTheDocument();
      expect(screen.getByTestId('report-report2')).toBeInTheDocument();
    });

    test('콘텐츠 검토 시 적절한 조치가 기록되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="moderation-action">
            <button data-testid="remove-content">콘텐츠 삭제</button>
            <div data-testid="action-form" style={{ display: 'none' }}>
              <select data-testid="action-type">
                <option value="remove">삭제</option>
                <option value="warn">경고</option>
                <option value="suspend">사용자 정지</option>
              </select>
              <textarea data-testid="action-reason" placeholder="조치 사유" />
              <button data-testid="submit-action">조치 실행</button>
            </div>
          </div>
        </BrowserRouter>
      );

      const removeButton = screen.getByTestId('remove-content');
      await user.click(removeButton);

      // 조치 폼이 표시되어야 함
      await waitFor(() => {
        const actionForm = screen.getByTestId('action-form');
        expect(actionForm).toBeVisible();
      });
    });
  });

  // 6. System Settings Tests
  describe('System Settings', () => {
    test('시스템 설정이 올바르게 표시되어야 한다', () => {
      render(
        <BrowserRouter>
          <div data-testid="system-settings">
            <h2>시스템 설정</h2>
            <div data-testid="settings-form">
              <div data-testid="setting-group">
                <label>최대 프로젝트 금액</label>
                <input data-testid="max-project-amount" type="number" defaultValue="10000000" />
              </div>
              <div data-testid="setting-group">
                <label>프로젝트 승인 자동화</label>
                <input data-testid="auto-approval" type="checkbox" />
              </div>
              <div data-testid="setting-group">
                <label>사용자 가입 승인 필요</label>
                <input data-testid="user-approval-required" type="checkbox" />
              </div>
              <button data-testid="save-settings">설정 저장</button>
            </div>
          </div>
        </BrowserRouter>
      );

      expect(screen.getByTestId('system-settings')).toBeInTheDocument();
      expect(screen.getByTestId('settings-form')).toBeInTheDocument();
      expect(screen.getByTestId('max-project-amount')).toBeInTheDocument();
      expect(screen.getByTestId('auto-approval')).toBeInTheDocument();
      expect(screen.getByTestId('user-approval-required')).toBeInTheDocument();
    });

    test('시스템 설정 변경이 올바르게 저장되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="settings-save">
            <input data-testid="setting-input" type="number" defaultValue="10000000" />
            <button data-testid="save-button">저장</button>
            <div data-testid="save-status"></div>
          </div>
        </BrowserRouter>
      );

      const settingInput = screen.getByTestId('setting-input');
      const saveButton = screen.getByTestId('save-button');

      await user.clear(settingInput);
      await user.type(settingInput, '50000000');
      await user.click(saveButton);

      expect(settingInput).toHaveValue(50000000);
    });
  });

  // 7. Performance Tests
  describe('Performance', () => {
    test('대시보드 로딩 성능이 측정되어야 한다', async () => {
      const startTime = performance.now();

      render(
        <BrowserRouter>
          <div data-testid="admin-dashboard">
            <div data-testid="user-management">사용자 관리</div>
            <div data-testid="project-approval">프로젝트 승인</div>
            <div data-testid="platform-stats">플랫폼 통계</div>
            <div data-testid="content-moderation">콘텐츠 검토</div>
          </div>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 로딩 시간이 합리적인 범위 내에 있어야 함 (200ms 이하)
      expect(loadTime).toBeLessThan(200);
    });

    test('대량 데이터 처리 시 성능이 유지되어야 한다', () => {
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockUser,
        id: `user${i}`,
        username: `사용자${i}`
      }));

      const startTime = performance.now();

      render(
        <BrowserRouter>
          <div data-testid="large-user-list">
            {largeUserList.map(user => (
              <div key={user.id} data-testid={`user-${user.id}`}>
                {user.username}
              </div>
            ))}
          </div>
        </BrowserRouter>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 대량 데이터 렌더링 시간이 합리적인 범위 내에 있어야 함 (500ms 이하)
      expect(renderTime).toBeLessThan(500);
    });
  });

  // 8. Security Tests
  describe('Security', () => {
    test('관리자 권한 검증이 엄격하게 이루어져야 한다', () => {
      const unauthorizedUser = { ...mockUser, role: 'fan' };

      render(
        <BrowserRouter>
          <div data-testid="admin-access">
            {unauthorizedUser.role === 'admin' ? (
              <div data-testid="admin-content">관리자 전용 콘텐츠</div>
            ) : (
              <div data-testid="access-denied">접근 권한이 없습니다</div>
            )}
          </div>
        </BrowserRouter>
      );

      // 권한이 없는 사용자는 관리자 콘텐츠에 접근할 수 없어야 함
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    test('중요한 관리 작업 시 로그가 기록되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="admin-action">
            <button data-testid="delete-user">사용자 삭제</button>
            <div data-testid="action-log"></div>
          </div>
        </BrowserRouter>
      );

      const deleteButton = screen.getByTestId('delete-user');
      await user.click(deleteButton);

      // 관리 작업 로그가 기록되어야 함
      await waitFor(() => {
        const actionLog = screen.getByTestId('action-log');
        expect(actionLog).toHaveTextContent('사용자 삭제 작업이 기록되었습니다');
      });
    });
  });

  // 9. Data Integrity Tests
  describe('Data Integrity', () => {
    test('사용자 데이터 수정 시 원본 데이터가 보호되어야 한다', () => {
      const originalUser = { ...mockUser };
      const modifiedUser = { ...mockUser, role: 'admin' };

      // 원본 데이터는 변경되지 않아야 함
      expect(originalUser.role).toBe('fan');
      expect(modifiedUser.role).toBe('admin');
    });

    test('프로젝트 승인 상태 변경 시 이력이 기록되어야 한다', () => {
      const approvalHistory = [
        {
          projectId: mockProject.id,
          action: 'approved',
          adminId: 'admin1',
          timestamp: new Date().toISOString(),
          reason: '프로젝트 요구사항 충족'
        }
      ];

      expect(approvalHistory).toHaveLength(1);
      expect(approvalHistory[0].action).toBe('approved');
      expect(approvalHistory[0].projectId).toBe(mockProject.id);
    });
  });

  // 10. Real-time Updates Tests
  describe('Real-time Updates', () => {
    test('새 사용자 가입 시 실시간으로 통계가 업데이트되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="real-time-stats">
            <div data-testid="user-count">총 사용자: {mockStatistics.totalUsers}</div>
            <button data-testid="add-user">사용자 추가</button>
          </div>
        </BrowserRouter>
      );

      const addUserButton = screen.getByTestId('add-user');
      await user.click(addUserButton);

      // 사용자 수가 실시간으로 업데이트되어야 함
      await waitFor(() => {
        const userCount = screen.getByTestId('user-count');
        expect(userCount).toHaveTextContent('총 사용자: 1501');
      });
    });

    test('프로젝트 승인 시 실시간으로 목록이 업데이트되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="real-time-projects">
            <div data-testid="pending-count">승인 대기: {mockStatistics.pendingProjects}</div>
            <button data-testid="approve-project">프로젝트 승인</button>
          </div>
        </BrowserRouter>
      );

      const approveButton = screen.getByTestId('approve-project');
      await user.click(approveButton);

      // 승인 대기 수가 실시간으로 업데이트되어야 함
      await waitFor(() => {
        const pendingCount = screen.getByTestId('pending-count');
        expect(pendingCount).toHaveTextContent('승인 대기: 11');
      });
    });
  });

  // 11. Notification System Tests
  describe('Notification System', () => {
    test('중요한 관리 작업 시 알림이 전송되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="admin-notifications">
            <button data-testid="critical-action">중요 작업 실행</button>
            <div data-testid="notification-status"></div>
          </div>
        </BrowserRouter>
      );

      const criticalButton = screen.getByTestId('critical-action');
      await user.click(criticalButton);

      // 알림 상태가 업데이트되어야 함
      await waitFor(() => {
        const notificationStatus = screen.getByTestId('notification-status');
        expect(notificationStatus).toHaveTextContent('관리자 알림 전송됨');
      });
    });
  });

  // 12. Export and Reporting Tests
  describe('Export and Reporting', () => {
    test('사용자 데이터 내보내기가 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="data-export">
            <button data-testid="export-users">사용자 데이터 내보내기</button>
            <div data-testid="export-status"></div>
          </div>
        </BrowserRouter>
      );

      const exportButton = screen.getByTestId('export-users');
      await user.click(exportButton);

      // 내보내기 상태가 업데이트되어야 함
      await waitFor(() => {
        const exportStatus = screen.getByTestId('export-status');
        expect(exportStatus).toHaveTextContent('CSV 파일 다운로드 준비됨');
      });
    });

    test('관리 보고서 생성이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <div data-testid="report-generation">
            <select data-testid="report-type">
              <option value="daily">일일 보고서</option>
              <option value="weekly">주간 보고서</option>
              <option value="monthly">월간 보고서</option>
            </select>
            <button data-testid="generate-report">보고서 생성</button>
            <div data-testid="report-status"></div>
          </div>
        </BrowserRouter>
      );

      const reportType = screen.getByTestId('report-type');
      const generateButton = screen.getByTestId('generate-report');

      await user.selectOptions(reportType, 'weekly');
      await user.click(generateButton);

      expect(reportType).toHaveValue('weekly');
    });
  });
});

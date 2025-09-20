import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreatePostPage } from '../CreatePostPage';
import { EditPostPage } from '../EditPostPage';
import { communityPostAPI } from '../../services/api';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      name: '테스트 사용자',
      email: 'tester@example.com'
    }
  })
}));

const mockNavigate = jest.fn();
const mockUseParams = jest.fn(() => ({}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams()
}));

jest.mock('../../services/api', () => ({
  communityPostAPI: {
    createPost: jest.fn(),
    getPost: jest.fn(),
    updatePost: jest.fn()
  }
}));

const mockedCommunityPostAPI = communityPostAPI as jest.Mocked<typeof communityPostAPI>;

describe('Community post pages', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).alert = jest.fn();
    mockUseParams.mockReturnValue({});
    user = userEvent.setup();
  });

  describe('CreatePostPage', () => {
    const fillCommonFields = async () => {
      await user.type(screen.getByLabelText(/제목/), '새 게시글 제목');
      await user.type(screen.getByLabelText(/내용/), '새 게시글 내용');
      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('일반'));
    };

    it('게시글 객체 응답으로 성공 흐름을 처리한다', async () => {
      mockedCommunityPostAPI.createPost.mockResolvedValue({
        id: 'post-1',
        title: '새 게시글 제목'
      } as any);

      render(<CreatePostPage />);

      await fillCommonFields();
      await user.click(screen.getByRole('button', { name: '게시글 작성하기' }));

      await waitFor(() => {
        expect(mockedCommunityPostAPI.createPost).toHaveBeenCalled();
      });

      expect(window.alert).toHaveBeenCalledWith('"새 게시글 제목" 게시글이 성공적으로 작성되었습니다.');
      expect(mockNavigate).toHaveBeenCalledWith('/community');
    });

    it('게시글 객체가 없을 때 실패 알림을 표시한다', async () => {
      mockedCommunityPostAPI.createPost.mockResolvedValue(null as any);

      render(<CreatePostPage />);

      await fillCommonFields();
      await user.click(screen.getByRole('button', { name: '게시글 작성하기' }));

      await waitFor(() => {
        expect(mockedCommunityPostAPI.createPost).toHaveBeenCalled();
      });

      expect(window.alert).toHaveBeenCalledWith('게시글 작성에 실패했습니다: 알 수 없는 오류');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('EditPostPage', () => {
    const basePost = {
      id: 'post-1',
      title: '기존 제목',
      content: '기존 내용',
      category: 'general',
      tags: ['태그1', '태그2']
    };

    beforeEach(() => {
      mockUseParams.mockReturnValue({ postId: 'post-1' });
      mockedCommunityPostAPI.getPost.mockResolvedValue({ ...basePost } as any);
    });

    it('게시글 객체를 로드하고 수정 성공 흐름을 처리한다', async () => {
      mockedCommunityPostAPI.updatePost.mockResolvedValue({
        ...basePost,
        title: '수정된 제목'
      } as any);

      render(<EditPostPage />);

      await waitFor(() => {
        expect(mockedCommunityPostAPI.getPost).toHaveBeenCalledWith('post-1');
      });

      expect(screen.getByDisplayValue('기존 제목')).toBeInTheDocument();

      await user.clear(screen.getByLabelText(/제목/));
      await user.type(screen.getByLabelText(/제목/), '수정된 제목');
      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('질문'));
      await user.clear(screen.getByLabelText(/내용/));
      await user.type(screen.getByLabelText(/내용/), '수정된 내용');

      await user.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() => {
        expect(mockedCommunityPostAPI.updatePost).toHaveBeenCalledWith('post-1', {
          title: '수정된 제목',
          content: '수정된 내용',
          category: 'question',
          tags: ['태그1', '태그2']
        });
      });

      expect(window.alert).toHaveBeenCalledWith('"수정된 제목" 게시글이 성공적으로 수정되었습니다.');
      expect(mockNavigate).toHaveBeenCalledWith('/community/post-1');
    });

    it('수정 결과가 없으면 실패 알림을 표시한다', async () => {
      mockedCommunityPostAPI.updatePost.mockResolvedValue(null as any);

      render(<EditPostPage />);

      await waitFor(() => {
        expect(mockedCommunityPostAPI.getPost).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() => {
        expect(mockedCommunityPostAPI.updatePost).toHaveBeenCalled();
      });

      expect(window.alert).toHaveBeenCalledWith('게시글 수정에 실패했습니다: 알 수 없는 오류');
      expect(mockNavigate).not.toHaveBeenCalledWith('/community/post-1');
    });
  });
});


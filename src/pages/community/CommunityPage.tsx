import React from 'react';
import { useNavigate } from 'react-router-dom';
import CommunityMain from '../../features/community/components/CommunityMain';
import { CommunityPost } from '../../features/community/types/index';

export const CommunityPage: React.FC = () => {
    const navigate = useNavigate();

    const handlePostClick = (post: CommunityPost) => {
        navigate(`/community/${post.id}`);
    };

    const handleCreatePost = () => {
        // 게시글 작성 로직은 CommunityMain 내부에서 처리됨
        console.log('게시글 작성 요청');
    };

    return (
        <CommunityMain
            onPostClick={handlePostClick}
            onCreatePost={handleCreatePost}
            showStats={true}
        />
    );
};
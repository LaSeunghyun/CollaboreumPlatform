import { Bookmark } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';

interface FanProfileFavoritesEmptyStateProps {
  onBrowseProjects?: () => void;
}

export const FanProfileFavoritesEmptyState = ({
  onBrowseProjects,
}: FanProfileFavoritesEmptyStateProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className='text-lg font-semibold'>즐겨찾기</h3>
      </CardHeader>
      <CardContent>
        <div className='py-12 text-center'>
          <Bookmark className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <p className='text-gray-500'>즐겨찾기한 프로젝트가 없습니다</p>
          <Button className='mt-4' onClick={onBrowseProjects}>
            프로젝트 둘러보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

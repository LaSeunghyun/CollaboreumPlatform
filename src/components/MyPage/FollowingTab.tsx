import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/Avatar";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { getFirstChar } from "../../utils/typeGuards";
import { FollowingResponse, Artist } from './types';

interface FollowingTabProps {
  followingData: FollowingResponse | undefined;
  followingLoading: boolean;
  followingError: Error | null;
  onUnfollow?: (artistId: string) => void;
}

export function FollowingTab({
  followingData,
  followingLoading,
  followingError,
  onUnfollow
}: FollowingTabProps) {
  const handleUnfollow = (artistId: string) => {
    if (onUnfollow) {
      onUnfollow(artistId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            팔로잉 아티스트 ({followingData?.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : followingError ? (
            <ErrorMessage error={followingError} />
          ) : (
            <div className="space-y-4">
              {(followingData?.data?.length || 0) > 0 ? (
                (followingData?.data || []).map((artist: Artist) => (
                  <div key={artist.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={artist.avatar} alt={artist.name} />
                        <AvatarFallback>{getFirstChar(artist.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{artist.name}</h4>
                        <p className="text-sm text-gray-600">{artist.category || '아티스트'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnfollow(artist.id)}
                    >
                      언팔로우
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">팔로잉 중인 아티스트가 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

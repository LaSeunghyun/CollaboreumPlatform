import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Input } from '@/shared/ui/Input';
import { Search, Eye, CheckCircle2, XCircle, Clock, Image, Edit, Trash2 } from 'lucide-react';
import { useArtworks, useUpdateArtworkStatus } from '../../hooks/useAdminData';
import { Artwork } from '../../types';

export function ArtworkManagementSection() {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const { data: artworksData, isLoading, error } = useArtworks({
        status: filter === "all" ? undefined : filter,
        search: searchTerm || undefined,
        page,
        limit: 20
    });

    const updateArtworkStatus = useUpdateArtworkStatus();

    const artworks = artworksData?.artworks || [];
    const pagination = artworksData?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">대기중</Badge>;
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">승인됨</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">거부됨</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    const handleStatusChange = async (artworkId: string, newStatus: string) => {
        try {
            await updateArtworkStatus.mutateAsync({ artworkId, status: newStatus });
        } catch (error) {
            console.error('작품 상태 변경 실패:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">작품 데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">작품 갤러리 관리</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="작품명, 아티스트, 카테고리로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="approved">승인됨</SelectItem>
                            <SelectItem value="rejected">거부됨</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>작품</TableHead>
                                <TableHead>아티스트</TableHead>
                                <TableHead>카테고리</TableHead>
                                <TableHead>가격</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>조회수</TableHead>
                                <TableHead>등록일</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {artworks.map((artwork: Artwork) => (
                                <TableRow key={artwork.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                {artwork.imageUrl ? (
                                                    <img
                                                        src={artwork.imageUrl}
                                                        alt={artwork.title}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <Image className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{artwork.title}</p>
                                                <p className="text-sm text-gray-600">{artwork.medium} • {artwork.dimensions}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={artwork.artistAvatar} alt={artwork.artist} />
                                                <AvatarFallback>{artwork.artist.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{artwork.artist}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{artwork.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">₩{artwork.price.toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(artwork.status)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                            <span>{artwork.views}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{artwork.uploadDate}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" title="자세히 보기">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" title="수정">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {artwork.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:text-green-700"
                                                        onClick={() => handleStatusChange(artwork.id.toString(), 'approved')}
                                                        disabled={updateArtworkStatus.isPending}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleStatusChange(artwork.id.toString(), 'rejected')}
                                                        disabled={updateArtworkStatus.isPending}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {artwork.status !== 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-blue-600 hover:text-blue-700"
                                                    onClick={() => handleStatusChange(artwork.id.toString(), 'pending')}
                                                    disabled={updateArtworkStatus.isPending}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" title="삭제">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        이전
                    </Button>
                    <span className="text-sm text-gray-600">
                        {page} / {pagination.totalPages} 페이지
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
}

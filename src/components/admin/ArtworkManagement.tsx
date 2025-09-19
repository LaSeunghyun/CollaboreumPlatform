import { Eye, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { getFirstChar } from '@/utils/typeGuards';
import { Artwork } from '@/types/admin';
import { Card, Badge, Button, Input, Select, Table, Avatar } from '@/shared/ui';

interface ArtworkManagementProps {
    artworks: Artwork[];
    artworkFilter: string;
    setArtworkFilter: (filter: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onStatusChange: (id: number, status: 'pending' | 'approved' | 'rejected') => void;
    onDelete: (id: number) => void;
    onView: (artwork: Artwork) => void;
}

export const ArtworkManagement = ({
    artworks,
    artworkFilter,
    setArtworkFilter,
    searchTerm,
    setSearchTerm,
    onStatusChange,
    onDelete,
    onView
}: ArtworkManagementProps) => (
    <Card>
        <CardHeader>
            <div className='flex items-center justify-between'>
                <CardTitle>작품 관리</CardTitle>
                <div className='flex gap-2'>
                    <Input
                        placeholder='작품 검색...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-48'
                    />
                    <Select value={artworkFilter} onValueChange={setArtworkFilter}>
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='전체'>전체</SelectItem>
                            <SelectItem value='pending'>대기중</SelectItem>
                            <SelectItem value='approved'>승인됨</SelectItem>
                            <SelectItem value='rejected'>거부됨</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>작품</TableHead>
                        <TableHead>아티스트</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>가격</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>업로드일</TableHead>
                        <TableHead>액션</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {artworks.map((artwork) => (
                        <TableRow key={artwork.id}>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <div className='h-12 w-12 rounded-lg bg-muted flex items-center justify-center'>
                                        {artwork.imageUrl ? (
                                            <img src={artwork.imageUrl} alt={artwork.title} className='h-full w-full object-cover rounded-lg' />
                                        ) : (
                                            <span className='text-muted-foreground'>이미지 없음</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className='font-medium'>{artwork.title}</div>
                                        <div className='text-sm text-muted-foreground'>{artwork.medium}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='flex items-center gap-2'>
                                    <Avatar className='h-8 w-8'>
                                        <AvatarImage src={artwork.artistAvatar} />
                                        <AvatarFallback>{getFirstChar(artwork.artist)}</AvatarFallback>
                                    </Avatar>
                                    <span className='font-medium'>{artwork.artist}</span>
                                </div>
                            </TableCell>
                            <TableCell>{artwork.category}</TableCell>
                            <TableCell>₩{artwork.price.toLocaleString()}</TableCell>
                            <TableCell>
                                <Badge variant={artwork.status === 'approved' ? 'default' : artwork.status === 'rejected' ? 'destructive' : 'secondary'}>
                                    {artwork.status === 'pending' ? '대기중' : artwork.status === 'approved' ? '승인됨' : '거부됨'}
                                </Badge>
                            </TableCell>
                            <TableCell>{artwork.uploadDate}</TableCell>
                            <TableCell>
                                <div className='flex gap-2'>
                                    <Button variant='outline' size='sm' onClick={() => onView(artwork)}>
                                        <Eye className='h-4 w-4' />
                                    </Button>
                                    {artwork.status === 'pending' && (
                                        <>
                                            <Button variant='outline' size='sm' onClick={() => onStatusChange(artwork.id, 'approved')}>
                                                <CheckCircle2 className='h-4 w-4' />
                                            </Button>
                                            <Button variant='outline' size='sm' onClick={() => onStatusChange(artwork.id, 'rejected')}>
                                                <XCircle className='h-4 w-4' />
                                            </Button>
                                        </>
                                    )}
                                    <Button variant='outline' size='sm' onClick={() => onDelete(artwork.id)}>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

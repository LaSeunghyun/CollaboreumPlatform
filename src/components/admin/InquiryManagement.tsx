import { Eye, Edit } from 'lucide-react';
import { getFirstChar } from '@/utils/typeGuards';
import { Inquiry } from '@/types/admin';
import { Card, Badge, Button, Select, Table, Avatar } from '@/shared/ui';

interface InquiryManagementProps {
    inquiries: Inquiry[];
    inquiryFilter: string;
    setInquiryFilter: (filter: string) => void;
}

export const InquiryManagement = ({ inquiries, inquiryFilter, setInquiryFilter }: InquiryManagementProps) => (
    <Card>
        <CardHeader>
            <div className='flex items-center justify-between'>
                <CardTitle>문의사항 관리</CardTitle>
                <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
                    <SelectTrigger className='w-32'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='전체'>전체</SelectItem>
                        <SelectItem value='대기'>대기</SelectItem>
                        <SelectItem value='진행중'>진행중</SelectItem>
                        <SelectItem value='완료'>완료</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>아티스트</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>우선순위</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>날짜</TableHead>
                        <TableHead>액션</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                            <TableCell>
                                <div className='flex items-center gap-2'>
                                    <Avatar className='h-8 w-8'>
                                        <AvatarImage src={inquiry.artistAvatar} />
                                        <AvatarFallback>{getFirstChar(inquiry.artist)}</AvatarFallback>
                                    </Avatar>
                                    <span className='font-medium'>{inquiry.artist}</span>
                                </div>
                            </TableCell>
                            <TableCell className='font-medium'>{inquiry.subject}</TableCell>
                            <TableCell>{inquiry.category}</TableCell>
                            <TableCell>
                                <Badge variant={inquiry.priority === '높음' ? 'destructive' : 'secondary'}>
                                    {inquiry.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={inquiry.status === '완료' ? 'default' : 'secondary'}>
                                    {inquiry.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{inquiry.date}</TableCell>
                            <TableCell>
                                <div className='flex gap-2'>
                                    <Button variant='outline' size='sm'>
                                        <Eye className='h-4 w-4' />
                                    </Button>
                                    <Button variant='outline' size='sm'>
                                        <Edit className='h-4 w-4' />
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

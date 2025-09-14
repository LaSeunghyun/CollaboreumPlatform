import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Search, Eye, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { Progress } from "../../ui/progress";

// Mock Data
const fundingProjects = [
  {
    id: 1,
    title: "첫 번째 정규앨범 'Dreams'",
    artist: "김민수",
    artistAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    category: "음악",
    goalAmount: 5000000,
    currentAmount: 3750000,
    backerCount: 125,
    deadline: "2025-09-15",
    status: "active",
    submissionDate: "2025-07-20",
    approvalStatus: "approved"
  },
  {
    id: 2,
    title: "개인전 '색채의 울림'",
    artist: "이지영",
    artistAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    category: "미술",
    goalAmount: 3000000,
    currentAmount: 3200000,
    backerCount: 89,
    deadline: "2025-08-30",
    status: "successful",
    submissionDate: "2025-06-15",
    approvalStatus: "approved"
  },
  {
    id: 3,
    title: "독립 영화 '도시의 밤'",
    artist: "박소영",
    artistAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    category: "영화",
    goalAmount: 8000000,
    currentAmount: 2100000,
    backerCount: 45,
    deadline: "2025-10-20",
    status: "pending",
    submissionDate: "2025-08-05",
    approvalStatus: "review"
  },
  {
    id: 4,
    title: "웹툰 '판타지 어드벤처'",
    artist: "정우진",
    artistAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    category: "만화",
    goalAmount: 2000000,
    currentAmount: 1800000,
    backerCount: 156,
    deadline: "2025-08-25",
    status: "failed",
    submissionDate: "2025-05-10",
    approvalStatus: "approved"
  },
  {
    id: 5,
    title: "포토북 '서울의 사계절'",
    artist: "황미나",
    artistAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
    category: "사진",
    goalAmount: 1500000,
    currentAmount: 0,
    backerCount: 0,
    deadline: "2025-11-15",
    status: "draft",
    submissionDate: "2025-08-08",
    approvalStatus: "rejected"
  }
];

export function FundingManagementTable() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = fundingProjects.filter(project => {
    const matchesFilter = filter === "all" || project.status === filter || project.approvalStatus === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">진행중</Badge>;
      case "successful":
        return <Badge className="bg-green-100 text-green-800">성공</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">실패</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">대기</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">초안</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">승인</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">반려</Badge>;
      case "review":
        return <Badge className="bg-yellow-100 text-yellow-800">검토중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>펀딩 프로젝트 관리</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="프로젝트 또는 아티스트 검색" 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">진행중</SelectItem>
                <SelectItem value="successful">성공</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="review">검토중</SelectItem>
                <SelectItem value="rejected">반려</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>프로젝트</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>목표금액</TableHead>
              <TableHead>달성률</TableHead>
              <TableHead>후원자</TableHead>
              <TableHead>마감일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>승인상태</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={project.artistAvatar} alt={project.artist} />
                      <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium max-w-xs truncate">{project.title}</div>
                      <div className="text-sm text-gray-500">{project.artist}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{project.category}</Badge>
                </TableCell>
                <TableCell>₩{project.goalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>₩{project.currentAmount.toLocaleString()}</span>
                      <span>{calculateProgress(project.currentAmount, project.goalAmount).toFixed(0)}%</span>
                    </div>
                    <Progress value={calculateProgress(project.currentAmount, project.goalAmount)} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>{project.backerCount}명</TableCell>
                <TableCell>{project.deadline}</TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell>{getApprovalBadge(project.approvalStatus)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {project.approvalStatus === "review" && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {project.status === "successful" && (
                      <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700">
                        <DollarSign className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
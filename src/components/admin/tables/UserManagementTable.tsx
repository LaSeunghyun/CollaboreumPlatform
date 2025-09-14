import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Search, Filter, Eye, Ban, CheckCircle } from "lucide-react";

// Mock Data
const users = [
  {
    id: 1,
    name: "김민수",
    email: "minsu@example.com",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    joinDate: "2025-03-15",
    lastActivity: "2025-08-09",
    status: "active",
    fundingCount: 3,
    totalInvestment: 2500000,
    reportCount: 0
  },
  {
    id: 2,
    name: "이지영",
    email: "jiyoung@example.com",
    role: "fan",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    joinDate: "2025-02-20",
    lastActivity: "2025-08-08",
    status: "active",
    fundingCount: 8,
    totalInvestment: 1200000,
    reportCount: 1
  },
  {
    id: 3,
    name: "박소영",
    email: "soyoung@example.com",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    joinDate: "2025-01-10",
    lastActivity: "2025-08-07",
    status: "suspended",
    fundingCount: 2,
    totalInvestment: 800000,
    reportCount: 3
  },
  {
    id: 4,
    name: "정우진",
    email: "woojin@example.com",
    role: "fan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    joinDate: "2025-04-05",
    lastActivity: "2025-08-09",
    status: "active",
    fundingCount: 12,
    totalInvestment: 3500000,
    reportCount: 0
  },
  {
    id: 5,
    name: "황미나",
    email: "mina@example.com",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
    joinDate: "2025-05-12",
    lastActivity: "2025-08-06",
    status: "pending",
    fundingCount: 0,
    totalInvestment: 0,
    reportCount: 0
  }
];

export function UserManagementTable() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all" || user.status === filter || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">활성</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">정지</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">대기</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "artist" ? 
      <Badge variant="outline" className="bg-purple-100 text-purple-800">아티스트</Badge> :
      <Badge variant="outline" className="bg-blue-100 text-blue-800">팬</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>회원 관리</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="이름 또는 이메일 검색" 
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
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="suspended">정지</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="artist">아티스트</SelectItem>
                <SelectItem value="fan">팬</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>최근 활동</TableHead>
              <TableHead>펀딩 참여</TableHead>
              <TableHead>총 투자금</TableHead>
              <TableHead>신고 횟수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>{user.lastActivity}</TableCell>
                <TableCell>{user.fundingCount}건</TableCell>
                <TableCell>₩{user.totalInvestment.toLocaleString()}</TableCell>
                <TableCell>
                  {user.reportCount > 0 ? (
                    <Badge className="bg-red-100 text-red-800">
                      {user.reportCount}회
                    </Badge>
                  ) : (
                    <span className="text-gray-400">없음</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {user.status === "active" ? (
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Ban className="w-4 h-4" />
                      </Button>
                    ) : user.status === "suspended" ? (
                      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    ) : null}
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
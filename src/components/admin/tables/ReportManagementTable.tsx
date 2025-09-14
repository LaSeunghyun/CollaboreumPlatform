import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { Search, Eye, AlertTriangle, CheckCircle, XCircle, MessageSquare, User, FileText, Camera, Video } from "lucide-react";

// Mock Data
const reports = [
  {
    id: 1,
    reportedUser: {
      id: 1,
      name: "박소영",
      email: "soyoung@example.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      role: "artist"
    },
    reporter: {
      id: 2,
      name: "김민수",
      email: "minsu@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    contentType: "project",
    contentId: 123,
    contentTitle: "독립 영화 '도시의 밤'",
    reason: "inappropriate_content",
    description: "프로젝트 내용이 선정적이고 부적절한 이미지가 포함되어 있습니다.",
    status: "pending",
    priority: "high",
    reportDate: "2025-08-09T10:30:00Z",
    assignedTo: null,
    category: "content_violation"
  },
  {
    id: 2,
    reportedUser: {
      id: 3,
      name: "정우진",
      email: "woojin@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      role: "fan"
    },
    reporter: {
      id: 4,
      name: "황미나",
      email: "mina@example.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face"
    },
    contentType: "comment",
    contentId: 456,
    contentTitle: "커뮤니티 댓글",
    reason: "harassment",
    description: "반복적으로 욕설과 비하 발언을 하고 있습니다. 스크린샷 첨부합니다.",
    status: "investigating",
    priority: "high",
    reportDate: "2025-08-08T15:20:00Z",
    assignedTo: "김관리자",
    category: "behavioral_issue"
  },
  {
    id: 3,
    reportedUser: {
      id: 5,
      name: "이지영",
      email: "jiyoung@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
      role: "artist"
    },
    reporter: {
      id: 6,
      name: "김철수",
      email: "chulsoo@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
    },
    contentType: "post",
    contentId: 789,
    contentTitle: "개인전 홍보 게시글",
    reason: "spam",
    description: "동일한 내용의 게시글을 여러 커뮤니티에 반복 게시하고 있습니다.",
    status: "resolved",
    priority: "medium",
    reportDate: "2025-08-07T09:15:00Z",
    assignedTo: "이관리자",
    category: "spam_violation",
    resolution: "warning_issued",
    resolvedDate: "2025-08-08T14:30:00Z",
    resolutionNote: "첫 번째 경고 발송. 재발 시 계정 정지 조치 예정"
  },
  {
    id: 4,
    reportedUser: {
      id: 7,
      name: "서민호",
      email: "minho@example.com",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face",
      role: "fan"
    },
    reporter: {
      id: 8,
      name: "장수진",
      email: "sujin@example.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face"
    },
    contentType: "live_stream",
    contentId: 321,
    contentTitle: "라이브 스트림",
    reason: "copyright",
    description: "저작권이 있는 음악을 무단으로 사용하여 방송하고 있습니다.",
    status: "dismissed",
    priority: "low",
    reportDate: "2025-08-06T20:45:00Z",
    assignedTo: "박관리자",
    category: "copyright_issue",
    resolution: "not_violation",
    resolvedDate: "2025-08-07T11:00:00Z",
    resolutionNote: "해당 음악은 저작권자의 허가를 받은 정당한 사용임을 확인"
  }
];

interface ReportDetailModalProps {
  report: typeof reports[0] | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: number, resolution: string, note: string) => void;
  onDismiss: (id: number, note: string) => void;
  onAssign: (id: number, assignee: string) => void;
}

function ReportDetailModal({ report, isOpen, onClose, onResolve, onDismiss, onAssign }: ReportDetailModalProps) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [assignee, setAssignee] = useState("");

  if (!report) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-red-100 text-red-800">대기중</Badge>;
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-800">조사중</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">해결됨</Badge>;
      case "dismissed":
        return <Badge className="bg-gray-100 text-gray-800">기각됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">높음</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">중간</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">낮음</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      spam: "스팸/광고",
      harassment: "괴롭힘",
      inappropriate_content: "부적절한 콘텐츠",
      fraud: "사기",
      copyright: "저작권 침해",
      other: "기타"
    };
    return reasonMap[reason] || reason;
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "user": return <User className="w-4 h-4" />;
      case "project": return <FileText className="w-4 h-4" />;
      case "post": return <MessageSquare className="w-4 h-4" />;
      case "comment": return <MessageSquare className="w-4 h-4" />;
      case "live_stream": return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleResolve = (resolution: string) => {
    onResolve(report.id, resolution, resolutionNote);
    setResolutionNote("");
    onClose();
  };

  const handleDismiss = () => {
    onDismiss(report.id, resolutionNote);
    setResolutionNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>신고 상세 정보</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 신고 기본 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-semibold">신고 #{report.id}</span>
              {getStatusBadge(report.status)}
              {getPriorityBadge(report.priority)}
            </div>
            <div className="text-sm text-gray-500">
              신고일: {new Date(report.reportDate).toLocaleString()}
            </div>
          </div>

          {/* 신고 대상 정보 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">신고 대상</h4>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={report.reportedUser.avatar} alt={report.reportedUser.name} />
                  <AvatarFallback>{report.reportedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{report.reportedUser.name}</div>
                  <div className="text-sm text-gray-500">{report.reportedUser.email}</div>
                  <Badge variant="outline" className="mt-1">
                    {report.reportedUser.role === "artist" ? "아티스트" : "팬"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">신고자</h4>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={report.reporter.avatar} alt={report.reporter.name} />
                  <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{report.reporter.name}</div>
                  <div className="text-sm text-gray-500">{report.reporter.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 신고된 콘텐츠 정보 */}
          <div>
            <h4 className="font-semibold mb-3">신고된 콘텐츠</h4>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getContentIcon(report.contentType)}
                <span className="font-medium">{report.contentTitle}</span>
                <Badge variant="outline">{report.contentType}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>ID: {report.contentId}</span>
                <span>사유: {getReasonText(report.reason)}</span>
              </div>
            </div>
          </div>

          {/* 신고 내용 */}
          <div>
            <h4 className="font-semibold mb-2">신고 내용</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{report.description}</p>
            </div>
          </div>

          {/* 담당자 정보 */}
          <div>
            <h4 className="font-semibold mb-2">담당자</h4>
            <div className="flex items-center gap-3">
              {report.assignedTo ? (
                <Badge variant="outline">{report.assignedTo}</Badge>
              ) : (
                <span className="text-gray-500">미배정</span>
              )}
              {!report.assignedTo && (report.status === "pending" || report.status === "investigating") && (
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="담당자 배정" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="김관리자">김관리자</SelectItem>
                    <SelectItem value="이관리자">이관리자</SelectItem>
                    <SelectItem value="박관리자">박관리자</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {assignee && (
                <Button size="sm" onClick={() => onAssign(report.id, assignee)}>
                  배정
                </Button>
              )}
            </div>
          </div>

          {/* 이미 처리된 신고의 경우 처리 결과 표시 */}
          {(report.status === "resolved" || report.status === "dismissed") && report.resolutionNote && (
            <div className={`p-4 rounded-lg ${report.status === "resolved" ? "bg-green-50" : "bg-gray-50"}`}>
              <h4 className={`font-semibold mb-2 ${report.status === "resolved" ? "text-green-800" : "text-gray-800"}`}>
                처리 결과
              </h4>
              <p className="text-sm mb-2">{report.resolutionNote}</p>
              <p className="text-xs text-gray-600">
                처리일: {report.resolvedDate && new Date(report.resolvedDate).toLocaleString()} | 
                담당자: {report.assignedTo}
              </p>
            </div>
          )}

          {/* 처리 액션 */}
          {(report.status === "pending" || report.status === "investigating") && (
            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">처리 메모</label>
                <Textarea
                  placeholder="처리 결과 및 조치사항을 입력하세요..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  기각
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve("warning_issued")}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  경고 발송
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResolve("content_removed")}
                  className="text-orange-600 hover:text-orange-700"
                >
                  콘텐츠 삭제
                </Button>
                <Button
                  onClick={() => handleResolve("user_suspended")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  계정 정지
                </Button>
              </div>
            </div>
          )}

          {(report.status === "resolved" || report.status === "dismissed") && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReportManagementTable() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === "all" || report.status === filter;
    const matchesSearch = report.reportedUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.contentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-red-100 text-red-800">대기중</Badge>;
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-800">조사중</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">해결됨</Badge>;
      case "dismissed":
        return <Badge className="bg-gray-100 text-gray-800">기각됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">높음</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">중간</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">낮음</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      spam: "스팸/광고",
      harassment: "괴롭힘",
      inappropriate_content: "부적절한 콘텐츠",
      fraud: "사기",
      copyright: "저작권 침해",
      other: "기타"
    };
    return reasonMap[reason] || reason;
  };

  const handleViewDetails = (report: typeof reports[0]) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleResolve = (id: number, resolution: string, note: string) => {
    console.log(`신고 해결: ${id}, 해결책: ${resolution}, 메모: ${note}`);
    // API 호출 로직
  };

  const handleDismiss = (id: number, note: string) => {
    console.log(`신고 기각: ${id}, 메모: ${note}`);
    // API 호출 로직
  };

  const handleAssign = (id: number, assignee: string) => {
    console.log(`담당자 배정: ${id}, 담당자: ${assignee}`);
    // API 호출 로직
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>신고 관리</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="사용자 또는 콘텐츠 검색" 
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
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="investigating">조사중</SelectItem>
                  <SelectItem value="resolved">해결됨</SelectItem>
                  <SelectItem value="dismissed">기각됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신고 대상</TableHead>
                <TableHead>신고자</TableHead>
                <TableHead>콘텐츠</TableHead>
                <TableHead>사유</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>신고일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={report.reportedUser.avatar} alt={report.reportedUser.name} />
                        <AvatarFallback>{report.reportedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{report.reportedUser.name}</div>
                        <div className="text-sm text-gray-500">
                          {report.reportedUser.role === "artist" ? "아티스트" : "팬"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={report.reporter.avatar} alt={report.reporter.name} />
                        <AvatarFallback className="text-xs">{report.reporter.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{report.reporter.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate font-medium">{report.contentTitle}</p>
                    <p className="text-sm text-gray-500">{report.contentType}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getReasonText(report.reason)}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                  <TableCell>
                    {report.assignedTo || <span className="text-gray-400">미배정</span>}
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {new Date(report.reportDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(report)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportDetailModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
        onAssign={handleAssign}
      />
    </>
  );
}
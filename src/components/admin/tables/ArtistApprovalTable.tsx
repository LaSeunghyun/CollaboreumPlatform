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
import { Search, Eye, CheckCircle, XCircle, Clock, FileText, ExternalLink } from "lucide-react";

// Mock Data
const artistApplications = [
  {
    id: 1,
    name: "김민수",
    email: "minsu@example.com",
    stageName: "MinSu",
    category: "music",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    bio: "10년간 인디 음악을 해온 싱어송라이터입니다. 감성적인 멜로디와 진솔한 가사로 많은 사람들에게 위로를 주고 싶습니다.",
    portfolioUrl: "https://soundcloud.com/minsu-music",
    socialLinks: {
      instagram: "@minsu_official",
      youtube: "MinSu Music",
      spotify: "MinSu"
    },
    submissionDate: "2025-08-05",
    status: "pending",
    documentsSubmitted: ["identity", "portfolio", "artistStatement"],
    previousWorks: 3,
    followers: 1250
  },
  {
    id: 2,
    name: "이지영",
    email: "jiyoung@example.com",
    stageName: "Jiyoung Lee",
    category: "art",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    bio: "현대 미술가로 활동하며 디지털과 아날로그의 경계를 탐구합니다. 색채와 형태를 통해 감정을 표현하는 작업을 하고 있습니다.",
    portfolioUrl: "https://behance.net/jiyoung-art",
    socialLinks: {
      instagram: "@jiyoung.art",
      behance: "jiyoung-art"
    },
    submissionDate: "2025-08-07",
    status: "under_review",
    documentsSubmitted: ["identity", "portfolio", "artistStatement", "exhibition"],
    previousWorks: 8,
    followers: 892
  },
  {
    id: 3,
    name: "박소영",
    email: "soyoung@example.com",
    stageName: "So Young Park",
    category: "photography",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    bio: "사진을 통해 일상의 아름다움을 포착하는 작업을 합니다. 특히 자연광과 그림자의 조화에 관심이 많습니다.",
    portfolioUrl: "https://flickr.com/soyoung-photo",
    socialLinks: {
      instagram: "@soyoung.photo",
      flickr: "soyoung-photo"
    },
    submissionDate: "2025-08-03",
    status: "approved",
    documentsSubmitted: ["identity", "portfolio", "artistStatement"],
    previousWorks: 5,
    followers: 2340,
    approvedDate: "2025-08-08",
    approvedBy: "김관리자"
  },
  {
    id: 4,
    name: "정우진",
    email: "woojin@example.com",
    stageName: "WooJin",
    category: "film",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    bio: "독립 영화 감독으로 활동하며 사회적 메시지가 담긴 작품을 만듭니다.",
    portfolioUrl: "https://vimeo.com/woojin-films",
    socialLinks: {
      vimeo: "woojin-films",
      instagram: "@woojin.director"
    },
    submissionDate: "2025-08-01",
    status: "rejected",
    documentsSubmitted: ["identity", "portfolio"],
    previousWorks: 2,
    followers: 456,
    rejectedDate: "2025-08-06",
    rejectionReason: "포트폴리오가 부족하고 아티스트 선언문이 누락되었습니다.",
    rejectedBy: "이관리자"
  }
];

interface ArtistDetailModalProps {
  artist: typeof artistApplications[0] | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number, feedback: string) => void;
  onReject: (id: number, reason: string) => void;
}

function ArtistDetailModal({ artist, isOpen, onClose, onApprove, onReject }: ArtistDetailModalProps) {
  const [feedback, setFeedback] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!artist) return null;

  const handleApprove = () => {
    onApprove(artist.id, feedback);
    setFeedback("");
    onClose();
  };

  const handleReject = () => {
    onReject(artist.id, rejectionReason);
    setRejectionReason("");
    onClose();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">대기중</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">검토중</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">승인됨</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">반려됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, string> = {
      music: "음악",
      art: "미술",
      photography: "사진",
      film: "영화",
      literature: "문학",
      performance: "공연"
    };
    return <Badge variant="outline">{categoryMap[category] || category}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>아티스트 신청 상세</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={artist.avatar} alt={artist.name} />
              <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">{artist.name}</h3>
                {getStatusBadge(artist.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>활동명: <strong>{artist.stageName}</strong></span>
                {getCategoryBadge(artist.category)}
              </div>
              <p className="text-sm text-gray-600 mb-2">{artist.email}</p>
              <p className="text-sm">
                신청일: {artist.submissionDate} | 
                작품 수: {artist.previousWorks}개 | 
                팔로워: {artist.followers.toLocaleString()}명
              </p>
            </div>
          </div>

          {/* 아티스트 소개 */}
          <div>
            <h4 className="font-semibold mb-2">아티스트 소개</h4>
            <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
          </div>

          {/* 포트폴리오 및 소셜 링크 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">포트폴리오</h4>
              <a 
                href={artist.portfolioUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                포트폴리오 보기
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-2">소셜 미디어</h4>
              <div className="space-y-1">
                {Object.entries(artist.socialLinks).map(([platform, handle]) => (
                  <div key={platform} className="flex items-center gap-2 text-sm">
                    <span className="capitalize font-medium">{platform}:</span>
                    <span className="text-gray-600">{handle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 제출 서류 */}
          <div>
            <h4 className="font-semibold mb-2">제출 서류</h4>
            <div className="flex gap-2 flex-wrap">
              {artist.documentsSubmitted.map((doc) => (
                <Badge key={doc} variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {doc === "identity" ? "신분증명서" :
                   doc === "portfolio" ? "포트폴리오" :
                   doc === "artistStatement" ? "아티스트 선언문" :
                   doc === "exhibition" ? "전시이력" : doc}
                </Badge>
              ))}
            </div>
          </div>

          {/* 승인/반려 이력 */}
          {artist.status === "approved" && artist.approvedDate && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">승인 완료</h4>
              <p className="text-sm text-green-700">
                승인일: {artist.approvedDate} | 승인자: {artist.approvedBy}
              </p>
            </div>
          )}

          {artist.status === "rejected" && artist.rejectedDate && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">반려 사유</h4>
              <p className="text-sm text-red-700 mb-2">{artist.rejectionReason}</p>
              <p className="text-sm text-red-700">
                반려일: {artist.rejectedDate} | 담당자: {artist.rejectedBy}
              </p>
            </div>
          )}

          {/* 액션 섹션 */}
          {artist.status === "pending" || artist.status === "under_review" ? (
            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">승인 피드백 (선택사항)</label>
                <Textarea
                  placeholder="아티스트에게 전달할 메시지를 입력하세요..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">반려 사유</label>
                <Textarea
                  placeholder="반려 시 사유를 입력하세요..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  반려
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  승인
                </Button>
              </div>
            </div>
          ) : (
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

export function ArtistApprovalTable() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<typeof artistApplications[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredApplications = artistApplications.filter(application => {
    const matchesFilter = filter === "all" || application.status === filter;
    const matchesSearch = application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">대기중</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">검토중</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">승인됨</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">반려됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, string> = {
      music: "음악",
      art: "미술",
      photography: "사진",
      film: "영화",
      literature: "문학",
      performance: "공연"
    };
    return <Badge variant="outline">{categoryMap[category] || category}</Badge>;
  };

  const handleViewDetails = (artist: typeof artistApplications[0]) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const handleApprove = (id: number, feedback: string) => {
    console.log(`승인: ${id}, 피드백: ${feedback}`);
    // API 호출 로직
  };

  const handleReject = (id: number, reason: string) => {
    console.log(`반려: ${id}, 사유: ${reason}`);
    // API 호출 로직
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>아티스트 승인 관리</CardTitle>
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
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="under_review">검토중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">반려됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>아티스트</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead>작품 수</TableHead>
                <TableHead>팔로워</TableHead>
                <TableHead>제출 서류</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={application.avatar} alt={application.name} />
                        <AvatarFallback>{application.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{application.name}</div>
                        <div className="text-sm text-gray-500">{application.stageName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(application.category)}</TableCell>
                  <TableCell>{application.submissionDate}</TableCell>
                  <TableCell>{application.previousWorks}개</TableCell>
                  <TableCell>{application.followers.toLocaleString()}명</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {application.documentsSubmitted.slice(0, 3).map((doc, index) => (
                        <div key={index} className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ))}
                      {application.documentsSubmitted.length > 3 && (
                        <span className="text-xs text-gray-500">+{application.documentsSubmitted.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(application)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {(application.status === "pending" || application.status === "under_review") && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ArtistDetailModal
        artist={selectedArtist}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
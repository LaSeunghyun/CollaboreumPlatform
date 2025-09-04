import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { TrendingUp, Award, Users, ChevronLeft, ArrowRight } from "lucide-react";

interface AboutProps {
  onBack?: () => void;
}

export function About({ onBack }: AboutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-muted/20">
      {/* Header */}
      <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-apple border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-secondary/60 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
            <div className="h-6 w-px bg-border/50" />
            <h1 className="text-2xl font-semibold text-foreground">콜라보리움 소개</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              <span className="text-primary">창작자와 팬이<br />
              함께 성장하는<br />
              새로운 플랫폼</span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Collaboreum은 독립 아티스트들에게 안정적인 창작 환경을 제공하고,<br />
              팬들에게는 아티스트와 함께 성장할 수 있는 기회를 선사합니다.
            </p>
          </div>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center p-8 glass-morphism hover:shadow-apple-lg transition-all duration-300 border-border/50 rounded-3xl group">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">제작 지원 펀딩</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                신뢰할 수 있는 신탁 관리 시스템으로 안전한 프로젝트 펀딩을 지원합니다.
                WBS(작업분해구조) 기반의 체계적인 프로젝트 관리로 투명성을 보장합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 glass-morphism hover:shadow-apple-lg transition-all duration-300 border-border/50 rounded-3xl group">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">수익 공유 포인트</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                성공한 프로젝트의 수익을 포인트로 받고, 새로운 투자로 연결하세요.
                참여한 팬들도 함께 성공의 기쁨을 나눌 수 있는 혁신적인 시스템입니다.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 glass-morphism hover:shadow-apple-lg transition-all duration-300 border-border/50 rounded-3xl group">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">커뮤니티 생태계</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                장르별 포럼, 라이브 스트리밍, 이벤트로 아티스트와 깊이 소통하세요.
                진정한 창작 커뮤니티에서 서로 영감을 주고받을 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-20">
          {/* Vision */}
          <div className="text-center">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">우리의 비전</h3>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                독립 아티스트들이 자신의 창작에만 집중할 수 있는 환경을 만들고,
                팬들이 단순한 소비자가 아닌 창작 과정의 파트너가 될 수 있는 생태계를 구축합니다.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 glass-morphism border-border/50 rounded-2xl">
                  <h4 className="text-xl font-semibold text-foreground mb-4">아티스트를 위해</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    안정적인 수익 구조와 체계적인 프로젝트 관리 시스템으로
                    창작자들이 오롯이 작품에 집중할 수 있도록 지원합니다.
                  </p>
                </Card>
                <Card className="p-6 glass-morphism border-border/50 rounded-2xl">
                  <h4 className="text-xl font-semibold text-foreground mb-4">팬을 위해</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    좋아하는 아티스트와 더 가까워지고, 창작 과정에 참여하며,
                    성공의 기쁨을 함께 나눌 수 있는 특별한 경험을 제공합니다.
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground text-center mb-12">어떻게 작동하나요?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg">1</div>
                <h4 className="text-xl font-semibold text-foreground mb-4">프로젝트 등록</h4>
                <p className="text-muted-foreground leading-relaxed">
                  아티스트가 WBS를 통해 체계적으로 프로젝트를 계획하고 펀딩을 신청합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg">2</div>
                <h4 className="text-xl font-semibold text-foreground mb-4">팬 참여</h4>
                <p className="text-muted-foreground leading-relaxed">
                  팬들이 프로젝트에 펀딩하고, 창작 과정을 지켜보며 소통합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg">3</div>
                <h4 className="text-xl font-semibold text-foreground mb-4">수익 공유</h4>
                <p className="text-muted-foreground leading-relaxed">
                  프로젝트 성공 시 참여한 팬들도 포인트 형태로 수익을 공유받습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-12">성장하는 커뮤니티</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-morphism rounded-2xl p-6 border-border/30">
                <div className="text-4xl font-bold text-foreground mb-2">1,247</div>
                <div className="text-muted-foreground font-medium">등록 아티스트</div>
              </div>
              <div className="glass-morphism rounded-2xl p-6 border-border/30">
                <div className="text-4xl font-bold text-foreground mb-2">89</div>
                <div className="text-muted-foreground font-medium">성공 프로젝트</div>
              </div>
              <div className="glass-morphism rounded-2xl p-6 border-border/30">
                <div className="text-4xl font-bold text-foreground mb-2">₩2.1억</div>
                <div className="text-muted-foreground font-medium">총 펀딩 금액</div>
              </div>
              <div className="glass-morphism rounded-2xl p-6 border-border/30">
                <div className="text-4xl font-bold text-foreground mb-2">15,432</div>
                <div className="text-muted-foreground font-medium">활성 후원자</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
              지금 Collaboreum과 함께하세요
            </h3>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              창작자와 팬이 함께 만들어가는 새로운 문화 생태계의 일원이 되어보세요.
            </p>
            <Button 
              size="lg" 
              onClick={onBack}
              className="text-lg px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-2xl shadow-apple-lg transition-all duration-200 hover:scale-105"
            >
              플랫폼 둘러보기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
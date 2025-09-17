import React from "react";
import { Card, CardContent } from "./ui/card";
import { Calendar, Image, Trophy, Headphones, ArrowRight } from "lucide-react";

interface QuickLinksSectionProps {
  onNavigate?: (section: string) => void;
}

export function QuickLinksSection({ onNavigate }: QuickLinksSectionProps) {
  const quickLinks = [
    {
      id: "events",
      title: "이벤트",
      description: "진행 중인 특별 이벤트와 공모전을 확인하세요",
      icon: Calendar,
      color: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      stats: "15개 진행중"
    },
    {
      id: "gallery",
      title: "작품 갤러리",
      description: "아티스트들의 다양한 작품을 감상해보세요",
      icon: Image,
      color: "bg-chart-5/10 text-chart-5 border-chart-5/20",
      stats: "2,341개 작품"
    },
    {
      id: "achievements",
      title: "성공 스토리",
      description: "펀딩에 성공한 프로젝트들의 이야기를 만나보세요",
      icon: Trophy,
      color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      stats: "89개 성공"
    },
    {
      id: "podcasts",
      title: "크리에이터 토크",
      description: "아티스트들의 창작 이야기와 인사이트를 들어보세요",
      icon: Headphones,
      color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
      stats: "새 에피소드"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            더 많은 <span className="text-primary">창작 콘텐츠</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Card
                key={link.id}
                className="group hover:shadow-apple-lg transition-all duration-300 cursor-pointer border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-background to-secondary/30"
                onClick={() => onNavigate?.(link.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${link.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {link.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {link.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {link.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>


      </div>
    </section>
  );
}
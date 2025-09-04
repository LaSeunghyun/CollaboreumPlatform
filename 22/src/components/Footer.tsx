import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-background">Collaboreum</h3>
            <p className="text-background/70 mb-6 leading-relaxed">
              아티스트와 팬이 함께 만드는 창작의 새로운 공간
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10 p-3 cursor-pointer rounded-2xl">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10 p-3 cursor-pointer rounded-2xl">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10 p-3 cursor-pointer rounded-2xl">
                <Youtube className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10 p-3 cursor-pointer rounded-2xl">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-background">빠른 링크</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">아티스트 등록</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">프로젝트 둘러보기</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">커뮤니티</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">이벤트</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6 text-background">고객지원</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">도움말</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">펀딩 가이드</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">수수료 안내</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors cursor-pointer">문의하기</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-6 text-background">뉴스레터</h4>
            <p className="text-background/70 mb-6 leading-relaxed">
              새로운 프로젝트와 이벤트 소식을 받아보세요
            </p>
            <div className="flex gap-3">
              <Input 
                placeholder="이메일 주소" 
                className="bg-background/10 border-background/20 text-background placeholder-background/50 rounded-2xl backdrop-blur-sm"
              />
              <Button className="bg-background text-foreground hover:bg-background/90 cursor-pointer font-medium">구독</Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-background/60 font-medium">
              © 2025 Collaboreum. All rights reserved.
            </div>
            <div className="flex space-x-8 mt-6 md:mt-0">
              <a href="#" className="text-background/60 hover:text-background transition-colors cursor-pointer font-medium">개인정보처리방침</a>
              <a href="#" className="text-background/60 hover:text-background transition-colors cursor-pointer font-medium">이용약관</a>
              <a href="#" className="text-background/60 hover:text-background transition-colors cursor-pointer font-medium">쿠키 정책</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
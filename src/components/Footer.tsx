import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Collaboreum</h3>
            <p className="text-gray-400 mb-4">
              아티스트와 팬이 함께 만드는 창작의 새로운 공간
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Youtube className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li><button className="text-gray-400 hover:text-white transition-colors">아티스트 등록</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">프로젝트 둘러보기</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">커뮤니티</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">이벤트</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2">
              <li><button className="text-gray-400 hover:text-white transition-colors">도움말</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">펀딩 가이드</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">수수료 안내</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">문의하기</button></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">뉴스레터</h4>
            <p className="text-gray-400 mb-4 text-sm">
              새로운 프로젝트와 이벤트 소식을 받아보세요
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="이메일 주소"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button variant="secondary">구독</Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2025 Collaboreum. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">개인정보처리방침</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">이용약관</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">쿠키 정책</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import { Button } from '@/shared/ui/shadcn/button';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex items-center gap-4'>
          <Button variant='ghost' onClick={onBack} className='p-2'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>이용약관</h1>
            <p className='text-gray-600'>
              Collaboreum 서비스 이용을 위한 약관입니다
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className='space-y-6 rounded-lg bg-white p-8 shadow-sm'>
          <div className='prose prose-lg max-w-none'>
            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제1조 (목적)
            </h2>
            <p className='mb-4 text-gray-700'>
              이 약관은 Collaboreum(이하 &quot;회사&quot;)이 제공하는 아티스트와
              팬을 연결하는 창작 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용과
              관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한
              사항을 규정함을 목적으로 합니다.
            </p>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제2조 (정의)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. &quot;서비스&quot;라 함은 회사가 제공하는 아티스트와 팬을
                연결하는 창작 플랫폼 서비스를 의미합니다.
              </p>
              <p className='text-gray-700'>
                2. &quot;회원&quot;이라 함은 회사의 서비스에 접속하여 이 약관에
                따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를
                이용하는 고객을 말합니다.
              </p>
              <p className='text-gray-700'>
                3. &quot;아티스트&quot;라 함은 창작 활동을 하는 회원을
                의미합니다.
              </p>
              <p className='text-gray-700'>
                4. &quot;팬&quot;이라 함은 아티스트의 작품을 감상하고 후원하는
                회원을 의미합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제3조 (약관의 효력 및 변경)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그
                효력을 발생합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이
                약관을 변경할 수 있습니다.
              </p>
              <p className='text-gray-700'>
                3. 약관이 변경되는 경우, 회사는 변경사항을 시행일자 7일 전부터
                공지사항을 통해 공지합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제4조 (서비스의 제공)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-gray-700'>
                <li>아티스트 작품 전시 및 홍보 서비스</li>
                <li>팬과 아티스트 간 소통 서비스</li>
                <li>창작 활동 후원 및 펀딩 서비스</li>
                <li>커뮤니티 및 이벤트 서비스</li>
              </ul>
              <p className='text-gray-700'>
                2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제5조 (회원가입)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 서비스를 이용하고자 하는 자는 회사가 정한 가입양식에 따라
                회원정보를 기입한 후 이 약관에 동의하여 회원가입을 신청합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 제1항과 같이 신청한 자가 다음 각 호에 해당하지 않는 한
                회원으로 등록합니다:
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-gray-700'>
                <li>
                  가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이
                  있는 경우
                </li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>
                  기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고
                  판단되는 경우
                </li>
              </ul>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제6조 (회원의 의무)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회원은 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-gray-700'>
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>
                  회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신
                  또는 게시
                </li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>
                  회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
                </li>
                <li>
                  외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는
                  정보를 서비스에 공개 또는 게시하는 행위
                </li>
              </ul>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제7조 (회사의 의무)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 관련법령과 이 약관이 금지하거나 공서양속에 반하는
                행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고,
                안정적으로 서비스를 제공하기 위하여 노력합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 회원이 안전하게 인터넷 서비스를 이용할 수 있도록
                회원의 개인정보(신용정보 포함) 보호를 위한 보안 시스템을
                구축합니다.
              </p>
              <p className='text-gray-700'>
                3. 회사는 서비스이용과 관련하여 회원에게 발생한 손해에 대하여
                회사의 고의 또는 중과실이 없는 한 책임을 부담하지 않습니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제8조 (서비스의 중단)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장,
                통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을
                일시적으로 중단할 수 있습니다.
              </p>
              <p className='text-gray-700'>
                2. 제1항에 의한 서비스 중단의 경우에는 회사는 제9조에 정한
                방법으로 회원에게 통지합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제9조 (회원에 대한 통지)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사가 회원에 대한 통지를 하는 경우, 회원이 회사와 미리
                약정하여 지정한 전자우편 주소로 할 수 있습니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 불특정다수 회원에 대한 통지의 경우 1주일이상 회사
                게시판에 게시함으로써 개별 통지에 갈음할 수 있습니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제10조 (계약해지 및 이용제한)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회원은 언제든지 서비스 이용을 중단하고 회사에 해지의사를
                통지할 수 있습니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인
                운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스
                이용을 단계적으로 제한할 수 있습니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제11조 (준거법 및 관할법원)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 이 약관의 해석 및 회사와 회원 간의 분쟁에 대하여는 대한민국의
                법을 적용합니다.
              </p>
              <p className='text-gray-700'>
                2. 이 약관과 관련된 소송의 관할은 회사의 주소지를 관할하는
                법원으로 합니다.
              </p>
            </div>

            <div className='mt-8 rounded-lg bg-gray-50 p-4'>
              <p className='text-sm text-gray-600'>
                <strong>부칙</strong>
                <br />이 약관은 2024년 1월 1일부터 시행합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className='mt-8 text-center'>
          <Button onClick={onBack} variant='outline' size='lg'>
            돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

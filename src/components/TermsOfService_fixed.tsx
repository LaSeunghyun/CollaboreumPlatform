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
              Collaboreum 서비스 이용을 위한 약관입니다.
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
              이 약관은 Collaboreum(이하 "회사")이 제공하는 아티스트와 팬을
              연결하는 창작 플랫폼 서비스(이하 "서비스")의 이용과 관련하여
              회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을
              규정함을 목적으로 합니다.
            </p>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제2조 (정의)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. "서비스"란 회사가 제공하는 아티스트와 팬을 연결하는 창작
                플랫폼 서비스를 의미합니다.
              </p>
              <p className='text-gray-700'>
                2. "이용자"라 함은 회사의 서비스에 접속하여 이 약관에 따라
                회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
              </p>
              <p className='text-gray-700'>
                3. "아티스트"란 창작 활동을 하는 이용자를 의미합니다.
              </p>
              <p className='text-gray-700'>
                4. "팬"이라 함은 아티스트의 작품을 감상하고 후원하는 이용자를
                의미합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제3조 (약관의 효력 및 변경)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그
                효력을 발생합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 필요에 따라 관련법령을 위배하지 않는 범위에서 이
                약관을 변경할 수 있습니다.
              </p>
              <p className='text-gray-700'>
                3. 약관이 변경되는 경우, 회사는 변경사항을 시행일자 7일 이전에
                공지사항을 통해 공지합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제4조 (서비스의 제공)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 다음과 같은 서비스를 제공합니다.
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-gray-700'>
                <li>아티스트 프로필 관리 서비스</li>
                <li>창작 프로젝트 등록 및 관리 서비스</li>
                <li>후원 및 결제 서비스</li>
                <li>커뮤니티 서비스</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제5조 (서비스의 중단)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장,
                통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을
                일시적으로 중단할 수 있습니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로
                인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단,
                회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지
                아니합니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제6조 (회원가입)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이
                약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중
                다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
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
              제7조 (회원 탈퇴 및 자격 상실)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시
                회원탈퇴를 처리합니다.
              </p>
              <p className='text-gray-700'>
                2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을
                제한 및 정지시킬 수 있습니다.
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-gray-700'>
                <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                <li>
                  회사가 제공하는 서비스의 원활한 진행을 방해하는 행위를 한 경우
                </li>
                <li>기타 이 약관을 위반한 경우</li>
              </ul>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제8조 (개인정보보호)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한
                범위에서 최소한의 개인정보를 수집합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 회원가입시 구매계약이행에 필요한 정보를 미리 수집하지
                않습니다.
              </p>
              <p className='text-gray-700'>
                3. 회사는 이용자의 개인정보를 수집·이용하는 때에는 당해
                이용자에게 그 목적을 고지하고 동의를 받습니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제9조 (회사의 의무)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를
                하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로
                서비스를 제공하는데 최선을 다하여야 합니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록
                이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을
                구축하여야 합니다.
              </p>
              <p className='text-gray-700'>
                3. 회사는 이용자가 원하지 않는 영리목적의 광고성 전자우편을
                발송하지 않습니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제10조 (이용자의 의무)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                이용자는 다음 행위를 하여서는 안 됩니다.
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1 text-gray-700'>
                <li>신청 또는 변경시 허위 내용의 등록</li>
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
              제11조 (저작권의 귀속 및 이용제한)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에
                귀속합니다.
              </p>
              <p className='text-gray-700'>
                2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게
                지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신,
                출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나
                제3자에게 이용하게 하여서는 안됩니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제12조 (면책조항)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p className='text-gray-700'>
                2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는
                책임을 지지 않습니다.
              </p>
              <p className='text-gray-700'>
                3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에
                대하여 책임을 지지 않으며 그 밖에 서비스를 통하여 얻은 자료로
                인한 손해에 관하여는 책임을 지지 않습니다.
              </p>
            </div>

            <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
              제13조 (준거법 및 관할법원)
            </h2>
            <div className='mb-4 space-y-2'>
              <p className='text-gray-700'>
                1. 이 약관의 해석 및 회사와 이용자 간의 분쟁에 대하여는
                대한민국의 법을 적용합니다.
              </p>
              <p className='text-gray-700'>
                2. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우
                회사의 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.
              </p>
            </div>

            <div className='mt-8 rounded-lg bg-gray-50 p-4'>
              <p className='text-sm text-gray-600'>
                <strong>시행일:</strong> 2024년 1월 1일
                <br />
                <strong>최종 수정일:</strong> 2024년 1월 1일
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

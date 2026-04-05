'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function PrivacyPolicyPage() {
   const router = useRouter();
   const { settings } = useStore();
   
   const orgName = settings?.organizationName || '총학생회';
   const contactPerson = settings?.contactPerson || '총학생회장';
   const contactPhone = settings?.contactPhone || '010-0000-0000';

   return (
      <div className="flex flex-col min-h-[100dvh] bg-neutral-950 text-neutral-50 relative">
         {/* Header */}
         <div className="sticky top-0 p-6 pt-12 flex items-center justify-between border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md z-10">
            <button 
               onClick={() => router.back()} 
               className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
               <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-medium text-neutral-200">개인정보처리방침</h1>
            <div className="w-10" />
         </div>

         <main className="flex-1 p-6 overflow-y-auto z-10 pb-20">
            <div className="max-w-2xl mx-auto space-y-10 text-sm leading-relaxed text-neutral-400">
               
               <p className="text-neutral-300 font-medium">
                  제42대 SPACE 학생복지위원회(이하 &apos;위원회&apos;)는 이용자의 개인정보를 중요시하며, 「개인정보보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 철저히 준수하고 있습니다. 위원회는 본 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
               </p>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">1. 개인정보의 수집 항목 및 방법</h2>
                  <div className="space-y-3">
                     <p>위원회는 회원가입, 원활한 고객상담, 마일리지 시스템 등 각종 서비스의 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                     <h3 className="text-neutral-200 font-semibold mt-4">가. 수집하는 개인정보 항목</h3>
                     <ul className="list-disc pl-5 space-y-1.5 marker:text-neutral-600">
                        <li><span className="text-white font-medium">필수항목:</span> 이름, 학번(아이디), 비밀번호, 소속 학과, 휴대전화번호, 자치회비 납부 여부</li>
                        <li><span className="text-white font-medium">서비스 이용 과정에서 자동 수집되는 항목:</span> IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 불량 이용 기록, 접속 디바이스 정보</li>
                     </ul>
                     <h3 className="text-neutral-200 font-semibold mt-4">나. 개인정보 수집방법</h3>
                     <ul className="list-disc pl-5 space-y-1.5 marker:text-neutral-600">
                        <li>홈페이지(회원가입, 이벤트 응모 등), 서면 양식, 고객센터 문의</li>
                     </ul>
                  </div>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">2. 개인정보의 수집 및 이용 목적</h2>
                  <p>위원회는 수집한 개인정보를 다음의 수집 목적 이외의 용도로는 사용하지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.</p>
                  <ul className="list-disc pl-5 space-y-2 marker:text-neutral-600">
                     <li><span className="text-white font-medium">서비스 제공 및 계약의 이행:</span> 마일리지(포인트) 적립 및 사용, 이벤트 참여 및 경품 배송, 맞춤형 서비스 제공</li>
                     <li><span className="text-white font-medium">회원 관리:</span> 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량 회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 연령 확인, 불만처리 등 민원처리, 고지사항 전달</li>
                     <li><span className="text-white font-medium">신규 서비스 개발 및 마케팅:</span> 신규 서비스 발굴 및 이벤트 정보 안내, 서비스 이용 통계 및 분석</li>
                  </ul>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">3. 개인정보의 보유 및 이용 기간</h2>
                  <p>원칙적으로, 이용자의 개인정보는 회원 탈퇴 등 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
                  <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 space-y-2">
                     <p className="text-white font-medium">내부 방침에 의한 정보보유 사유</p>
                     <ul className="list-disc pl-5 space-y-1 text-sm marker:text-neutral-600">
                        <li>부정이용기록 (부정가입, 징계기록 등): 보존 이유(부정 이용 방지), 보존 기간(1년)</li>
                     </ul>
                     <p className="text-white font-medium mt-4">관련 법령에 의한 정보보유 사유</p>
                     <ul className="list-disc pl-5 space-y-1 text-sm marker:text-neutral-600">
                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                        <li>웹사이트 방문 기록: 3개월 (통신비밀보호법)</li>
                     </ul>
                  </div>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">4. 개인정보의 파기절차 및 방법</h2>
                  <p>이용자의 개인정보는 원칙적으로 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
                  <ul className="list-decimal pl-5 space-y-2 marker:text-neutral-600">
                     <li><span className="text-white font-medium">파기절차:</span> 이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다. 이 개인정보는 법률에 의한 경우가 아니고서는 보유되는 이외의 다른 목적으로 이용되지 않습니다.</li>
                     <li><span className="text-white font-medium">파기방법:</span> 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
                  </ul>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">5. 정보주체의 권리·의무 및 행사방법</h2>
                  <p>이용자는 개인정보 주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
                  <ul className="list-disc pl-5 space-y-1.5 marker:text-neutral-600">
                     <li>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지(회원탈퇴)를 요청할 수 있습니다.</li>
                     <li>개인정보 조회, 수정을 위해서는 &apos;마이페이지&apos; 등의 설정을, 가입해지를 위해서는 &apos;설정 - 로그아웃 및 탈퇴&apos; 메뉴를 이용하시거나 개인정보 보호책임자에게 연락주시면 지체 없이 조치하겠습니다.</li>
                     <li>이용자가 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다.</li>
                  </ul>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">6. 개인정보의 보호조치</h2>
                  <p>위원회는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
                  <ul className="list-disc pl-5 space-y-1.5 marker:text-neutral-600">
                     <li>비밀번호 암호화: 이용자의 비밀번호는 복호화할 수 없도록 일방향 암호화되어 저장 및 관리되고 있습니다.</li>
                     <li>해킹 등에 대비한 대책: 위원회는 해킹이나 컴퓨터 바이러스 등에 의해 회원의 개인정보가 유출되거나 훼손되는 것을 막기 위해 최선을 다하고 있습니다.</li>
                     <li>취급 직원의 최소화 및 교육: 개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보보호를 위한 교육을 실시하고 있습니다.</li>
                  </ul>
               </section>

               <p className="text-xs text-neutral-500 pt-8 text-center">
                  공고일자: 2026년 03월 1일<br/>
                  시행일자: 2026년 03월 1일
               </p>
               
            </div>
         </main>
      </div>
   );
}

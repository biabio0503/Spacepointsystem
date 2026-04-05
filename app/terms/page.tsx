'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfServicePage() {
   const router = useRouter();

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
            <h1 className="text-lg font-medium text-neutral-200">서비스 이용약관</h1>
            <div className="w-10" />
         </div>

         <main className="flex-1 p-6 overflow-y-auto z-10 pb-20">
            <div className="max-w-2xl mx-auto space-y-10 text-sm leading-relaxed text-neutral-400">
               
               <p className="text-neutral-300 font-medium">
                  환영합니다. 본 약관은 제42대 SPACE 학생복지위원회가 제공하는 마일리지 시스템 이용과 관련된 제반 권리 및 의무를 규정하고 있습니다. 시스템을 이용하시기 전에 본 약관을 주의 깊게 읽어보시기 바랍니다.
               </p>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">제 1 장 총칙</h2>
                  
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 1 조 (목적)</h3>
                        <p>본 약관은 제42대 SPACE 학생복지위원회(이하 &apos;위원회&apos;)가 제공하는 마일리지 시스템(이하 &apos;서비스&apos;)의 이용과 관련하여 위원회와 회원 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                     </div>
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 2 조 (용어의 정의)</h3>
                        <ol className="list-decimal pl-5 space-y-1.5 marker:text-neutral-600">
                           <li>&apos;서비스&apos;란 회원이 단말기를 불문하고 이용할 수 있는 위원회가 제공하는 마일리지 관리 및 관련 부가 서비스를 의미합니다.</li>
                           <li>&apos;회원&apos;이란 서비스에 접속하여 본 약관에 동의하고 위원회와 이용계약을 체결하여 서비스를 이용하는 서울과학기술대학교 재학생을 말합니다.</li>
                           <li>&apos;마일리지(포인트)&apos;란 회원이 위원회 행사 참여 등을 통해 획득하고, 위원회가 지정한 방식에 따라 사용할 수 있는 가상의 데이터를 의미합니다.</li>
                        </ol>
                     </div>
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 3 조 (약관의 효력 및 변경)</h3>
                        <ol className="list-decimal pl-5 space-y-1.5 marker:text-neutral-600">
                           <li>본 약관은 서비스 내 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
                           <li>위원회는 필요하다고 인정되는 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 개정할 수 있습니다. 약관 개정 시 적용일자 및 개정사유를 명시하여 적용일자 7일 전부터 서비스 내에 공지합니다.</li>
                           <li>회원은 변경된 약관에 대하여 거부권을 행사할 수 있으며, 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴를 요청할 수 있습니다.</li>
                        </ol>
                     </div>
                  </div>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">제 2 장 회원 가입 및 정보 관리</h2>
                  
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 4 조 (회원가입의 성립)</h3>
                        <p>이용계약은 가입을 희망하는 자가 약관과 개인정보처리방침에 동의한 후 회원가입 양식에 따라 정보를 기입하고 제출하면, 위원회가 이를 승인함으로써 성립됩니다. 타인의 정보(학번 등)를 도용하여 가입한 회원은 법적인 보호를 받을 수 없으며, 서비스 이용에 제한을 받을 수 있습니다.</p>
                     </div>
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 5 조 (계정 보안 및 관리 의무)</h3>
                        <ol className="list-decimal pl-5 space-y-1.5 marker:text-neutral-600">
                           <li>회원의 학번(아이디)과 비밀번호에 관한 관리 책임은 전적으로 회원 본인에게 있습니다.</li>
                           <li>회원은 자신의 아이디 및 비밀번호를 제3자에게 이용하게 해서는 안 되며, 이를 위반하여 발생하는 모든 책임은 회원에게 있습니다.</li>
                           <li>회원이 자신의 정보가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 위원회에 통지해야 합니다.</li>
                        </ol>
                     </div>
                  </div>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">제 3 장 서비스의 이용 및 마일리지(포인트)</h2>
                  
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 6 조 (마일리지의 적립)</h3>
                        <p>마일리지는 위원회가 주최하는 행사의 참여, 학생회비 납부 여부 등에 따라 위원회가 정한 기준에 의해 회원에게 부여됩니다.</p>
                     </div>
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 7 조 (마일리지의 정정, 취소 및 소멸)</h3>
                        <ol className="list-decimal pl-5 space-y-1.5 marker:text-neutral-600">
                           <li>시스템 오류 등으로 마일리지가 잘못 적립된 경우, 위원회는 이를 직권으로 정정할 수 있습니다.</li>
                           <li>마일리지는 타인에게 양도하거나 대여할 수 없으며 현금으로 환급받을 수 없습니다.</li>
                           <li>회원이 부정한 방법으로 마일리지를 획득한 경우, 위원회는 해당 마일리지를 회수하며 징계 조치를 취할 수 있습니다.</li>
                           <li>마일리지의 소멸 기한은 매 학기/학년도 말 위원회의 별도 공지가 없을 시 당해 연도 종료와 동시에 소멸되는 것을 원칙으로 합니다.</li>
                        </ol>
                     </div>
                  </div>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">제 4 장 계약해지 및 이용제한</h2>
                  
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 8 조 (계약해지)</h3>
                        <p>회원은 언제든지 서비스 내 설정 메뉴를 통하여 이용계약 해지(회원탈퇴)를 신청할 수 있으며, 이 경우 회원의 마일리지 및 관련 이용 기록은 삭제됩니다.</p>
                     </div>
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 9 조 (이용제한)</h3>
                        <p>위원회는 회원이 본 약관의 의무를 위반하거나, 비정상적인 방법으로 시스템에 접근 및 서비스를 방해하는 경우 즉시 서비스 이용을 제한할 수 있습니다.</p>
                     </div>
                  </div>
               </section>

               <section className="space-y-4">
                  <h2 className="text-base font-bold text-white mb-2 pb-2 border-b border-neutral-800/80">제 5 장 면책조항</h2>
                  
                  <div className="space-y-4">
                     <div>
                        <h3 className="text-neutral-200 font-semibold mb-1">제 10 조 (면책조항)</h3>
                        <ol className="list-decimal pl-5 space-y-1.5 marker:text-neutral-600">
                           <li>위원회는 천재지변, 서버 장애 및 기타 불가항력적인 원인으로 서비스를 제공할 수 없는 경우, 서비스 제공에 관한 책임이 면제됩니다.</li>
                           <li>위원회는 회원의 귀책사유로 인한 서비스 이용의 장애 및 손해에 대하여 책임을 지지 않습니다.</li>
                           <li>위원회는 회원이 서비스에 게재하거나 등록한 정보, 자료, 사실의 신뢰도 및 정확성에 관하여 책임을 지지 않습니다.</li>
                        </ol>
                     </div>
                  </div>
               </section>

               <p className="text-xs text-neutral-500 pt-8 text-center">
                  공고일자: 2026년 03월 01일<br/>
                  시행일자: 2026년 03월 01일
               </p>

            </div>
         </main>
      </div>
   );
}

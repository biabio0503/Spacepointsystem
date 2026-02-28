import type { Metadata } from "next";
import "@/styles/index.css";
import { StoreInitializer } from "@/store/useStore";

export const metadata: Metadata = {
   title: "Space Point System",
   description: "서울과학기술대학교 제42대 SPACE 학생복지위원회 포인트 관리 시스템",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="ko">
         <body>
            <StoreInitializer />
            <div className="flex justify-center min-h-screen" style={{ background: '#C8CED8' }}>
               <div className="w-full max-w-[430px] min-h-screen relative shadow-2xl overflow-hidden" style={{ background: '#EEF1F8' }}>
                  {children}
               </div>
            </div>
         </body>
      </html>
   );
}

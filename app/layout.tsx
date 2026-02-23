import type { Metadata } from "next";
import "@/styles/index.css";
import { AppProvider } from "@/components/context/AppContext";

export const metadata: Metadata = {
   title: "Buddy Point System",
   description: "포인트 관리 시스템",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="ko">
         <body>
            <AppProvider>
               <div className="flex justify-center min-h-screen" style={{ background: '#C8CED8' }}>
                  <div className="w-full max-w-[430px] min-h-screen relative shadow-2xl overflow-hidden" style={{ background: '#EEF1F8' }}>
                     {children}
                  </div>
               </div>
            </AppProvider>
         </body>
      </html>
   );
}

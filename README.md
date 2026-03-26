# 🌟 Welfare Point System

안녕하세요! 서울과학기술대학교 정보통신대학 컴퓨터공학과 24학번 이재호입니다. 

**Welfare Point System**은 동아리 및 학생회의 포인트 관리, 이벤트 출석(QR), 물품 대여 등을 보다 효율적이고 체계적으로 운영하기 위해 개발하고 구축한 종합 관리 시스템입니다. 

기존의 번거롭던 수기/엑셀 관리를 넘어, 모바일과 PC 모두에서 편리하게 사용할 수 있도록 최적화했습니다.

## 👨‍💻 Developer
- **Developed by:** jaehoya
- **GitHub Profile:** [https://github.com/jaehoya](https://github.com/jaehoya)

---

## ✨ 주요 기능 (Key Features)

시스템을 이용하는 사용자와 관리자 모두에게 필요한 핵심 기능들을 제공합니다:

- **🔐 인증 및 로그인:** 학번 인증 및 카카오 소셜 로그인(Kakao OAuth)을 통한 간편 접속
- **📊 포인트 및 등급 관리:** 개인별 포인트 적립/사용 내역 추적 및 등급화 시스템
- **📅 이벤트 및 QR 출석 체계:** 이벤트 생성 및 QR 코드 스캐너를 활용한 현장 출석/이벤트 참여
- **🎁 물품 대여 시스템:** 단체 공용 물품(장비 등) 대여 가능 여부 확인 및 반납 관리 (사진 업로드 지원)
- **👥 관리자 대시보드 (Admin):** 회원 권한, 이벤트 일정, 대여 항목 및 전반적인 포인트를 한 번에 관리할 수 있는 전용 페이지

---

## 🛠 사용된 기술 스택 (Tech Stack)

안정적인 서비스 운영과 뛰어난 퍼포먼스를 위해 최신 모던 웹 기술들로 개발되었습니다.

- **Framework:** Next.js 15 (App Router 기반)
- **Language:** TypeScript
- **Database & Backend:** PostgreSQL, Supabase
- **ORM:** Prisma
- **Authentication:** Supabase Auth + 카카오 OAuth 연동
- **Storage:** Supabase Storage (이미지 및 파일 업로드)
- **Styling:** Tailwind CSS, Framer Motion (애니메이션)
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** Zustand

---

## 🚀 로컬 실행 방법 (Quick Start)

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase, Kakao 등의 접속 키값을 입력해주세요.

# 3. Prisma 클라이언트 생성 & DB 스키마 푸시
npx prisma generate
npx prisma db push

# 4. 로컬 개발 서버 실행
npm run dev
```

---

## 📞 수정 요청 및 문의 (Contact & Feedback)

시스템을 직접 개발하고 유지보수하고 있습니다. 
사용하시면서 **"이런 기능이 더 있었으면 좋겠어요!"** 하는 아이디어나 **"여기 오류가 발생했어요!"** 하는 문제점이 있다면 언제든지 편하게 연락해주세요.

- **이슈 등록 (버그/기능 요청):** [GitHub Issues](https://github.com/jaehoya/Spacepointsystem/issues) 에 남겨주시면 가장 정확하게 확인이 가능합니다.
- **이메일:** [devbabho@gmail.com]

감사합니다!

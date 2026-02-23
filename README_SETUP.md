# Buddy Point System

Next.js + Supabase + Prisma + TailwindCSS로 구성된 포인트 관리 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Styling**: TailwindCSS
- **UI Components**: Radix UI, shadcn/ui

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
# 또는
yarn install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 값을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database (Supabase PostgreSQL)
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Prisma 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma db push

# Prisma Studio 실행 (선택사항)
npx prisma studio
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   ├── login/             # 로그인 페이지
│   ├── signup/            # 회원가입 페이지
│   ├── home/              # 메인 홈
│   ├── events/            # 이벤트 페이지
│   ├── qr/                # QR 페이지
│   ├── mypage/            # 마이페이지
│   ├── settings/          # 설정 페이지
│   └── admin/             # 관리자 페이지
├── src/
│   ├── components/        # 기존 컴포넌트 (src/app에서 이동)
│   │   ├── components/    # UI 컴포넌트
│   │   ├── context/       # React Context
│   │   └── pages/         # 페이지 컴포넌트
│   ├── lib/               # 유틸리티 라이브러리
│   │   ├── prisma.ts      # Prisma 클라이언트
│   │   └── supabase/      # Supabase 클라이언트
│   └── styles/            # 스타일
├── prisma/
│   └── schema.prisma      # Prisma 스키마
├── middleware.ts          # Next.js 미들웨어
└── next.config.ts         # Next.js 설정
```

## Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 가져오기:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Database Connection String → `DATABASE_URL`
3. `.env.local` 파일에 값 입력

## 배포

### Vercel

가장 쉬운 방법은 [Vercel](https://vercel.com)을 사용하는 것입니다.

환경변수를 Vercel 프로젝트 설정에 추가하고 배포하세요.

## 라이선스

MIT

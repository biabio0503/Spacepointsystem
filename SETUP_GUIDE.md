# 설치 및 실행 가이드

## 1. 의존성 설치

```bash
npm install
```

## 2. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 복사:
   - Settings > API > Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Settings > API > anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Settings > Database > Connection String (Transaction pooler) → `DATABASE_URL`
   - Settings > Database > Connection String (Session pooler) → `DIRECT_URL`

## 3. 환경변수 설정

`.env.local` 파일을 열고 Supabase 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Prisma 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 푸시 (마이그레이션)
npx prisma db push
```

## 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 주의사항

- 기존 Vite 관련 파일들(`index.html`, `src/main.tsx`, `vite.config.ts`)은 참조용으로 남겨두었습니다.
- Next.js는 `app/` 디렉토리를 사용하며, 기존 컴포넌트들은 `src/components/`로 이동되었습니다.
- 모든 페이지는 Next.js App Router를 사용합니다.

## 선택사항: Prisma Studio 실행

데이터베이스를 GUI로 확인하려면:

```bash
npx prisma studio
```

http://localhost:5555 에서 Prisma Studio가 열립니다.

# 카카오 로그인 설정 가이드

## 개요

SPACE 포인트 시스템에 카카오 OAuth 로그인이 추가되었습니다. 사용자는 학번 로그인 외에도 카카오 계정으로 간편하게 로그인할 수 있습니다.

## 기능

- 카카오 계정으로 간편 로그인
- 최초 로그인 시 학번 연동
- 기존 사용자는 자동 로그인
- 학번 로그인과 병행 사용 가능

## 설정 방법

### 1. 카카오 개발자 계정 설정

1. [Kakao Developers](https://developers.kakao.com) 접속
2. 로그인 후 "내 애플리케이션" 메뉴로 이동
3. "애플리케이션 추가하기" 클릭

### 2. 애플리케이션 설정

#### 2.1 플랫폼 설정

1. 앱 설정 > 플랫폼 > Web 플랫폼 등록
2. 사이트 도메인 입력:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션: `https://your-domain.com`

#### 2.2 카카오 로그인 활성화

1. 제품 설정 > 카카오 로그인 메뉴로 이동
2. 카카오 로그인 활성화 ON
3. OpenID Connect 활성화 (선택사항)

#### 2.3 Redirect URI 등록

1. 제품 설정 > 카카오 로그인 > Redirect URI 등록
2. 다음 URI를 등록:
   ```
   http://localhost:3000/api/auth/kakao/callback
   ```
3. 프로덕션 환경의 경우:
   ```
   https://your-domain.com/api/auth/kakao/callback
   ```

#### 2.4 동의 항목 설정 (선택사항)

1. 제품 설정 > 카카오 로그인 > 동의 항목
2. 필요한 항목:
   - 닉네임: 필수 동의
   - 프로필 사진: 선택 동의

### 3. API 키 확인

1. 앱 설정 > 앱 키 메뉴로 이동
2. **REST API 키**를 복사

### 4. 환경변수 설정

`.env.local` 파일에 다음 내용 추가:

```env
# Kakao OAuth
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_rest_api_key_here
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
```

**주의**: 프로덕션 환경에서는 도메인을 변경해야 합니다:

```env
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://your-domain.com/api/auth/kakao/callback
```

### 5. 데이터베이스 마이그레이션

Prisma schema에 `kakaoId` 필드가 추가되었으므로 데이터베이스를 업데이트합니다:

```bash
npx prisma db push
```

## 사용 흐름

### 신규 사용자

1. 로그인 페이지에서 "카카오로 시작하기" 클릭
2. 카카오 인증 페이지로 리다이렉트
3. 카카오 로그인 및 동의
4. 학번 연동 페이지로 이동
5. 학번, 이름, 학과, 전화번호 입력
6. 회원가입 완료 후 자동 로그인

### 기존 사용자

1. 로그인 페이지에서 "카카오로 시작하기" 클릭
2. 카카오 인증 페이지로 리다이렉트
3. 카카오 로그인 및 동의
4. 자동으로 메인 페이지로 이동

## 트러블슈팅

### "Redirect URI mismatch" 오류

- 카카오 개발자 콘솔에서 설정한 Redirect URI와 환경변수의 URI가 일치하는지 확인
- 프로토콜(http/https), 도메인, 포트, 경로가 모두 정확히 일치해야 함

### "Invalid client" 오류

- REST API 키가 올바르게 설정되었는지 확인
- 환경변수 파일(.env.local)이 프로젝트 루트에 있는지 확인
- 서버를 재시작하여 환경변수가 로드되도록 함

### 로그인 후 학번 연동이 되지 않음

- 데이터베이스 스키마가 최신인지 확인: `npx prisma db push`
- Prisma Client 재생성: `npx prisma generate`

### 카카오 로그인 버튼이 작동하지 않음

- 브라우저 콘솔에서 에러 메시지 확인
- 환경변수가 제대로 로드되었는지 확인
- Next.js 개발 서버 재시작

## 보안 고려사항

1. **환경변수 보호**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요
3. **키 관리**: REST API 키는 안전하게 보관하고 공개하지 마세요
4. **Redirect URI 검증**: 카카오 개발자 콘솔에서 허용된 URI만 등록하세요

## 참고 자료

- [Kakao Developers - 카카오 로그인](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Next.js 환경변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Prisma 마이그레이션](https://www.prisma.io/docs/concepts/components/prisma-migrate)

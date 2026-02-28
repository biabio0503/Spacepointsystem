# Supabase 전화번호 인증 가이드

## 현재 상태

현재 시스템은 **가짜 이메일 방식**을 사용합니다:

- 학번을 `studentId@student.local` 형식의 이메일로 변환
- 전화번호는 DB에만 저장되고 인증에는 사용되지 않음
- 장점: 무료, 구현 간단
- 단점: 실제 이메일/SMS 인증 없음

## 옵션 1: Supabase Phone Auth 사용 (권장)

Supabase는 SMS OTP를 통한 전화번호 인증을 지원합니다.

### 장점

- ✅ 실제 전화번호 인증 (보안 강화)
- ✅ SMS OTP로 본인 확인
- ✅ 비밀번호 없이 로그인 가능
- ✅ 전화번호 중복 방지 자동 처리

### 단점

- ❌ SMS 발송 비용 발생 (Twilio 등 사용)
- ❌ SMS 제공자 설정 필요
- ❌ 해외 전화번호는 추가 설정 필요

### 비용 (Twilio 기준)

- SMS 발송: 한국 기준 약 $0.05~0.10/건 (약 60~130원/건)
- 월 100명 가입 시: 약 6,000~13,000원

---

## 설정 방법: Phone Auth 활성화

### 1. Supabase 대시보드 설정

1. **Supabase 프로젝트** 접속
2. **Authentication > Providers** 메뉴
3. **Phone** 찾아서 활성화
4. **Enable Phone provider** 토글 ON

### 2. SMS 제공자 설정

Supabase는 여러 SMS 제공자를 지원합니다:

#### 옵션 A: Twilio (가장 일반적)

1. [Twilio](https://www.twilio.com) 가입
2. Twilio Console에서:
   - Account SID 복사
   - Auth Token 복사
   - 전화번호 구매 (한국 번호 지원)
3. Supabase > Authentication > Settings > Phone Auth
   - Provider: Twilio
   - Account SID: 입력
   - Auth Token: 입력
   - Twilio 전화번호: 입력

#### 옵션 B: MessageBird

1. [MessageBird](https://www.messagebird.com) 가입
2. API Key 발급
3. Supabase 설정에 입력

#### 옵션 C: Vonage (Nexmo)

1. [Vonage](https://www.vonage.com) 가입
2. API credentials 발급
3. Supabase 설정에 입력

---

## 코드 변경: Phone Auth 구현

### 1. 환경변수 추가

`.env.local`에 추가:

```env
# 전화번호 인증 사용 여부
NEXT_PUBLIC_USE_PHONE_AUTH=true
```

### 2. 회원가입 API 수정

`app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);
    const {
      studentId,
      name,
      department,
      phone,
      password,
      referralCode,
      kakaoId,
    } = validatedData;

    // 전화번호 중복 체크
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 전화번호입니다." },
        { status: 409 },
      );
    }

    const supabase = await createClient();

    // 전화번호로 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: phone, // +821012345678 형식
      password: password || studentId,
      options: {
        data: {
          student_id: studentId,
          name,
          department,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // SMS OTP가 발송됨
    // 이 시점에서는 아직 confirmed=false 상태

    // DB에 사용자 정보 저장 (OTP 확인 후 활성화)
    const user = await prisma.user.create({
      data: {
        id: authData.user!.id,
        studentId,
        name,
        department,
        phone,
        referralCode: referralCode || null,
        kakaoId: kakaoId || null,
        points: 0,
      },
    });

    return NextResponse.json({
      message: "SMS 인증 코드가 발송되었습니다. 코드를 입력해주세요.",
      user: {
        id: user.id,
        phone: user.phone,
        needsVerification: true,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
```

### 3. OTP 확인 API 추가

`app/api/auth/verify-otp/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { phone, token } = await request.json();

    if (!phone || !token) {
      return NextResponse.json(
        { error: "전화번호와 인증 코드를 입력해주세요." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // OTP 확인
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      return NextResponse.json(
        { error: "인증 코드가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "인증이 완료되었습니다.",
      session: data.session,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "인증 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
```

### 4. 로그인 API 수정

`app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// 옵션 1: 전화번호 + OTP 로그인
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    const supabase = await createClient();

    // 비밀번호 로그인
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        phone,
        password,
      });

    if (authError) {
      return NextResponse.json(
        { error: "전화번호 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    // DB에서 사용자 정보 조회
    const user = await prisma.user.findFirst({
      where: { phone },
      include: {
        pointHistory: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "로그인 성공",
      user: {
        id: user.id,
        studentId: user.studentId,
        name: user.name,
        department: user.department,
        phone: user.phone,
        points: user.points,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
```

### 5. 프론트엔드: SignUpPage 수정

OTP 입력 단계 추가:

```tsx
"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/navigation";

export default function SignUpPage() {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState("");

  const handleSignup = async (formData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: `+82${formData.phone.replace(/^0/, "")}`, // 010 -> +8210
        }),
      });

      const data = await response.json();

      if (data.needsVerification) {
        setPhone(formData.phone);
        setUserId(data.user.id);
        setStep("otp");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+82${phone.replace(/^0/, "")}`,
          token: otpCode,
        }),
      });

      if (response.ok) {
        setStep("success");
        // 로그인 처리 또는 홈으로 이동
      }
    } catch (error) {
      console.error("OTP verification error:", error);
    }
  };

  if (step === "otp") {
    return (
      <div>
        <h2>SMS 인증</h2>
        <p>{phone}로 전송된 6자리 코드를 입력하세요</p>
        <input
          type="text"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="000000"
        />
        <button onClick={handleVerifyOTP}>확인</button>
      </div>
    );
  }

  // ... 기존 회원가입 폼
}
```

---

## 전화번호 형식

### 한국 전화번호

Supabase는 국제 형식(E.164)을 사용합니다:

```javascript
// 사용자 입력: 010-1234-5678 또는 01012345678
// 변환: +821012345678

function formatPhoneForSupabase(phone) {
  // 하이픈 제거
  const cleaned = phone.replace(/\D/g, "");

  // 010으로 시작하면 +8210으로 변환
  if (cleaned.startsWith("010")) {
    return "+82" + cleaned.substring(1);
  }

  return "+82" + cleaned;
}
```

---

## 옵션 2: 현재 방식 유지 (추천 - 무료)

SMS 비용이 부담되거나 초기 개발 단계라면 현재 방식을 유지하는 것도 좋습니다:

### 개선 방안

1. **전화번호를 unique로 설정**

   ```prisma
   model User {
     phone        String         @unique
     // ...
   }
   ```

2. **전화번호로 중복 가입 방지**

   ```typescript
   // 회원가입 시
   const existing = await prisma.user.findUnique({
     where: { phone },
   });
   ```

3. **나중에 Phone Auth로 마이그레이션** 가능
   - 추가 비용 없음
   - 데이터 구조는 동일하게 유지
   - 필요시 인증 방식만 변경

---

## 권장사항

### 개발/테스트 단계

- ✅ **현재 방식 유지** (가짜 이메일)
- 비용 없음
- 빠른 개발 가능

### 프로덕션 배포 시

- ✅ **Phone Auth 도입**
- 보안 강화
- 실제 사용자 인증
- 비용은 월 1만원 내외 (사용량에 따라)

### 하이브리드 방식

```typescript
const USE_PHONE_AUTH = process.env.NEXT_PUBLIC_USE_PHONE_AUTH === "true";

if (USE_PHONE_AUTH) {
  // Phone Auth 사용
  await supabase.auth.signUp({ phone, password });
} else {
  // 가짜 이메일 사용 (개발용)
  await supabase.auth.signUp({
    email: `${studentId}@student.local`,
    password,
  });
}
```

---

## 참고 자료

- [Supabase Phone Auth 공식 문서](https://supabase.com/docs/guides/auth/phone-login)
- [Twilio 가격](https://www.twilio.com/pricing)
- [MessageBird 가격](https://www.messagebird.com/pricing)

---

## 결론

**지금 바로 변경이 필요하지 않다면:**

- 현재 방식 유지 (무료)
- 전화번호를 unique로만 설정
- 나중에 필요시 Phone Auth로 전환

**실제 서비스 론칭 시:**

- Supabase Phone Auth 도입
- Twilio 계정 생성 (무료 크레딧 제공)
- SMS OTP 인증 구현

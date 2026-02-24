# API 연동 가이드

## 개요

이 문서는 프론트엔드 페이지를 백엔드 API와 연동하는 방법을 안내합니다.

## ✅ 완료된 작업

### 1. API 라우트 (Backend)

- ✅ `/api/auth/*` - 인증 (로그인, 회원가입, 로그아웃)
- ✅ `/api/events/*` - 이벤트 CRUD
- ✅ `/api/rental-items/*` - 대여 물품 CRUD
- ✅ `/api/rentals/*` - 대여 기록 관리
- ✅ `/api/users/*` - 사용자 관리
- ✅ `/api/upload/image` - 이미지 업로드

### 2. 유틸리티 & 서비스

- ✅ `src/lib/auth.ts` - 인증 서비스
- ✅ `src/lib/api.ts` - API 호출 유틸리티
- ✅ `src/lib/supabase/*` - Supabase 클라이언트

### 3. 페이지 연동 상태

- ✅ LoginPage - authService 사용
- ✅ SignUpPage - API 직접 호출
- ⚠️ **나머지 페이지들은 아직 AppContext(로컬 메모리) 사용 중**

## 🔄 연동 패턴

### 기존 코드 (AppContext 사용)

```tsx
import { useApp } from "../context/AppContext";

export default function MyPage() {
  const { events, addEvent, deleteEvent } = useApp();
  // ...
}
```

### 변경 후 (API 사용)

```tsx
import { useState, useEffect } from "react";
import { eventsAPI } from "@/lib/api";

export default function MyPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data.events);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (eventData) => {
    try {
      await eventsAPI.create(eventData);
      await loadEvents(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      await loadEvents(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  if (loading) return <div>로딩중...</div>;

  // ...
}
```

## 📋 페이지별 연동 체크리스트

### 사용자 페이지

#### HomePage (`src/components/pages/HomePage.tsx`)

- [ ] `useApp`를 제거하고 `useState`, `useEffect` 사용
- [ ] `authService.getCurrentUser()`로 현재 사용자 정보 가져오기
- [ ] `eventsAPI.getAll()`로 이벤트 목록 가져오기
- [ ] `usersAPI.getAll()`로 사용자 통계 가져오기

#### EventsPage (`src/components/pages/EventsPage.tsx`)

- [ ] `eventsAPI.getAll()`로 이벤트 목록 가져오기
- [ ] 이벤트 상세 보기 구현

#### MyPage (`src/components/pages/MyPage.tsx`)

- [ ] `authService.getCurrentUser()`로 현재 사용자 정보
- [ ] 포인트 내역 API 추가 필요 (현재 미구현)

#### RentalPage (`src/components/pages/RentalPage.tsx`)

- [ ] `rentalItemsAPI.getAll()`로 대여 물품 목록
- [ ] `rentalsAPI.create()`로 대여 신청

#### SettingsPage (`src/components/pages/SettingsPage.tsx`)

- [ ] `authService.logout()`로 로그아웃
- [ ] `usersAPI.update()`로 사용자 정보 수정

### 관리자 페이지

#### AdminEventsPage

```tsx
// 예시: src/components/pages/admin/AdminEventsPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { eventsAPI } from '@/lib/api';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { events } = await eventsAPI.getAll();
      setEvents(events);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await eventsAPI.delete(id);
      await loadEvents(); // 목록 새로고침
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  };

  const handleToggleActive = async (event) => {
    try {
      await eventsAPI.update(event.id, {
        isActive: !event.isActive
      });
      await loadEvents();
    } catch (err) {
      alert('수정 실패: ' + err.message);
    }
  };

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    // ... (기존 JSX, events 배열 사용)
  );
}
```

#### AdminEventFormPage (이미지 업로드 포함)

```tsx
"use client";

import { useState } from "react";
import { uploadAPI, eventsAPI } from "@/lib/api";
import { useNavigate } from "@/lib/navigation";

export default function AdminEventFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    content: "",
    location: "",
    date: "",
    points: 0,
    // ... 기타 필드
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;

      // 이미지가 있으면 먼저 업로드
      if (imageFile) {
        const uploadResult = await uploadAPI.uploadImage(
          imageFile,
          "event-images",
        );
        imageUrl = uploadResult.url;
      }

      // 이벤트 생성
      const eventData = {
        ...form,
        imageUrl,
        postDate: new Date().toISOString(),
        postEndDate: new Date(form.date).toISOString(), // 예시
      };

      await eventsAPI.create(eventData);
      alert("이벤트가 등록되었습니다.");
      navigate("/admin/events");
    } catch (error) {
      alert("등록 실패: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 기존 폼 필드들 */}

      {/* 이미지 업로드 */}
      <div>
        <label>이벤트 이미지</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imageFile && (
          <img
            src={URL.createObjectURL(imageFile)}
            alt="미리보기"
            style={{ width: 200, height: 200, objectFit: "cover" }}
          />
        )}
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? "업로드 중..." : "등록하기"}
      </button>
    </form>
  );
}
```

#### AdminMembersPage

- [ ] `usersAPI.getAll()`로 회원 목록
- [ ] `usersAPI.addPoints()`로 포인트 지급

#### AdminRentalItemsPage

- [ ] `rentalItemsAPI` 사용

#### AdminRentalsPage

- [ ] `rentalsAPI.getAll()`로 대여 목록
- [ ] `rentalsAPI.return()`으로 반납 처리

## 🎨 이미지 업로드 사용법

### Supabase Storage 버킷 설정

먼저 [SUPABASE_STORAGE_GUIDE.md](SUPABASE_STORAGE_GUIDE.md)를 참고하여 버킷을 설정하세요.

### 이미지 업로드 예시

```tsx
import { uploadAPI } from "@/lib/api";

// 파일 선택 핸들러
const handleFileChange = (e) => {
  setImageFile(e.target.files[0]);
};

// 업로드 실행
const handleUpload = async () => {
  if (!imageFile) return;

  try {
    const result = await uploadAPI.uploadImage(
      imageFile,
      "event-images", // 또는 'rental-item-images'
    );

    console.log("업로드된 URL:", result.url);
    // 이 URL을 이벤트나 물품 데이터에 저장
  } catch (error) {
    console.error("업로드 실패:", error);
  }
};
```

### 이미지 삭제 예시

```tsx
// 이미지 URL에서 파일명 추출
const fileName = imageUrl.split("/").pop();

// 삭제
await uploadAPI.deleteImage(fileName, "event-images");
```

## 🔐 인증 상태 처리

### 로그인 체크

```tsx
import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import { useNavigate } from '@/lib/navigation';

export default function ProtectedPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    // ... 페이지 내용
  );
}
```

### 관리자 페이지 보호

```tsx
useEffect(() => {
  const checkAdmin = async () => {
    const currentUser = await authService.getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
  };

  checkAdmin();
}, []);
```

## 📦 작업 순서 권장사항

1. **인증 먼저** ✅
   - LoginPage, SignUpPage (완료)

2. **간단한 페이지부터**
   - EventsPage (읽기 전용, 가장 간단)
   - MyPage (현재 사용자 정보만)

3. **CRUD 페이지**
   - AdminEventsPage
   - AdminRentalItemsPage

4. **복잡한 로직**
   - HomePage (통계 계산)
   - AdminMembersPage (포인트 관리)

5. **대여 시스템**
   - RentalPage
   - AdminRentalsPage

## 🐛 디버깅 팁

### API 호출 에러

```tsx
try {
  const data = await eventsAPI.getAll();
} catch (error) {
  console.error("API Error:", error);
  // error.message에 서버에서 반환한 에러 메시지가 있음
}
```

### 네트워크 요청 확인

- 브라우저 개발자 도구 > Network 탭
- API 요청/응답 확인

### 인증 에러

- API가 401을 반환하면 로그인 필요
- Supabase가 제대로 초기화되었는지 확인

## 📚 참고 파일

- `src/lib/api.ts` - API 호출 함수들
- `src/lib/auth.ts` - 인증 서비스
- `app/api/**/*.ts` - 백엔드 API 라우트
- [SUPABASE_STORAGE_GUIDE.md](SUPABASE_STORAGE_GUIDE.md) - 이미지 업로드 설정

## ⚡ 빠른 시작

1. Supabase Storage 버킷 설정 완료
2. `src/components/pages/admin/AdminEventsPage.tsx` 위의 예시 코드로 교체
3. 이벤트 목록이 제대로 로드되는지 확인
4. 같은 패턴을 다른 페이지에 적용

## 🎯 다음 단계

수동 작업이 필요하므로, 각 페이지를 하나씩 수정하면서:

1. `useApp` import 제거
2. `useState`, `useEffect` 추가
3. API 호출 함수로 데이터 로드
4. 로딩/에러 상태 처리 추가
5. 테스트

모든 페이지가 연동되면 `AppContext`는 삭제하거나 deprecated 처리할 수 있습니다.

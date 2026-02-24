# Supabase Storage 설정 가이드

## 개요

이벤트 이미지 및 대여 물품 이미지를 저장하기 위한 Supabase Storage 버킷 설정 가이드입니다.

## 1. Supabase Storage 버킷 생성

### 1.1 Supabase 대시보드 접속

1. [Supabase](https://supabase.com) 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭

### 1.2 버킷 생성

#### 이벤트 이미지 버킷

1. "Create a new bucket" 클릭
2. 설정:
   - **Name**: `event-images`
   - **Public bucket**: ✅ 체크 (공개 접근 허용)
   - **Allowed MIME types**: `image/*` (모든 이미지 타입)
   - **File size limit**: 5MB

#### 대여 물품 이미지 버킷

1. "Create a new bucket" 클릭
2. 설정:
   - **Name**: `rental-item-images`
   - **Public bucket**: ✅ 체크 (공개 접근 허용)
   - **Allowed MIME types**: `image/*`
   - **File size limit**: 5MB

## 2. 버킷 정책 설정

### 2.1 공개 읽기 권한 설정

각 버킷에 대해 다음 정책을 추가합니다:

1. Storage > 버킷 선택 > **Policies** 탭
2. "New Policy" 클릭
3. "For full customization" 선택

#### 읽기 정책 (모두 허용)

```sql
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'event-images' );
```

```sql
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'rental-item-images' );
```

#### 업로드 정책 (인증된 사용자만)

```sql
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);
```

```sql
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'rental-item-images'
  AND auth.role() = 'authenticated'
);
```

#### 삭제 정책 (인증된 사용자만)

```sql
create policy "Authenticated users can delete"
on storage.objects for delete
using (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);
```

```sql
create policy "Authenticated users can delete"
on storage.objects for delete
using (
  bucket_id = 'rental-item-images'
  AND auth.role() = 'authenticated'
);
```

## 3. 빠른 설정 (SQL Editor 사용)

또는 SQL Editor에서 한 번에 설정할 수 있습니다:

```sql
-- event-images 버킷 정책
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true);

create policy "Public Access - event-images"
on storage.objects for select
using ( bucket_id = 'event-images' );

create policy "Authenticated Upload - event-images"
on storage.objects for insert
with check (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

create policy "Authenticated Delete - event-images"
on storage.objects for delete
using (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- rental-item-images 버킷 정책
insert into storage.buckets (id, name, public)
values ('rental-item-images', 'rental-item-images', true);

create policy "Public Access - rental-item-images"
on storage.objects for select
using ( bucket_id = 'rental-item-images' );

create policy "Authenticated Upload - rental-item-images"
on storage.objects for insert
with check (
  bucket_id = 'rental-item-images'
  AND auth.role() = 'authenticated'
);

create policy "Authenticated Delete - rental-item-images"
on storage.objects for delete
using (
  bucket_id = 'rental-item-images'
  AND auth.role() = 'authenticated'
);
```

## 4. 확인

### 4.1 버킷 URL 확인

Storage > 버킷 선택 > Settings에서 **Bucket URL**을 확인합니다:

```
https://[project-id].supabase.co/storage/v1/object/public/event-images/
https://[project-id].supabase.co/storage/v1/object/public/rental-item-images/
```

### 4.2 테스트 업로드

1. Storage > 버킷 선택
2. "Upload file" 클릭
3. 테스트 이미지 업로드
4. 업로드된 이미지의 URL 복사
5. 브라우저에서 URL 접속하여 이미지가 보이는지 확인

## 5. 환경변수 설정

이미 설정된 Supabase URL과 키를 사용하므로 추가 환경변수는 필요 없습니다.

`.env.local`에 기존 설정이 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. 파일 명명 규칙

### 이벤트 이미지

```
event-images/{eventId}_{timestamp}.{ext}
예: event-images/abc123_1709012345678.jpg
```

### 대여 물품 이미지

```
rental-item-images/{itemId}_{timestamp}.{ext}
예: rental-item-images/xyz789_1709012345999.png
```

## 7. 트러블슈팅

### "Access denied" 오류

- 버킷 정책이 올바르게 설정되었는지 확인
- 버킷이 public으로 설정되었는지 확인

### 이미지가 로드되지 않음

- 버킷 URL이 올바른지 확인
- 파일이 실제로 업로드되었는지 Supabase 대시보드에서 확인
- 브라우저 콘솔에서 CORS 에러가 있는지 확인

### 파일 크기 제한 초과

- Supabase 무료 플랜: 파일당 50MB, 총 1GB
- 파일 크기를 줄이거나 플랜 업그레이드 고려

## 참고 자료

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
   try {
      const supabase = await createClient();

      // 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
         return NextResponse.json(
            { error: '인증이 필요합니다.' },
            { status: 401 }
         );
      }

      const formData = await request.formData();
      const file = formData.get('file') as File;
      const bucketName = formData.get('bucket') as string || 'event-images'; // 기본값: event-images

      if (!file) {
         return NextResponse.json(
            { error: '파일이 제공되지 않았습니다.' },
            { status: 400 }
         );
      }

      // 파일 타입 검증
      if (!ALLOWED_TYPES.includes(file.type)) {
         return NextResponse.json(
            { error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 가능)' },
            { status: 400 }
         );
      }

      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
         return NextResponse.json(
            { error: '파일 크기는 5MB를 초과할 수 없습니다.' },
            { status: 400 }
         );
      }

      // 버킷 이름 검증
      const validBuckets = ['event-images', 'rental-item-images'];
      if (!validBuckets.includes(bucketName)) {
         return NextResponse.json(
            { error: '잘못된 버킷 이름입니다.' },
            { status: 400 }
         );
      }

      // 파일명 생성 (타임스탬프 + 랜덤 문자열)
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomStr}.${fileExt}`;

      // 파일을 ArrayBuffer로 변환
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
         .from(bucketName)
         .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
         });

      if (error) {
         console.error('Upload error:', error);
         return NextResponse.json(
            { error: `업로드 실패: ${error.message}` },
            { status: 500 }
         );
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
         .from(bucketName)
         .getPublicUrl(fileName);

      return NextResponse.json({
         message: '파일이 성공적으로 업로드되었습니다.',
         url: publicUrl,
         fileName: fileName,
         bucket: bucketName,
      });

   } catch (error) {
      console.error('Image upload error:', error);
      return NextResponse.json(
         { error: '이미지 업로드 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

// 이미지 삭제
export async function DELETE(request: NextRequest) {
   try {
      const supabase = await createClient();

      // 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
         return NextResponse.json(
            { error: '인증이 필요합니다.' },
            { status: 401 }
         );
      }

      const { searchParams } = new URL(request.url);
      const fileName = searchParams.get('fileName');
      const bucketName = searchParams.get('bucket') || 'event-images';

      if (!fileName) {
         return NextResponse.json(
            { error: '파일명이 제공되지 않았습니다.' },
            { status: 400 }
         );
      }

      // Supabase Storage에서 삭제
      const { error } = await supabase.storage
         .from(bucketName)
         .remove([fileName]);

      if (error) {
         console.error('Delete error:', error);
         return NextResponse.json(
            { error: `삭제 실패: ${error.message}` },
            { status: 500 }
         );
      }

      return NextResponse.json({
         message: '파일이 성공적으로 삭제되었습니다.',
      });

   } catch (error) {
      console.error('Image delete error:', error);
      return NextResponse.json(
         { error: '이미지 삭제 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

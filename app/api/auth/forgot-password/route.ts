import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';
import { forgotPasswordSchema } from '@/lib/validations';
import { z } from 'zod';

const NO_MATCH_MESSAGE = '입력한 정보와 일치하는 계정을 찾을 수 없습니다.';

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const validatedData = forgotPasswordSchema.parse(body);
      const { studentId, name, phone, password } = validatedData;

      const user = await prisma.user.findFirst({
         where: {
            studentId,
            name,
            phone,
         },
      });

      if (!user) {
         return NextResponse.json(
            { error: NO_MATCH_MESSAGE },
            { status: 400 }
         );
      }

      const passwordHash = await hashPassword(password);

      await prisma.user.update({
         where: { id: user.id },
         data: { passwordHash },
      });

      return NextResponse.json({ message: '비밀번호가 재설정되었습니다.' });
   } catch (error) {
      console.error('Forgot password error:', error);

      if (error instanceof z.ZodError) {
         return NextResponse.json(
            { error: error.issues[0].message },
            { status: 400 }
         );
      }

      return NextResponse.json(
         { error: '비밀번호 재설정 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

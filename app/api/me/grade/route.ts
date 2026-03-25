import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

type Grade = '별' | '행성' | '로켓' | 'UFO';

// 등급 계산 로직
function calculateGrade(myPoints: number, higherCount: number, totalEligible: number): Grade {
   if (myPoints < 10) return '별';
   if (totalEligible === 0) return '행성';

   const percentile = (higherCount / totalEligible) * 100;

   if (percentile < 20) return 'UFO';
   if (percentile < 60) return '로켓';
   return '행성';
}

// GET /api/me/grade - 현재 사용자의 등급 정보 조회
export async function GET() {
   try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
         return NextResponse.json(
            { error: '인증되지 않은 사용자입니다.' },
            { status: 401 }
         );
      }

      // 10점 이상인 유저 수 조회 (관리자 제외)
      const totalEligible = await prisma.user.count({
         where: {
            points: { gte: 10 },
            isAdmin: false,
         },
      });

      // 나보다 포인트가 높은 유저 수 조회 (관리자 제외)
      const higherCount = await prisma.user.count({
         where: {
            points: { gt: currentUser.points },
            isAdmin: false,
         },
      });

      // 등급 계산
      const grade = calculateGrade(currentUser.points, higherCount, totalEligible);

      // 랭킹 정보 계산
      const myRank = currentUser.points >= 10 ? higherCount + 1 : null;
      const topPercent = myRank && totalEligible
         ? Math.round((myRank / totalEligible) * 100)
         : null;

      // 다음 등급 정보 계산
      let nextGradeInfo = null;

      if (grade === '별') {
         nextGradeInfo = {
            next: '행성',
            need: 10 - currentUser.points,
         };
      } else if (grade !== 'UFO' && totalEligible) {
         if (grade === '로켓') {
            // UFO가 되려면 상위 20%에 진입해야 함
            const top20Index = Math.floor(totalEligible * 0.2);
            const topUsers = await prisma.user.findMany({
               where: {
                  points: { gte: 10 },
                  isAdmin: false,
               },
               orderBy: { points: 'desc' },
               skip: top20Index,
               take: 1,
               select: { points: true },
            });

            const targetPoints = topUsers[0]?.points ?? currentUser.points;
            nextGradeInfo = {
               next: 'UFO',
               need: Math.max(0, targetPoints - currentUser.points + 1),
            };
         } else {
            // 행성 -> 로켓 (상위 60%에 진입)
            const top60Index = Math.max(0, Math.floor(totalEligible * 0.6) - 1);
            const targetUsers = await prisma.user.findMany({
               where: {
                  points: { gte: 10 },
                  isAdmin: false,
               },
               orderBy: { points: 'desc' },
               skip: top60Index,
               take: 1,
               select: { points: true },
            });

            const targetPoints = targetUsers[0]?.points ?? currentUser.points;
            nextGradeInfo = {
               next: '로켓',
               need: Math.max(0, targetPoints - currentUser.points + 1),
            };
         }
      }

      return NextResponse.json({
         grade,
         rank: myRank,
         totalEligible,
         topPercent,
         nextGrade: nextGradeInfo,
         points: currentUser.points,
      });
   } catch (error) {
      console.error('Get grade error:', error);
      return NextResponse.json(
         { error: '등급 정보 조회 중 오류가 발생했습니다.' },
         { status: 500 }
      );
   }
}

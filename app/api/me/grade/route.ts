import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

interface GradeConfig {
   id: string;
   name: string;
   type: 'ABSOLUTE_POINTS' | 'PERCENTILE';
   minPoints: number;
   maxPoints: number | null;
   percentileMin: number | null;
   percentileMax: number | null;
   orderIndex: number;
}

// 등급 계산 로직 (데이터베이스 기반)
function calculateGrade(
   myPoints: number,
   gradeConfigs: GradeConfig[],
   percentile: number | null
): string {
   if (gradeConfigs.length === 0) {
      // 등급 설정이 없으면 기본값
      return '기본';
   }

   const gradeType = gradeConfigs[0]?.type || 'ABSOLUTE_POINTS';

   if (gradeType === 'PERCENTILE' && percentile !== null) {
      // 퍼센타일 기반 등급 계산
      // orderIndex가 높은 것부터 확인 (높은 등급부터)
      const sortedConfigs = [...gradeConfigs].sort((a, b) => b.orderIndex - a.orderIndex);

      for (const config of sortedConfigs) {
         const meetsMin = config.percentileMin === null || percentile >= config.percentileMin;
         const meetsMax = config.percentileMax === null || percentile < config.percentileMax;

         if (meetsMin && meetsMax) {
            return config.name;
         }
      }
   } else {
      // 절대 포인트 기반 등급 계산
      const sortedConfigs = [...gradeConfigs].sort((a, b) => b.orderIndex - a.orderIndex);

      for (const config of sortedConfigs) {
         const meetsMin = myPoints >= config.minPoints;
         const meetsMax = config.maxPoints === null || myPoints <= config.maxPoints;

         if (meetsMin && meetsMax) {
            return config.name;
         }
      }
   }

   // 매칭되는 등급이 없으면 가장 낮은 등급 반환
   const lowestGrade = [...gradeConfigs].sort((a, b) => a.orderIndex - b.orderIndex)[0];
   return lowestGrade?.name || '기본';
}

// 다음 등급 계산
function calculateNextGrade(
   myPoints: number,
   currentGrade: string,
   gradeConfigs: GradeConfig[],
   percentile: number | null,
   totalEligible: number
): { next: string; need: number } | null {
   if (gradeConfigs.length === 0) return null;

   const gradeType = gradeConfigs[0]?.type || 'ABSOLUTE_POINTS';
   const sortedConfigs = [...gradeConfigs].sort((a, b) => a.orderIndex - b.orderIndex);

   // 현재 등급의 인덱스 찾기
   const currentIndex = sortedConfigs.findIndex(g => g.name === currentGrade);

   // 이미 최고 등급이면 null
   if (currentIndex === sortedConfigs.length - 1 || currentIndex === -1) {
      return null;
   }

   const nextGradeConfig = sortedConfigs[currentIndex + 1];

   if (gradeType === 'ABSOLUTE_POINTS') {
      // 절대 포인트 기반
      const pointsNeeded = nextGradeConfig.minPoints - myPoints;
      return {
         next: nextGradeConfig.name,
         need: Math.max(0, pointsNeeded),
      };
   } else {
      // 퍼센타일 기반 - 상위 몇%에 들어야 하는지 계산
      // percentileMax가 목표 (예: 상위 20%면 percentileMax가 20)
      const targetPercentile = nextGradeConfig.percentileMax ?? 100;

      // 대략적인 필요 포인트 계산은 어려우므로 간단히 표시
      if (percentile !== null && targetPercentile < percentile) {
         return {
            next: nextGradeConfig.name,
            need: Math.ceil((percentile - targetPercentile) * totalEligible / 100),
         };
      }
      return {
         next: nextGradeConfig.name,
         need: 1, // 최소 1점 더 필요
      };
   }
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

      // 등급 설정 조회
      const gradeConfigs = await prisma.gradeConfig.findMany({
         orderBy: { orderIndex: 'asc' },
      });

      // 전체 유저 수 조회 (관리자 제외)
      const totalEligible = await prisma.user.count({
         where: {
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

      // 퍼센타일 계산 (상위 몇%인지)
      const myRank = higherCount + 1;
      const percentile = totalEligible > 0
         ? (myRank / totalEligible) * 100
         : null;

      // 등급 계산
      const grade = calculateGrade(
         currentUser.points,
         gradeConfigs as GradeConfig[],
         percentile
      );

      // 다음 등급 정보 계산
      const nextGradeInfo = calculateNextGrade(
         currentUser.points,
         grade,
         gradeConfigs as GradeConfig[],
         percentile,
         totalEligible
      );

      const topPercent = percentile !== null ? Math.round(percentile) : null;

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

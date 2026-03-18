import prisma from '../lib/prisma';

async function main() {
   console.log('🌱 데이터베이스 시딩 시작...');

   // 1. 샘플 사용자 생성
   console.log('👥 샘플 사용자 생성 중...');

   const users = [
      {
         studentId: '2021123456',
         name: '김철수',
         department: '컴퓨터공학과',
         phone: '010-1234-5678',
         points: 45,
      },
      {
         studentId: '2022234567',
         name: '이영희',
         department: '기계공학과',
         phone: '010-2345-6789',
         points: 72,
      },
      {
         studentId: '2020345678',
         name: '박민수',
         department: '전자공학과',
         phone: '010-3456-7890',
         points: 28,
      },
      {
         studentId: '2023456789',
         name: '정수진',
         department: '산업디자인학과',
         phone: '010-4567-8901',
         points: 56,
      },
      {
         studentId: '2021567890',
         name: '최지훈',
         department: '건축학과',
         phone: '010-5678-9012',
         points: 89,
      },
   ];

   const createdUsers = [];
   for (const userData of users) {
      const user = await prisma.user.upsert({
         where: { studentId: userData.studentId },
         update: userData,
         create: userData,
      });
      createdUsers.push(user);
      console.log(`  ✅ ${user.name} (${user.studentId}) 생성됨`);
   }

   // 2. 샘플 이벤트 생성
   console.log('\n🎉 샘플 이벤트 생성 중...');

   // 기존 이벤트 확인
   const existingEventsCount = await prisma.event.count();
   if (existingEventsCount > 0) {
      console.log(`  ℹ️  이미 ${existingEventsCount}개의 이벤트가 존재합니다. 건너뜁니다.`);
   } else {
      const events = [
         {
            title: '신입생 환영회',
            location: '학생회관 대강당',
            date: new Date('2026-03-15'),
            content: '2026학년도 신입생을 환영하는 환영회입니다. 다양한 이벤트와 경품 추첨이 준비되어 있습니다!',
            instagramUrl: 'https://instagram.com/p/example1',
            points: 15,
            postDate: new Date('2026-03-01'),
            postEndDate: new Date('2026-03-14'),
            isActive: true,
         },
         {
            title: '봄 축제 2026',
            location: '운동장',
            date: new Date('2026-05-10'),
            endDate: new Date('2026-05-11'),
            content: '즐거운 봄 축제! 공연, 부스, 먹거리 등 다양한 즐길거리가 준비되어 있습니다.',
            instagramUrl: null,
            points: 25,
            postDate: new Date('2026-04-01'),
            postEndDate: new Date('2026-05-09'),
            isActive: true,
         },
         {
            title: '중간고사 응원 이벤트',
            location: '도서관 앞',
            date: new Date('2026-04-20'),
            content: '중간고사를 준비하는 학우분들을 응원합니다! 간식과 음료를 나눠드립니다.',
            instagramUrl: null,
            points: 10,
            postDate: new Date('2026-04-15'),
            postEndDate: new Date('2026-04-19'),
            isActive: true,
         },
         {
            title: '학과 대항 체육대회',
            location: '체육관',
            date: new Date('2026-06-05'),
            content: '학과별 친선 체육대회! 농구, 배구, 축구 등 다양한 종목으로 진행됩니다.',
            instagramUrl: null,
            points: 20,
            postDate: new Date('2026-05-15'),
            postEndDate: new Date('2026-06-04'),
            isActive: true,
         },
         {
            title: '졸업사진 촬영 지원',
            location: '캠퍼스 투어',
            date: new Date('2026-02-15'),
            content: '졸업생 여러분의 소중한 추억을 남겨드립니다. (종료된 이벤트)',
            instagramUrl: null,
            points: 15,
            postDate: new Date('2026-02-01'),
            postEndDate: new Date('2026-02-14'),
            isActive: false,
         },
      ];

      for (const eventData of events) {
         const event = await prisma.event.create({
            data: eventData,
         });
         console.log(`  ✅ ${event.title} 생성됨`);
      }
   }

   // 3. 샘플 대여 물품 생성
   console.log('\n📦 샘플 대여 물품 생성 중...');

   // 기존 대여물품 확인
   const existingItemsCount = await prisma.rentalItem.count();
   if (existingItemsCount > 0) {
      console.log(`  ℹ️  이미 ${existingItemsCount}개의 대여물품이 존재합니다. 건너뜁니다.`);
   } else {
      const rentalItems = [
         {
            name: 'L카트',
            category: '운반용품',
            emoji: '🛒',
            totalStock: 5,
            available: 5, // seed 시에는 초기값
            description: '물품 운반용 대형 카트',
            isActive: true,
         },
         {
            name: '담요',
            category: '생활용품',
            emoji: '🧣',
            totalStock: 20,
            available: 20,
            description: '야외활동용 담요',
            isActive: true,
         },
         {
            name: '돗자리',
            category: '야외용품',
            emoji: '🏕️',
            totalStock: 25,
            available: 25,
            description: '피크닉/야외활동용 돗자리',
            isActive: true,
         },
         {
            name: '우산',
            category: '생활용품',
            emoji: '☂️',
            totalStock: 30,
            available: 30,
            description: '3단 접이식 우산',
            isActive: true,
         },
         {
            name: '보조배터리',
            category: '전자기기',
            emoji: '🔋',
            totalStock: 15,
            available: 15,
            description: '20000mAh 대용량 보조배터리',
            isActive: true,
         },
         {
            name: '공학용계산기',
            category: '학습용품',
            emoji: '🧮',
            totalStock: 20,
            available: 20,
            description: '공학용 계산기 (CASIO fx-570)',
            isActive: true,
         },
         {
            name: '삼각대',
            category: '촬영장비',
            emoji: '📷',
            totalStock: 8,
            available: 8,
            description: '스마트폰/카메라 겸용 삼각대',
            isActive: true,
         },
         {
            name: '셀카봉',
            category: '촬영장비',
            emoji: '🤳',
            totalStock: 12,
            available: 12,
            description: '블루투스 셀카봉',
            isActive: true,
         },
         {
            name: '헬멧',
            category: '안전용품',
            emoji: '⛑️',
            totalStock: 10,
            available: 10,
            description: '자전거/킥보드용 안전 헬멧',
            isActive: true,
         },
         {
            name: '휴대용 선풍기',
            category: '전자기기',
            emoji: '💨',
            totalStock: 18,
            available: 18,
            description: 'USB 충전식 휴대용 선풍기',
            isActive: true,
         },
         {
            name: '블루투스 스피커',
            category: '전자기기',
            emoji: '🔊',
            totalStock: 10,
            available: 10,
            description: 'JBL 블루투스 스피커',
            isActive: true,
         },
         {
            name: '포인터',
            category: '발표용품',
            emoji: '📍',
            totalStock: 8,
            available: 8,
            description: '레이저 포인터 (프레젠테이션용)',
            isActive: true,
         },
         {
            name: '마우스',
            category: '전자기기',
            emoji: '🖱️',
            totalStock: 15,
            available: 15,
            description: '무선 마우스',
            isActive: true,
         },
         {
            name: '공바람주입기',
            category: '체육용품',
            emoji: '⚽',
            totalStock: 6,
            available: 6,
            description: '공기주입기 (농구공, 축구공 등)',
            isActive: true,
         },
         {
            name: '마이크',
            category: '발표용품',
            emoji: '🎤',
            totalStock: 7,
            available: 7,
            description: '무선 마이크 (행사/발표용)',
            isActive: true,
         },
      ];

      const createdItems = [];
      for (const itemData of rentalItems) {
         const item = await prisma.rentalItem.create({
            data: itemData,
         });
         createdItems.push(item);
         console.log(`  ✅ ${item.name} (${item.category}) 생성됨`);
      }
   }

   // 기존 대여물품 가져오기 (이미 존재하면 기존 것 사용)
   const allRentalItems = await prisma.rentalItem.findMany({ take: 15 });

   // 4. 샘플 대여 기록 생성
   console.log('\n📋 샘플 대여 기록 생성 중...');

   // 기존 대여 기록 확인
   const existingRentalsCount = await prisma.rental.count();
   if (existingRentalsCount > 0) {
      console.log(`  ℹ️  이미 ${existingRentalsCount}개의 대여 기록이 존재합니다. 건너뜁니다.`);
   } else if (createdUsers.length > 0 && allRentalItems.length > 0) {
      const rentals = [
         // 김철수 (createdUsers[0])
         {
            userId: createdUsers[0].id,
            itemId: allRentalItems[4].id, // 보조배터리
            quantity: 2,
            rentalDate: new Date('2026-02-28'),
            expectedReturnDate: new Date('2026-03-05'),
            status: 'active',
            notes: '수업용',
         },
         {
            userId: createdUsers[0].id,
            itemId: allRentalItems[10].id, // 블루투스 스피커
            quantity: 1,
            rentalDate: new Date('2026-03-01'),
            expectedReturnDate: new Date('2026-03-08'),
            status: 'active',
            notes: '동아리 행사',
         },
         // 이영희 (createdUsers[1])
         {
            userId: createdUsers[1].id,
            itemId: allRentalItems[3].id, // 우산
            quantity: 2,
            rentalDate: new Date('2026-02-25'),
            returnDate: new Date('2026-02-27'),
            expectedReturnDate: new Date('2026-02-27'),
            status: 'returned',
         },
         {
            userId: createdUsers[1].id,
            itemId: allRentalItems[9].id, // 휴대용 선풍기
            quantity: 1,
            rentalDate: new Date('2026-03-02'),
            expectedReturnDate: new Date('2026-03-09'),
            status: 'active',
            notes: '야외 활동용',
         },
         // 박민수 (createdUsers[2])
         {
            userId: createdUsers[2].id,
            itemId: allRentalItems[6].id, // 삼각대
            quantity: 1,
            rentalDate: new Date('2026-02-20'),
            returnDate: new Date('2026-02-25'),
            expectedReturnDate: new Date('2026-02-25'),
            status: 'returned',
            notes: '졸업사진 촬영',
         },
         {
            userId: createdUsers[2].id,
            itemId: allRentalItems[5].id, // 공학용계산기
            quantity: 1,
            rentalDate: new Date('2026-03-01'),
            expectedReturnDate: new Date('2026-03-15'),
            status: 'active',
            notes: '시험 기간',
         },
         // 정수진 (createdUsers[3])
         {
            userId: createdUsers[3].id,
            itemId: allRentalItems[2].id, // 돗자리
            quantity: 3,
            rentalDate: new Date('2026-02-28'),
            expectedReturnDate: new Date('2026-03-05'),
            status: 'active',
            notes: '체육대회',
         },
         {
            userId: createdUsers[3].id,
            itemId: allRentalItems[7].id, // 셀카봉
            quantity: 1,
            rentalDate: new Date('2026-02-26'),
            returnDate: new Date('2026-03-01'),
            expectedReturnDate: new Date('2026-03-01'),
            status: 'returned',
         },
         // 최지훈 (createdUsers[4])
         {
            userId: createdUsers[4].id,
            itemId: allRentalItems[0].id, // L카트
            quantity: 2,
            rentalDate: new Date('2026-02-27'),
            expectedReturnDate: new Date('2026-03-06'),
            status: 'active',
            notes: '동아리 물품 운반',
         },
         {
            userId: createdUsers[4].id,
            itemId: allRentalItems[14].id, // 마이크
            quantity: 2,
            rentalDate: new Date('2026-03-01'),
            expectedReturnDate: new Date('2026-03-08'),
            status: 'active',
            notes: '행사 진행',
         },
         {
            userId: createdUsers[4].id,
            itemId: allRentalItems[11].id, // 포인터
            quantity: 1,
            rentalDate: new Date('2026-02-18'),
            returnDate: new Date('2026-02-22'),
            expectedReturnDate: new Date('2026-02-22'),
            status: 'returned',
            notes: '발표 자료 준비',
         },
         // 추가 대여 기록들
         {
            userId: createdUsers[0].id,
            itemId: allRentalItems[12].id, // 마우스
            quantity: 1,
            rentalDate: new Date('2026-02-15'),
            returnDate: new Date('2026-02-20'),
            expectedReturnDate: new Date('2026-02-20'),
            status: 'returned',
         },
         {
            userId: createdUsers[1].id,
            itemId: allRentalItems[1].id, // 담요
            quantity: 4,
            rentalDate: new Date('2026-02-22'),
            returnDate: new Date('2026-02-28'),
            expectedReturnDate: new Date('2026-02-28'),
            status: 'returned',
            notes: '야외 활동',
         },
         {
            userId: createdUsers[2].id,
            itemId: allRentalItems[8].id, // 헬멧
            quantity: 2,
            rentalDate: new Date('2026-03-02'),
            expectedReturnDate: new Date('2026-03-09'),
            status: 'active',
            notes: '자전거 대회',
         },
         {
            userId: createdUsers[3].id,
            itemId: allRentalItems[13].id, // 공바람주입기
            quantity: 1,
            rentalDate: new Date('2026-02-24'),
            returnDate: new Date('2026-02-26'),
            expectedReturnDate: new Date('2026-02-26'),
            status: 'returned',
         },
         {
            userId: createdUsers[4].id,
            itemId: allRentalItems[5].id, // 공학용계산기
            quantity: 3,
            rentalDate: new Date('2026-02-10'),
            returnDate: new Date('2026-02-15'),
            expectedReturnDate: new Date('2026-02-15'),
            status: 'returned',
            notes: '스터디 그룹용',
         },
      ];

      for (const rentalData of rentals) {
         const rental = await prisma.rental.create({
            data: rentalData,
         });
         const item = allRentalItems.find(i => i.id === rental.itemId);
         const user = createdUsers.find(u => u.id === rental.userId);
         console.log(`  ✅ ${user?.name} - ${item?.name} 대여 기록 생성됨`);
      }

      // 대여 기록 생성 후 모든 아이템의 available 재계산 및 업데이트
      console.log('\n🔄 대여물품 재고 업데이트 중...');
      for (const item of allRentalItems) {
         const activeRentals = await prisma.rental.aggregate({
            where: { itemId: item.id, status: 'active' },
            _sum: { quantity: true },
         });
         const rentedQuantity = activeRentals._sum.quantity || 0;
         const available = item.totalStock - rentedQuantity;

         await prisma.rentalItem.update({
            where: { id: item.id },
            data: { available },
         });
         console.log(`  ✅ ${item.name}: 총재고 ${item.totalStock}, 대여중 ${rentedQuantity}, 가능 ${available}`);
      }
   }

   // 5. 샘플 포인트 히스토리 생성
   console.log('\n⭐ 샘플 포인트 히스토리 생성 중...');

   // 기존 포인트 히스토리 확인
   const existingHistoryCount = await prisma.pointHistory.count();
   if (existingHistoryCount > 0) {
      console.log(`  ℹ️  이미 ${existingHistoryCount}개의 포인트 히스토리가 존재합니다. 건너뜁니다.`);
   } else if (createdUsers.length > 0) {
      const pointHistoryData = [
         { userId: createdUsers[0].id, points: 15, reason: '신입생 환영회 참석', date: new Date('2026-02-20') },
         { userId: createdUsers[0].id, points: 10, reason: '학생회 설문조사 참여', date: new Date('2026-02-25') },
         { userId: createdUsers[0].id, points: 20, reason: '봄 축제 부스 운영', date: new Date('2026-02-28') },

         { userId: createdUsers[1].id, points: 25, reason: '봄 축제 참석', date: new Date('2026-02-18') },
         { userId: createdUsers[1].id, points: 15, reason: '신입생 환영회 참석', date: new Date('2026-02-22') },
         { userId: createdUsers[1].id, points: 12, reason: '체육대회 참가', date: new Date('2026-02-26') },
         { userId: createdUsers[1].id, points: 20, reason: '학생회 봉사활동', date: new Date('2026-03-01') },

         { userId: createdUsers[2].id, points: 10, reason: '중간고사 응원 이벤트', date: new Date('2026-02-15') },
         { userId: createdUsers[2].id, points: 8, reason: '웹 로그인 포인트', date: new Date('2026-02-20') },
         { userId: createdUsers[2].id, points: 10, reason: '학생회 설문조사', date: new Date('2026-02-28') },

         { userId: createdUsers[3].id, points: 20, reason: '봄 축제 참석', date: new Date('2026-02-16') },
         { userId: createdUsers[3].id, points: 16, reason: '신입생 도우미 활동', date: new Date('2026-02-24') },
         { userId: createdUsers[3].id, points: 20, reason: '학생회 홍보 활동', date: new Date('2026-03-01') },

         { userId: createdUsers[4].id, points: 25, reason: '봄 축제 참석', date: new Date('2026-02-12') },
         { userId: createdUsers[4].id, points: 20, reason: '체육대회 참가', date: new Date('2026-02-19') },
         { userId: createdUsers[4].id, points: 24, reason: '학생회 기획단 활동', date: new Date('2026-02-25') },
         { userId: createdUsers[4].id, points: 20, reason: '신입생 환영회 스태프', date: new Date('2026-03-01') },
      ];

      for (const historyData of pointHistoryData) {
         await prisma.pointHistory.create({
            data: historyData,
         });
      }
      console.log(`  ✅ ${pointHistoryData.length}개의 포인트 히스토리 생성됨`);
   }

   // 6. 기본 설정 생성
   console.log('\n⚙️  시스템 설정 생성 중...');
   const existingSettings = await prisma.settings.findFirst();
   if (existingSettings) {
      console.log('  ℹ️  이미 시스템 설정이 존재합니다. 건너뜁니다.');
   } else {
      const settings = await prisma.settings.create({
         data: {
            organizationName: '학생복지위원회',
            primaryColor: '#1B2A5C',
            secondaryColor: '#7DC443',
         },
      });
      console.log(`  ✅ 기본 설정 생성됨: ${settings.organizationName}`);
   }

   // 7. 등급 설정 생성
   console.log('\n🏆 등급 설정 생성 중...');
   const existingGrades = await prisma.gradeConfig.count();
   if (existingGrades > 0) {
      console.log(`  ℹ️  이미 ${existingGrades}개의 등급 설정이 존재합니다. 건너뜁니다.`);
   } else {
      const gradeConfigs = [
         {
            name: '별',
            type: 'ABSOLUTE_POINTS',
            minPoints: 0,
            maxPoints: 9,
            percentileMin: null,
            percentileMax: null,
            emoji: '⭐',
            color: '#8B9BC8',
            bgColor: '#EEF1FC',
            orderIndex: 0,
         },
         {
            name: '행성',
            type: 'ABSOLUTE_POINTS',
            minPoints: 10,
            maxPoints: null,
            percentileMin: null,
            percentileMax: null,
            emoji: '🪐',
            color: '#4BA3E3',
            bgColor: '#EBF4FF',
            orderIndex: 1,
         },
         {
            name: '로켓',
            type: 'ABSOLUTE_POINTS',
            minPoints: 10,
            maxPoints: null,
            percentileMin: null,
            percentileMax: null,
            emoji: '🚀',
            color: '#7DC443',
            bgColor: '#EFF8E6',
            orderIndex: 2,
         },
         {
            name: 'UFO',
            type: 'ABSOLUTE_POINTS',
            minPoints: 10,
            maxPoints: null,
            percentileMin: null,
            percentileMax: null,
            emoji: '🛸',
            color: '#F5C518',
            bgColor: '#FFF8E1',
            orderIndex: 3,
         },
      ];

      for (const gradeData of gradeConfigs) {
         await prisma.gradeConfig.create({
            data: gradeData,
         });
         console.log(`  ✅ ${gradeData.emoji} ${gradeData.name} 등급 생성됨`);
      }
   }

   console.log('\n✅ 데이터베이스 시딩 완료!');
   console.log('\n📊 생성된 데이터:');
   console.log(`  - 사용자: ${createdUsers.length}명`);
   const eventsCount = await prisma.event.count();
   const itemsCount = await prisma.rentalItem.count();
   const rentalsCount = await prisma.rental.count();
   const historyCount = await prisma.pointHistory.count();
   const settingsCount = await prisma.settings.count();
   const gradesCount = await prisma.gradeConfig.count();
   console.log(`  - 이벤트: ${eventsCount}개`);
   console.log(`  - 대여 물품: ${itemsCount}개`);
   console.log(`  - 대여 기록: ${rentalsCount}개`);
   console.log(`  - 포인트 히스토리: ${historyCount}개`);
   console.log(`  - 시스템 설정: ${settingsCount}개`);
   console.log(`  - 등급 설정: ${gradesCount}개`);
}

main()
   .catch((e) => {
      console.error('❌ 시딩 중 오류 발생:', e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });

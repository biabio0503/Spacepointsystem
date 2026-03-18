// 간단한 샘플 데이터 추가 스크립트
async function addData() {
   const baseUrl = 'http://localhost:3000';

   console.log('이벤트 생성 중...');
   // 관리자로 로그인 필요
   console.log('관리자 계정으로 로그인 후 브라우저 개발자 도구 Console에서 다음 코드를 실행하세요:');

   const events = [
      {
         title: '신입생 환영회',
         location: '학생회관 대강당',
         date: new Date('2026-03-15').toISOString(),
         content: '2026학년도 신입생을 환영하는 환영회입니다.',
         points: 15,
         postDate: new Date('2026-03-01').toISOString(),
         postEndDate: new Date('2026-03-14').toISOString(),
         isActive: true,
      }
   ];

   console.log(`
// 이벤트 추가
await fetch('/api/events', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(${JSON.stringify(events[0], null, 2)})
});

// 대여물품 추가
await fetch('/api/rental-items', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
      name: 'L카트',
      category: '운반용품',
      emoji: '🛒',
      totalStock: 5,
      description: '물품 운반용 대형 카트'
   })
});
   `);
}

addData();

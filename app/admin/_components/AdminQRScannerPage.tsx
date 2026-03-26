'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Camera, CheckCircle2, RotateCcw, UserCheck, XCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';

export default function AdminQRScannerPage() {
  const { users, refreshUsers, addPoints, settings } = useStore();
  
  const [pointAmount, setPointAmount] = useState(1);
  const [pointReason, setPointReason] = useState('행사 참여');
  
  const [isScanning, setIsScanning] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState<number>(0);

  const primaryColor = settings?.primaryColor || '#1B2A5C';

  useEffect(() => {
    // Ensure all users are loaded so we can find by studentId
    refreshUsers();
  }, [refreshUsers]);

  const handleScan = async (result: any) => {
    if (!result || !result.length) return;
    const scannedText = Array.isArray(result) ? result[0].rawValue : result.rawValue;
    
    // Prevent double-scanning within 3 seconds
    const now = Date.now();
    if (now - lastScannedTime < 3000) return;
    setLastScannedTime(now);

    try {
      // Data from user QR should look like: {"studentId":"20230000","name":"홍길동","timestamp":"...","type":"..."}
      const data = JSON.parse(scannedText);
      const studentIdMatch = data.studentId;
      
      if (!studentIdMatch) {
        throw new Error("유효하지 않은 QR 코드입니다.");
      }

      const user = users.find(u => u.studentId === studentIdMatch);
      if (!user) {
        setErrorMessage(`학번 ${studentIdMatch} 유저를 찾을 수 없습니다.`);
        setSuccessMessage(null);
        setIsScanning(false);
        return;
      }

      // Add points to the mapped userId
      await addPoints(user.id, Number(pointAmount), pointReason);
      
      setSuccessMessage(`${user.name} 님에게 ${pointAmount}p 지급 완료!`);
      setErrorMessage(null);
      
      // Pause scanner briefly
      setIsScanning(false);
      setTimeout(() => {
        setIsScanning(true);
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setErrorMessage('점수 부여 실패: 올바른 QR이 아니거나 네트워크 오류입니다.');
      setSuccessMessage(null);
      setIsScanning(false);
    }
  };

  return (
    <div className="p-5 space-y-5 flex flex-col items-center">
      {/* Settings Panel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm w-full max-w-[430px] border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Camera size={20} color={primaryColor} />
          QR 스캔 설정
        </h2>
        
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">지급 사유</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            type="text"
            value={pointReason}
            onChange={(e) => setPointReason(e.target.value)}
            placeholder="예: 축제 부스 참여"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">지급/차감 포인트 (마일리지)</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            type="number"
            value={pointAmount}
            onChange={(e) => setPointAmount(Number(e.target.value))}
            placeholder="포인트 수량"
          />
          <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
            * 음수 입력시 차감됩니다.
          </p>
        </div>
      </div>

      {/* Scanner Panel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm w-full max-w-[430px] border border-gray-100 flex flex-col items-center justify-center space-y-4 relative">
        <div className="w-full max-w-[300px] aspect-square bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center">
          {isScanning ? (
            <Scanner
              onScan={handleScan}
              onError={(e) => console.log('QR Error:', e)}
              components={{ finder: true }}
              styles={{
                container: { width: '100%', height: '100%' },
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-gray-50">
              {successMessage && (
                <>
                  <CheckCircle2 size={48} className="text-green-500 mb-2" />
                  <p className="font-bold whitespace-pre-line text-sm text-gray-800">{successMessage}</p>
                </>
              )}
              {errorMessage && (
                <>
                  <XCircle size={48} className="text-red-500 mb-2" />
                  <p className="font-bold text-sm text-red-600 mb-3">{errorMessage}</p>
                  <button 
                    onClick={() => {
                      setIsScanning(true);
                      setErrorMessage(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium"
                  >
                    <RotateCcw size={14} /> 다시 시도
                  </button>
                </>
              )}
              {!errorMessage && !successMessage && (
                <button 
                  onClick={() => setIsScanning(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium"
                >
                  <Camera size={14} /> 스캔 재개
                </button>
              )}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 font-medium">
          {isScanning ? "유저의 QR 코드를 스캔하세요." : "일시 중지됨"}
        </p>
      </div>
    </div>
  );
}

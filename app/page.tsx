import EmotionUniverse from '@/components/EmotionUniverse';

export default function Page() {
  // 서버 환경변수가 설정돼 있으면 UI에서 API 키 입력 불필요
  const hasServerKey = !!process.env.ANTHROPIC_API_KEY;
  return <EmotionUniverse hasServerKey={hasServerKey} />;
}

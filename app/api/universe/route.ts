export const runtime = 'edge';

import { SYSTEM_PROMPT } from '@/lib/prompt';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { emotion?: string };
    const emotion = body.emotion?.trim();

    if (!emotion) return json({ error: '감정을 입력해주세요.' }, 400);

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return json({ error: 'API 키가 없습니다.' }, 400);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `사용자 감정: "${emotion}"` }],
      }),
    });

    const data = await res.json();
    if (!res.ok) return json({ error: data.error?.message || '알 수 없는 오류' }, 500);

    const text = data.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: '응답 파싱 실패' }, 500);

    return json(JSON.parse(match[0]));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    return json({ error: msg }, 500);
  }
}
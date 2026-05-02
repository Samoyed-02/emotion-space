export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/prompt';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { emotion?: string };
    const emotion = body.emotion?.trim();

    if (!emotion) {
      return NextResponse.json({ error: '감정을 입력해주세요.' }, { status: 400 });
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
    }

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
    const text = data.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: '응답 파싱 실패' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(match[0]));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
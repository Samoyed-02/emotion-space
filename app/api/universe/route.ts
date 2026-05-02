export const runtime = 'edge';

import Anthropic from '@anthropic-ai/sdk';
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

    const client = new Anthropic({ apiKey: key });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // 시스템 프롬프트를 캐싱해 반복 호출 비용 절감
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: `사용자 감정: "${emotion}"` }],
    });

    const text = (message.content[0] as Anthropic.TextBlock).text.trim();
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

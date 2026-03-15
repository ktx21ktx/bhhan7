import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { diary } = await req.json();

        if (!diary) {
            return NextResponse.json(
                { error: '일기 내용이 필요합니다.' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
            return NextResponse.json(
                { error: '서버 설정 오류: API 키가 없습니다.' },
                { status: 500 }
            );
        }

        // 최신 모델인 gemini-2.0-flash 적용
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // 프롬프트 작성
        const prompt = `
당신은 사용자의 감정 일기를 읽고 오늘 하루의 감정 상태를 5가지 날씨 중 하나로 분석해주는 따뜻한 상담가입니다.

[날씨 종류]
1. sunny (맑음: 기쁘고 행복하고 평온함)
2. cloudy (흐림: 우울하고 무기력하고 답답함)
3. rainy (비: 슬프고 눈물이 남)
4. stormy (폭풍: 화가 나고 분노가 치밀어 오름)
5. snowy (눈: 외롭고 쓸쓸하고 차가운 느낌)
6. windy (바람: 머릿속이 복잡하고 생각이 많음)

[사용자 일기]
"""
${diary}
"""

[요청 사항]
1. 사용자의 일기를 읽고 위 6가지 날씨 중 가장 적절한 날씨코드 단어 하나(sunny, cloudy, rainy, stormy, snowy, windy)를 선택하세요.
2. 사용자에게 공감하고 위로와 격려, 혹은 기쁨을 나누는 따뜻한 분석/답장 메시지(3~4문장)를 작성해주세요.

반드시 아래 JSON 형식으로만 응답해야 합니다. 마크다운(\`\`\`json 등)은 절대 포함하지 말고 순수 JSON만 반환하세요. JSON 외의 다른 텍스트는 출력하지 마세요.
{
  "weather": "날씨코드",
  "analysis": "답장 메시지 내용"
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // JSON 파싱 시도 (가끔 모델이 마크다운 잔재를 섞어 보낼 수 있으므로 정리)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Gemini API 호출 중 오류 발생:', error);
        return NextResponse.json(
            { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
            { status: 500 }
        );
    }
}

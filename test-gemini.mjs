import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
let apiKey = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelsToTest = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

async function testModels() {
    let output = "🔍 Gemini 모델 테스트 시작...\n";
    let workingModel = null;

    for (const modelName of modelsToTest) {
        output += `[${modelName}] 테스트 중...\n`;
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const text = result.response.text();
            output += `  ✅ 성공! (${text.slice(0, 10)})\n`;
            if (!workingModel) workingModel = modelName;
        } catch (error) {
            output += `  ❌ 실패: ${error.message.split('\n')[0]}\n`;
        }
    }

    output += `\n결과: ${workingModel ? workingModel + ' 모델이 작동합니다.' : '모든 모델 실패'}`;
    fs.writeFileSync('test-result.txt', output, 'utf8');
}

testModels();

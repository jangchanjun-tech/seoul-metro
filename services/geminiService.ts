import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// Per @google/genai guidelines, the API key must be obtained from process.env.API_KEY.
// This environment variable is assumed to be pre-configured in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizQuestions(): Promise<QuizQuestion[]> {
  const prompt = `
      당신은 서울교통공사의 인사담당자이자 외부 컨설턴트로서, 관리자 역량 평가를 위한 창의적이고 깊이 있는 상황판단 문제 출제 전문가입니다. **사전에 주어진 특정 시나리오 목록에 의존하지 말고**, 서울교통공사 관리자가 직면할 수 있는 다양하고 현실적인 딜레마 상황을 **창의적으로 직접 생성**하여, 5가지 핵심 역량을 평가하는 심도 있는 상황판단 문제 5개를 한국어로 생성해 주십시오.

      **[문제 생성 핵심 지침]**

      **1. 평가 역량: 5대 관리자 역량 (문제별 Topic으로 사용)**
      아래 5가지 역량을 각각 **정확히 한 번씩만** 'topic'으로 지정하여, 각 역량의 정의를 측정할 수 있는 문제를 설계해야 합니다.
      *   **지휘감독능력:** 위기 상황에서 신속하게 우선순위를 정하고, 자원을 배분하며, 명확하게 지시하여 조직적으로 대응하는 능력.
      *   **책임감 및 적극성:** 맡은 과업을 끝까지 완수하고, 어려운 문제에 대해 회피하지 않고 주도적으로 해결하려는 자세.
      *   **관리자의 자세 및 청렴도:** 규정과 원칙을 준수하고, 공정하고 투명하게 업무를 처리하며, 솔선수범하는 태도.
      *   **경영의식 및 혁신성:** 한정된 자원을 효율적으로 활용하고, 비용 대비 효과를 분석하며, 기존 방식의 문제점을 개선하려는 노력.
      *   **업무이해도 및 상황대응력:** 복합적인 문제의 핵심을 파악하고, 다양한 이해관계를 고려하여 최적의 해결책을 찾는 능력.

      **2. 시나리오 생성 가이드 (창의적으로 활용할 소재)**
      **미리 정해진 사건을 사용하지 마십시오.** 대신 아래와 같은 다양한 맥락을 융합하여 복합적인 딜레마 상황을 만드세요.
      *   **[경제/정책]:** 급격한 물가 상승에 따른 요금 인상 압박과 시민 저항, 정부의 무임승차 손실 보전 거부, 대체 교통수단(자율주행 버스, 공유 킥보드 등)의 부상.
      *   **[사회/문화]:** 1인 가구 증가 및 비대면 문화 확산으로 인한 심야 교통 수요 변화, 워라밸 중시 문화와 교대근무 기피 현상, 사회적 약자 이동권 보장 요구 증대.
      *   **[기술/환경]:** AI 기반 관제 시스템 도입에 따른 기존 인력과의 갈등 및 개인정보보호 이슈, 노후 시설 유지보수와 친환경 전환(에너지 효율) 사이의 투자 딜레마.
      *   **[정치/갈등]:** 특정 지역의 신규 노선 유치 경쟁 과열과 정치적 압력, 노동조합의 경영 참여 요구 증대, 시민단체의 감시 강화.
      *   **[내부 운영]:** 직원 간의 갈등, 세대 차이, 신기술 도입에 대한 저항, 내부 비리 의혹, 안전 규정 준수와 운행 효율성 사이의 충돌 등.

      **3. 선택지 평가 기준: 4대 핵심가치**
      선택지를 구성하고 'best', 'next', 'worst'를 결정할 때 아래 가치를 기준으로 삼으십시오.
      *   **안전우선:** 모든 의사결정의 최우선 가치. 비용, 효율, 민원보다 안전이 우선되어야 함. 'best' 선택지는 이 가치를 반드시 반영해야 함.
      *   **도전혁신:** 관행을 벗어나 새로운 방식으로 문제를 해결하려는 노력.
      *   **고객지향:** 시민의 입장에서 생각하고 편의를 증진시키려는 자세.
      *   **지속경영:** 장기적인 관점에서 조직의 안정과 발전을 고려하는 의사결정.

      **[출력 형식 지침]**
      -   'scenario'는 위 '2. 시나리오 생성 가이드'의 요소들을 **창의적으로 융합**하여, 약 200-300단어 분량의 구체적이고 복합적인 딜레마 상황을 제시해야 합니다.
      -   'topic'은 위 '1. 평가 역량'에 명시된 5개 역량명을 정확히 하나씩만 사용해야 합니다.
      -   'options'는 5개를 제시하며, 모두 그럴듯하고 현실적인 내용이어야 합니다.
      -   5개의 선택지 중, 2개는 'best'(최선), 2개는 'next'(차선), 1개는 'worst'(최악) 유형으로 분류해야 합니다. 'best' 답안은 '3. 선택지 평가 기준'의 핵심가치(특히 안전우선)를 가장 잘 반영해야 합니다.
      -   당신의 출력은 반드시 다른 설명이나 markdown 포맷팅 없이, 오직 유효한 JSON 배열 형식이어야 합니다.
  `;
  
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        scenario: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['best', 'next', 'worst'] },
            },
            required: ['text', 'type'],
          },
        },
      },
      required: ['topic', 'scenario', 'options'],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = (response.text || '').trim();
    const generatedQuestions = JSON.parse(jsonText) as QuizQuestion[];

    if (!Array.isArray(generatedQuestions) || generatedQuestions.length < 2) {
      throw new Error("API did not return a valid array of questions.");
    }
    
    return generatedQuestions;
  } catch (error) {
    console.error("Error generating quiz questions from Gemini API:", error);
    throw error; // Re-throw to be caught by the caller
  }
}
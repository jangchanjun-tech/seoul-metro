import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

let ai: GoogleGenAI | null = null;

// Lazily initialize the AI client to defer the API key check until it's needed.
// This prevents a module-level crash if the key is missing and allows for
// graceful error handling in the UI.
function getAiClient(): GoogleGenAI {
    if (ai) {
        return ai;
    }

    // `import.meta.env` is a Vite-specific feature. Optional chaining `?.` is used
    // to prevent a TypeError if `import.meta.env` itself is undefined.
    const apiKey = import.meta.env?.VITE_API_KEY;

    // Vite replaces missing env vars with `undefined` during build.
    // This check catches that and provides a clear, actionable error.
    if (!apiKey) {
      throw new Error("VITE_API_KEY is not defined. Please check your environment variables. If deploying on Vercel, ensure it's set in the project settings and that the latest deployment has completed.");
    }

    ai = new GoogleGenAI({ apiKey });
    return ai;
}


export async function generateQuizQuestions(): Promise<QuizQuestion[]> {
  const prompt = `
      당신은 서울교통공사의 인사 컨설턴트이자, **'서울시의회 질의응답 회의록' PDF 파일을 심층 분석한 AI 전문가**입니다. 당신의 임무는 해당 자료에서 드러난 잠재적 위험, 시민들의 불만, 정책적 딜레마를 바탕으로, "만약 유사한 상황이 다시 발생한다면 어떻게 대처할 것인가?"를 묻는, 관리자의 5대 핵심 역량을 평가하는 심도 있는 상황판단 문제 5개를 한국어로 생성하는 것입니다.

      **[문제 생성 핵심 지침]**

      **1. 평가 역량: 5대 관리자 역량 (문제별 Topic으로 사용)**
      아래 5가지 역량을 각각 **정확히 한 번씩만** 'topic'으로 지정하여, 각 역량의 정의를 측정할 수 있는 문제를 설계해야 합니다.
      *   **지휘감독능력:** 위기 상황에서 신속하게 우선순위를 정하고, 자원을 배분하며, 명확하게 지시하여 조직적으로 대응하는 능력.
      *   **책임감 및 적극성:** 맡은 과업을 끝까지 완수하고, 어려운 문제에 대해 회피하지 않고 주도적으로 해결하려는 자세.
      *   **관리자의 자세 및 청렴도:** 규정과 원칙을 준수하고, 공정하고 투명하게 업무를 처리하며, 솔선수범하는 태도.
      *   **경영의식 및 혁신성:** 한정된 자원을 효율적으로 활용하고, 비용 대비 효과를 분석하며, 기존 방식의 문제점을 개선하려는 노력.
      *   **업무이해도 및 상황대응력:** 복합적인 문제의 핵심을 파악하고, 다양한 이해관계를 고려하여 최적의 해결책을 찾는 능력.

      **2. 시나리오 생성 가이드 (창의적으로 활용할 소재)**
      **일상 속에서 마주할 수 있는 다양한 문제들을 지하철 운영과 연결**하여, 질의응답 회의록에 나올 법한 복합적인 딜레마 상황을 만드세요.
      *   **[안전 최우선 딜레마]:** 스크린도어의 잦은 오작동 보고가 있으나, 전면 교체에는 막대한 예산과 운행 중단이 필요할 때. 시민 안전과 운영 효율성 사이의 갈등.
      *   **[경제/정책]:** 정부의 지원 삭감으로 적자가 심화되는 상황에서, '심야 연장 운행' 같은 수익성 높은 사업과 '장애인 콜택시 연계 환승 시스템' 같은 공공성 높은 사업 중 하나를 축소해야 할 때.
      *   **[사회/문화]:** 지하철 내 묻지마 범죄 예방을 위해 보안 검색대를 설치하자는 여론이 높아지지만, 인권 침해 및 과도한 통제라는 반발도 거셀 때.
      *   **[기술/환경]:** 신형 전동차 도입 시, 최신 편의 기능(개인 좌석, 무선 충전)을 중시할지, 아니면 에너지 효율 및 탄소 배출량 감소를 최우선으로 고려할지 결정해야 할 때.
      *   **[내부 운영]:** MZ세대 직원들이 열악한 교대근무 환경 개선을 강력히 요구하며 '조용한 사직'으로 저항하고 있으나, 인력 충원은 어려운 상황일 때.

      **3. 선택지 평가 기준: "안전"이라는 절대 가치**
      선택지를 구성하고 'best', 'next', 'worst'를 결정할 때 아래 기준을 엄격하게 적용하십시오.
      *   **안전우선 (절대 원칙):** **비용, 효율, 민원, 여론보다 '안전'을 최우선으로 고려하는 선택지가 반드시 'best'여야 합니다.** 안전에 조금이라도 타협하는 선택지는 'best'가 될 수 없습니다.
      *   **고객지향:** 시민의 입장에서 생각하고 편의를 증진시키려는 자세.
      *   **도전혁신:** 관행을 벗어나 새로운 방식으로 문제를 해결하려는 노력.
      *   **지속경영:** 장기적인 관점에서 조직의 안정과 발전을 고려하는 의사결정.

      **[출력 형식 지침]**
      -   'scenario'는 위 '2. 시나리오 생성 가이드'의 요소들을 **창의적으로 융합**하여, 약 200-300단어 분량의 구체적이고 복합적인 딜레마 상황을 제시해야 합니다.
      -   'topic'은 위 '1. 평가 역량'에 명시된 5개 역량명을 정확히 하나씩만 사용해야 합니다.
      -   'options'는 5개를 제시하며, 모두 그럴듯하고 현실적인 내용이어야 합니다.
      -   5개의 선택지 중, 2개는 'best'(최선), 2개는 'next'(차선), 1개는 'worst'(최악) 유형으로 분류해야 합니다.
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
    const geminiClient = getAiClient(); // This will throw if key is missing
    const response = await geminiClient.models.generateContent({
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
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// Per @google/genai guidelines, the API key must be obtained from process.env.API_KEY.
// This environment variable is assumed to be pre-configured in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizQuestions(): Promise<QuizQuestion[]> {
  const prompt = `
      당신은 서울교통공사의 관리자 역량 평가를 위한 상황판단 문제 출제 전문가입니다. 제공된 서울교통공사의 내부 실제 자료를 바탕으로, 5가지 핵심 역량을 평가하는 매우 현실적이고 심도 있는 상황판단 문제 5개를 한국어로 생성해 주십시오.

      **[매우 중요한 핵심 참조 자료]**

      **1. 실제 사건 및 딜레마 상황 (시나리오 소재)**
      *   **5호선 방화 사건:** 출근 시간대 5호선 열차에서 승객이 인화성 물질을 살포하여 방화. 기관사와 승객이 소화기로 초기 진화했으나, 500여명이 선로로 대피하며 150여명의 부상자 발생. 운행 중단, 언론 집중, SNS 실시간 전파 등 복합적 위기 상황.
      *   **직원 비리 및 뇌물수수:** 전 기술본부장이 특정 업체에 특혜를 주고 골프 접대 및 뇌물을 받은 혐의로 구속. 수의계약 제도의 허점과 내부 감사 시스템의 신뢰성 문제가 제기됨.
      *   **전동차 납품 지연:** 제작사의 생산능력 한계로 5, 8호선 신규 전동차 납품이 2년 이상 지연. 노후 전동차 운행으로 안전 우려가 커지고 시민 불편 가중. 막대한 지연배상금 부과 시 해당 업체가 파산하여 다른 사업까지 연쇄 중단될 수 있는 딜레마.
      *   **장애인 단체 시위:** 특정 장애인 단체가 지하철 운행을 고의로 방해하는 시위를 반복. 시민 불편이 극심하며, 시위 대응 과정에서 직원 부상도 다수 발생. 법적 대응의 강도와 사회적 약자 포용 사이의 갈등.
      *   **시설물 노후화 사고:** 2~8호선 교량 구간(평균 사용연수 40년)에서 콘크리트 조각이 떨어지는 등 안전사고가 반복 발생. 대규모 개량이 필요하지만 공사의 재정 여건상 어려워 취약 지점 위주로 관리 중.
      *   **첫차 시간 앞당기기 (노사 갈등):** 새벽 시간대 교통 편의를 위해 첫차 시간을 30분 앞당기는 정책 추진. 노동조합은 충분한 의견 수렴이 없었다며 근무시간 변경, 인력 부족 문제를 제기하며 강력히 반발.
      *   **사내 익명게시판 폐쇄:** 허위사실 유포, 비방, 욕설 등 부작용으로 인해 사내 익명 소통게시판('소통한마당')을 과반수 노조의 요구로 폐쇄. 일부 직원들은 소통 창구가 막혔다며 불만 제기.

      **2. 평가 기준: 4대 핵심가치**
      *   **안전우선:** 모든 의사결정의 최우선 가치. 비용, 효율, 민원보다 안전이 우선되어야 함. 'best' 선택지는 이 가치를 반드시 반영해야 함.
      *   **도전혁신:** 관행을 벗어나 새로운 방식으로 문제를 해결하려는 노력.
      *   **고객지향:** 시민의 입장에서 생각하고 편의를 증진시키려는 자세.
      *   **지속경영:** 장기적인 관점에서 조직의 안정과 발전을 고려하는 의사결정.

      **3. 출제 역량: 5대 관리자 역량 (문제별 Topic으로 사용)**
      아래 5가지 역량을 각각 **정확히 한 번씩만** 'topic'으로 지정하여, 각 역량의 정의를 측정할 수 있는 문제를 설계해야 합니다.
      *   **지휘감독능력:** 위기 상황에서 신속하게 우선순위를 정하고, 자원을 배분하며, 명확하게 지시하여 조직적으로 대응하는 능력.
      *   **책임감 및 적극성:** 맡은 과업을 끝까지 완수하고, 어려운 문제에 대해 회피하지 않고 주도적으로 해결하려는 자세.
      *   **관리자의 자세 및 청렴도:** 규정과 원칙을 준수하고, 공정하고 투명하게 업무를 처리하며, 솔선수범하는 태도.
      *   **경영의식 및 혁신성:** 한정된 자원을 효율적으로 활용하고, 비용 대비 효과를 분석하며, 기존 방식의 문제점을 개선하려는 노력.
      *   **업무이해도 및 상황대응력:** 복합적인 문제의 핵심을 파악하고, 다양한 이해관계를 고려하여 최적의 해결책을 찾는 능력.

      **[문제 생성 지침]**
      -   'scenario'는 위 '1. 실제 사건 및 딜레마 상황'을 기반으로, 약 200-300단어 분량의 구체적이고 복합적인 딜레마 상황을 제시해야 합니다.
      -   'topic'은 위 '3. 출제 역량'에 명시된 5개 역량명을 정확히 하나씩만 사용해야 합니다.
      -   'options'는 5개를 제시하며, 모두 그럴듯하고 현실적인 내용이어야 합니다.
      -   5개의 선택지 중, 2개는 'best'(최선), 2개는 'next'(차선), 1개는 'worst'(최악) 유형으로 분류해야 합니다. 'best' 답안은 '2. 평가 기준'의 핵심가치(특히 안전우선)를 가장 잘 반영해야 합니다.
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
        seed: Math.floor(Math.random() * 1000000),
      },
    });

    const jsonText = response.text.trim();
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
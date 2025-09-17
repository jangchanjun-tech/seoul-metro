
import React from 'react';
import { UserAnswer, OptionType } from '../types';

interface ResultScreenProps {
    score: number;
    totalQuestions: number;
    userAnswers: UserAnswer[];
    onRestart: () => void;
    onRetry: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalQuestions, userAnswers, onRestart, onRetry }) => {

    const totalPossibleScore = totalQuestions * 20;
    const scorePercentage = totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;
    
    let message: string;
    let scoreRingClass: string;
    let scoreTextClass: string;

    if (scorePercentage >= 90) {
        message = "훌륭합니다! 당신은 뛰어난 통찰력과 균형 잡힌 판단력을 지닌 리더입니다.";
        scoreRingClass = 'bg-green-100 border-green-500';
        scoreTextClass = 'text-green-700';
    } else if (scorePercentage >= 70) {
        message = "좋은 판단력입니다. 대부분의 상황에서 합리적인 결정을 내릴 수 있습니다.";
        scoreRingClass = 'bg-blue-100 border-blue-500';
        scoreTextClass = 'text-blue-700';
    } else if (scorePercentage >= 50) {
        message = "가능성이 보입니다. 조금 더 넓은 시야로 상황을 분석하는 연습이 필요합니다.";
        scoreRingClass = 'bg-yellow-100 border-yellow-500';
        scoreTextClass = 'text-yellow-700';
    } else {
        message = "위험한 판단을 할 가능성이 있습니다. 신중한 의사결정 훈련이 필요해 보입니다.";
        scoreRingClass = 'bg-red-100 border-red-500';
        scoreTextClass = 'text-red-700';
    }

    const getTypeLabel = (type: OptionType) => {
        switch(type) {
            case 'best': return '<span class="font-semibold text-green-600">최선</span>';
            case 'next': return '<span class="font-semibold text-blue-600">차선</span>';
            case 'worst': return '<span class="font-semibold text-red-600">최악</span>';
            default: return '';
        }
    };

    const calculateRoundScore = (types: OptionType[]): number => {
        const bestCount = types.filter(t => t === 'best').length;
        const nextCount = types.filter(t => t === 'next').length;
        const worstCount = types.filter(t => t === 'worst').length;

        if (bestCount === 2) return 20;
        if (bestCount === 1 && nextCount === 1) return 15;
        if (nextCount === 2) return 10;
        if (bestCount === 1 && worstCount === 1) return 5;
        if (nextCount === 1 && worstCount === 1) return 0;
        if (worstCount > 0) return 0;
        return 0;
    };


    return (
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">테스트 결과</h1>
            <p className="text-lg text-gray-600 mb-6">당신의 종합 점수는...</p>
            <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center mb-6 border-4 ${scoreRingClass}`}>
                <span className={`text-4xl md:text-5xl font-bold ${scoreTextClass}`}>{score}</span>
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-8">{message}</p>
            
            <div className="text-left mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">문항별 상세 분석</h2>
                {userAnswers.map((answer, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">문제 {index + 1}: {answer.question.topic}</h3>
                        <p className="text-sm text-gray-600 italic mb-3 leading-relaxed">{answer.question.scenario}</p>
                        <ul className="list-none space-y-2 mb-3 text-sm">
                            {answer.question.options.map(option => {
                                const isSelected = answer.selectedTexts.includes(option.text);
                                return (
                                    <li key={option.text} className={`flex items-start ${isSelected ? 'font-bold text-indigo-800' : 'text-gray-600'}`}>
                                        <span className="mr-2">{isSelected ? '☑️' : '◻️'}</span>
                                        <span className="flex-1" dangerouslySetInnerHTML={{ __html: `${option.text} (${getTypeLabel(option.type)})` }} />
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="text-right font-bold text-indigo-700">획득 점수: {calculateRoundScore(answer.selectedTypes)} / 20</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={onRetry} className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
                    다시 문제풀기 (복습)
                </button>
                <button onClick={onRestart} className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                    새로운 문제로 다시하기
                </button>
            </div>
        </div>
    );
};

export default ResultScreen;


import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizOption, UserAnswer, OptionType } from '../types';

interface QuizScreenProps {
    quizData: QuizQuestion[];
    onQuizComplete: (finalScore: number, answers: UserAnswer[]) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ quizData, onQuizComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<QuizOption[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [score, setScore] = useState(0);

    const currentQuestion = quizData[currentQuestionIndex];

    useEffect(() => {
        setSelectedOptions([]);
    }, [currentQuestionIndex]);

    const handleOptionChange = (option: QuizOption, isChecked: boolean) => {
        if (isChecked) {
            setSelectedOptions(prev => [...prev, option]);
        } else {
            setSelectedOptions(prev => prev.filter(o => o.text !== option.text));
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
        if (worstCount > 0) return 0; // Covers cases like two worsts
        return 0;
    };

    const handleSubmit = () => {
        const selectedTypes = selectedOptions.map(o => o.type);
        const roundScore = calculateRoundScore(selectedTypes);
        const newScore = score + roundScore;
        
        const answer: UserAnswer = {
            question: currentQuestion,
            selectedTexts: selectedOptions.map(o => o.text),
            selectedTypes: selectedTypes,
        };
        const updatedAnswers = [...userAnswers, answer];
        
        setScore(newScore);
        setUserAnswers(updatedAnswers);

        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            onQuizComplete(newScore, updatedAnswers);
        }
    };

    const isSubmitDisabled = selectedOptions.length !== 2;
    const shuffledOptions = React.useMemo(() => [...currentQuestion.options].sort(() => Math.random() - 0.5), [currentQuestion]);

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{currentQuestion.topic}</span>
                    <span className="text-lg font-bold text-gray-700">문제 {currentQuestionIndex + 1} / {quizData.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}></div>
                </div>
            </div>
            
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-200 mb-6 max-h-[250px] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-3">상황</h2>
                <div className="prose prose-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.scenario.replace(/\n/g, '<br />') }}></div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">이 상황에서 당신이 할 행동 2가지를 선택하세요.</h3>
                <div className="grid grid-cols-1 gap-3">
                    {shuffledOptions.map((option, index) => {
                        const optionId = `option-${index}`;
                        const isChecked = selectedOptions.some(o => o.text === option.text);
                        const isDisabled = selectedOptions.length >= 2 && !isChecked;
                        return (
                             <div key={optionId} className="flex items-center">
                                <input
                                    id={optionId}
                                    type="checkbox"
                                    value={option.type}
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={(e) => handleOptionChange(option, e.target.checked)}
                                    className="custom-checkbox h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <label
                                    htmlFor={optionId}
                                    className={`ml-3 block text-base text-gray-700 border border-gray-300 rounded-lg p-3 w-full cursor-pointer transition-colors hover:bg-gray-50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {option.text}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {currentQuestionIndex === quizData.length - 1 ? '결과 보기' : '다음 문제'}
                </button>
            </div>
        </div>
    );
};

export default QuizScreen;

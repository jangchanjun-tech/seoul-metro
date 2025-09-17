import React, { useState, useCallback } from 'react';
import { AppScreen, QuizQuestion, UserAnswer } from './types';
import StartScreen from './components/StartScreen';
import LoadingScreen from './components/LoadingScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { generateQuizQuestions } from './services/geminiService';

const App: React.FC = () => {
    const [screen, setScreen] = useState<AppScreen>(AppScreen.START);
    const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [finalScore, setFinalScore] = useState<number>(0);

    const handleGenerateAndStartQuiz = useCallback(async () => {
        setScreen(AppScreen.LOADING);
        try {
            const questions = await generateQuizQuestions();
            const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
            setQuizData(shuffledQuestions);
            setUserAnswers([]);
            setFinalScore(0);
            setScreen(AppScreen.QUIZ);
        } catch (error) {
            console.error("AI 문제 생성 실패:", error);
            // Provide a more specific error message if the API key is missing.
            if (error instanceof Error && error.message.includes('VITE_API_KEY')) {
                 alert("AI 서비스 설정 오류: API 키가 누락되었습니다. 애플리케이션 환경 변수(VITE_API_KEY)가 올바르게 설정되었는지 확인해주세요.");
            } else {
                 alert("AI 실시간 문제 생성에 실패했습니다. 네트워크 또는 API 설정 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.");
            }
            setScreen(AppScreen.START);
        }
    }, []);

    const handleQuizComplete = (score: number, answers: UserAnswer[]) => {
        setFinalScore(score);
        setUserAnswers(answers);
        setScreen(AppScreen.RESULT);
    };
    
    const handleRetry = () => {
        setUserAnswers([]);
        setFinalScore(0);
        setScreen(AppScreen.QUIZ);
    };

    const handleRestart = () => {
        setScreen(AppScreen.START);
        setQuizData([]);
        setUserAnswers([]);
        setFinalScore(0);
    };

    const renderScreen = () => {
        switch (screen) {
            case AppScreen.START:
                return <StartScreen onStart={handleGenerateAndStartQuiz} />;
            case AppScreen.QUIZ:
                 return <QuizScreen quizData={quizData} onQuizComplete={handleQuizComplete} />;
            case AppScreen.RESULT:
                return <ResultScreen 
                            score={finalScore} 
                            totalQuestions={quizData.length} 
                            userAnswers={userAnswers} 
                            onRestart={handleRestart} 
                            onRetry={handleRetry}
                        />;
            default:
                return <StartScreen onStart={handleGenerateAndStartQuiz} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <main className="w-full flex-grow flex justify-center items-center p-4 md:p-12">
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-10 relative">
                    {screen === AppScreen.LOADING && <LoadingScreen />}
                    {renderScreen()}
                    {screen === AppScreen.START && (
                        <p className="text-center font-bold text-gray-600 mt-8 pt-6 border-t border-gray-200">
                            본 문제는 Ai가 만든 가상 문제로 문제 생성까지는 약 2분~3분의 시간이 걸립니다. ^^
                        </p>
                    )}
                </div>
            </main>
            <footer className="w-full text-center p-4">
                <p className="text-gray-500 text-sm">만든이 미로산책</p>
            </footer>
        </div>
    );
};

export default App;

import React, { useState, useCallback } from 'react';
import { AppScreen, QuizQuestion, UserAnswer } from './types';
import StartScreen from './components/StartScreen';
import LoadingScreen from './components/LoadingScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { generateQuizQuestions } from './services/geminiService';
import { FALLBACK_QUIZ_DATA } from './constants';

const CACHED_QUIZ_KEY = 'cachedMetroQuizData';

const App: React.FC = () => {
    const [screen, setScreen] = useState<AppScreen>(AppScreen.START);
    const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [finalScore, setFinalScore] = useState<number>(0);

    const handleGenerateAndStartQuiz = useCallback(async () => {
        setScreen(AppScreen.LOADING);
        try {
            const questions = await generateQuizQuestions();
            
            // On success, save to localStorage to act as a fresh cache/fallback
            try {
                localStorage.setItem(CACHED_QUIZ_KEY, JSON.stringify(questions));
            } catch (storageError) {
                console.warn("Could not save questions to localStorage", storageError);
            }

            const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
            setQuizData(shuffledQuestions);
        } catch (error) {
            console.error("Failed to generate new quiz:", error);
            alert(`AI 실시간 문제 생성에 실패했습니다. 실행 환경의 네트워크 제약 또는 시간 초과 문제로 보입니다.\n대신, 이전에 생성됐거나 내장된 문제로 평가를 진행합니다.`);
            
            let questionsToUse: QuizQuestion[] = FALLBACK_QUIZ_DATA; // Default to static data
            try {
                const cachedData = localStorage.getItem(CACHED_QUIZ_KEY);
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData) as QuizQuestion[];
                    // A simple validation to make sure the cached data is usable
                    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].topic) {
                        questionsToUse = parsedData;
                    }
                }
            } catch (storageError) {
                console.warn("Could not read from localStorage, using static fallback.", storageError);
                // questionsToUse is already set to FALLBACK_QUIZ_DATA, so no action needed here.
            }
            
            const shuffledFallback = [...questionsToUse].sort(() => Math.random() - 0.5);
            setQuizData(shuffledFallback);
        } finally {
            setUserAnswers([]);
            setFinalScore(0);
            setScreen(AppScreen.QUIZ);
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
        // We call the generation function from the start screen now.
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
            // The loading screen is handled as an overlay
            default:
                return <StartScreen onStart={handleGenerateAndStartQuiz} />;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 my-8 relative">
                {screen === AppScreen.LOADING && <LoadingScreen />}
                {renderScreen()}
            </div>
        </div>
    );
};

export default App;

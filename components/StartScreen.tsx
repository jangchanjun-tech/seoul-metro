
import React from 'react';

interface StartScreenProps {
    onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    return (
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">서울교통공사 AI 상황판단 역량 진단</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                AI가 서울시 질의응답, 핵심과제, 5대 역량 자료를 기반으로 실제 업무와 유사한 상황판단 문제를 실시간으로 생성합니다. 각 상황을 신중하게 읽고, 가장 적절하다고 생각하는 행동 2가지를 선택해주세요.
            </p>
            <button
                onClick={onStart}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-lg"
            >
                AI 문제 생성 및 평가 시작
            </button>
        </div>
    );
};

export default StartScreen;

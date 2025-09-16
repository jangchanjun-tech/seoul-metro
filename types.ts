
export enum AppScreen {
  START = 'START',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
}

export type OptionType = 'best' | 'next' | 'worst';

export interface QuizOption {
  text: string;
  type: OptionType;
}

export interface QuizQuestion {
  topic: string;
  scenario: string;
  options: QuizOption[];
}

export interface UserAnswer {
  question: QuizQuestion;
  selectedTexts: string[];
  selectedTypes: OptionType[];
}

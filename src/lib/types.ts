export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcode_slug?: string | null;
  created_at: string;
  code_solutions?: CodeSolution[];
}

export interface CodeSolution {
  id: string;
  problem_id: string;
  title: string;
  language: string;
  code: string;
  created_at: string;
}

export interface NewProblemPayload {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcode_slug?: string;
  initialLanguage?: string;
  initialCode?: string;
}

export interface NewCodeSolutionPayload {
  problem_id: string;
  title: string;
  language: string;
  code: string;
}

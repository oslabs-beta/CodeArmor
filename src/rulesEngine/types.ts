export interface Violation {
  message: string;
  severity: 'high' | 'medium' | 'low';
  ruleId: string;
  location: {
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
    file?: string;
  };
  suggestion?: string;
}

export interface Rule {
  name: string;
  description: string;
  run(ast: any, fileName: string): Violation[];
}
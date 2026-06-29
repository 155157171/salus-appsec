import { type Vulnerability } from '../core/ai-adapter.js';
export type { Vulnerability };
export interface AnalysisResult {
    markdownReport: string;
    vulnerabilities: Vulnerability[];
    rawResponse: string;
}
export declare function runAnalysisCLI(rootDir: string): Promise<AnalysisResult>;
export declare function runRedTeamAnalysis(rootDir: string): Promise<AnalysisResult>;
export declare function runBlueTeamHardening(rootDir: string): Promise<AnalysisResult>;
export declare function runAISecurityAudit(rootDir: string): Promise<AnalysisResult>;
export declare function runWebSecurityAudit(rootDir: string): Promise<AnalysisResult>;
export declare function analyzeCommand(): Promise<void>;
export declare function redTeamCommand(): Promise<void>;
export declare function hardenCommand(): Promise<void>;
export declare function aiSecurityCommand(): Promise<void>;
export declare function webSecurityCommand(): Promise<void>;
//# sourceMappingURL=analyze.d.ts.map
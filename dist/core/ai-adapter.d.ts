export interface Vulnerability {
    id_vulnerabilidade: string;
    arquivo: string;
    descricao: string;
    severidade: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    codigo_antigo: string;
    codigo_novo_sugerido: string;
}
export declare function analyzeWithAI(provider: string, apiKey: string, model: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithRedTeam(provider: string, apiKey: string, model: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithBlueTeam(provider: string, apiKey: string, model: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithAISecurity(provider: string, apiKey: string, model: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithWebSecurity(provider: string, apiKey: string, model: string, contextXml: string): Promise<Vulnerability[]>;
export declare function autoFixWithAI(provider: string, apiKey: string, model: string, contextXml: string): Promise<Vulnerability[]>;
//# sourceMappingURL=ai-adapter.d.ts.map
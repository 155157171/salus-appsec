export interface Vulnerability {
    id_vulnerabilidade: string;
    arquivo: string;
    descricao: string;
    severidade: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    codigo_antigo: string;
    codigo_novo_sugerido: string;
}
export declare function analyzeWithAI(apiKey: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithRedTeam(apiKey: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithBlueTeam(apiKey: string, contextXml: string): Promise<Vulnerability[]>;
export declare function analyzeWithAISecurity(apiKey: string, contextXml: string): Promise<Vulnerability[]>;
//# sourceMappingURL=ai-adapter.d.ts.map
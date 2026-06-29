type Provider = 'openai' | 'anthropic' | 'openrouter';
export declare function setCredentials(provider: Provider, apiKey: string, model: string): void;
export declare function getCredentials(): {
    provider: string;
    apiKey: string;
    model: string;
};
export declare function setProvider(provider: Provider): void;
export declare function getProvider(): string;
export declare function setApiKey(key: string): void;
export declare function getApiKey(): string;
export declare function setModel(model: string): void;
export declare function getModel(): string;
export {};
//# sourceMappingURL=config-store.d.ts.map
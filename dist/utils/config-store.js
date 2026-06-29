import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
const CONFIG_DIR = join(homedir(), '.salus');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');
function ensureSecurePermissions() {
    try {
        if (existsSync(CONFIG_DIR)) {
            const dirStats = statSync(CONFIG_DIR);
            if ((dirStats.mode & 0o077) !== 0) {
                console.warn(`[Salus] Aviso: ~/.salus/ tem permissões inseguras. Execute: chmod 700 ~/.salus/`);
            }
        }
        if (existsSync(CONFIG_PATH)) {
            const fileStats = statSync(CONFIG_PATH);
            if ((fileStats.mode & 0o077) !== 0) {
                console.warn(`[Salus] Aviso: config.json tem permissões inseguras. Execute: chmod 600 ~/.salus/config.json`);
            }
        }
    }
    catch {
        // Silently ignore permission check failures on unsupported platforms
    }
}
function readConfig() {
    try {
        if (!existsSync(CONFIG_PATH)) {
            return { provider: '', apiKey: '', model: 'gpt-4o' };
        }
        const raw = readFileSync(CONFIG_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Migration: if apiKey exists but provider doesn't, default to openai
        if (parsed.apiKey && !parsed.provider) {
            parsed.provider = 'openai';
            writeFileSync(CONFIG_PATH, JSON.stringify({
                provider: parsed.provider,
                apiKey: parsed.apiKey,
                model: parsed.model || 'gpt-4o',
            }, null, 2), { encoding: 'utf-8', mode: 0o600 });
        }
        return {
            provider: parsed.provider || '',
            apiKey: parsed.apiKey || '',
            model: parsed.model || 'gpt-4o',
        };
    }
    catch {
        return { provider: '', apiKey: '', model: 'gpt-4o' };
    }
}
function writeConfig(data) {
    if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), { encoding: 'utf-8', mode: 0o600 });
}
export function setCredentials(provider, apiKey) {
    const config = readConfig();
    config.provider = provider;
    config.apiKey = apiKey;
    writeConfig(config);
}
export function getCredentials() {
    ensureSecurePermissions();
    const config = readConfig();
    return { provider: config.provider, apiKey: config.apiKey };
}
export function setProvider(provider) {
    const config = readConfig();
    config.provider = provider;
    writeConfig(config);
}
export function getProvider() {
    return readConfig().provider;
}
export function setApiKey(key) {
    const config = readConfig();
    config.apiKey = key;
    writeConfig(config);
}
export function getApiKey() {
    const envKey = process.env.SALUS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (envKey)
        return envKey;
    ensureSecurePermissions();
    return readConfig().apiKey;
}
export function setModel(model) {
    const config = readConfig();
    config.model = model;
    writeConfig(config);
}
export function getModel() {
    const envModel = process.env.SALUS_OPENAI_MODEL;
    if (envModel)
        return envModel;
    return readConfig().model;
}
//# sourceMappingURL=config-store.js.map
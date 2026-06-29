import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

type Provider = 'openai' | 'anthropic' | 'openrouter';

interface ConfigData {
  provider: Provider | '';
  apiKey: string;
  model: string;
}

const CONFIG_DIR = join(homedir(), '.salus');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

function ensureSecurePermissions(): void {
  if (process.platform === 'win32') return;
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
  } catch {
    // Silently ignore permission check failures
  }
}

function readConfig(): ConfigData {
  try {
    if (!existsSync(CONFIG_PATH)) {
      return { provider: '', apiKey: '', model: 'gpt-4o' };
    }
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ConfigData>;

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
      provider: (parsed.provider as ConfigData['provider']) || '',
      apiKey: parsed.apiKey || '',
      model: parsed.model || 'gpt-4o',
    };
  } catch {
    return { provider: '', apiKey: '', model: 'gpt-4o' };
  }
}

function writeConfig(data: ConfigData): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), { encoding: 'utf-8', mode: 0o600 });
}

export function setCredentials(provider: Provider, apiKey: string, model: string): void {
  const config = readConfig();
  config.provider = provider;
  config.apiKey = apiKey;
  config.model = model;
  writeConfig(config);
}

export function getCredentials(): { provider: string; apiKey: string; model: string } {
  ensureSecurePermissions();
  const config = readConfig();
  return { provider: config.provider, apiKey: config.apiKey, model: config.model };
}

export function setProvider(provider: Provider): void {
  const config = readConfig();
  config.provider = provider;
  writeConfig(config);
}

export function getProvider(): string {
  return readConfig().provider;
}

export function setApiKey(key: string): void {
  const config = readConfig();
  config.apiKey = key;
  writeConfig(config);
}

export function getApiKey(): string {
  const envKey = process.env.SALUS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (envKey) return envKey;
  ensureSecurePermissions();
  return readConfig().apiKey;
}

export function setModel(model: string): void {
  const config = readConfig();
  config.model = model;
  writeConfig(config);
}

export function getModel(): string {
  const envModel = process.env.SALUS_OPENAI_MODEL;
  if (envModel) return envModel;
  return readConfig().model;
}

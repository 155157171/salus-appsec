import * as readline from 'readline';
import chalk from 'chalk';
import { setCredentials, getProvider, getModel } from '../utils/config-store.js';
const PROVIDER_MODELS = {
    openai: 'gpt-5.5-pro',
    anthropic: 'claude-4-8-opus-latest',
    openrouter: 'anthropic/claude-4.8-opus',
};
const PROVIDER_PREFIX = {
    openai: 'sk-',
    anthropic: 'sk-ant-',
    openrouter: 'sk-or-',
};
const PROVIDER_NAMES = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    openrouter: 'OpenRouter',
};
const PROVIDER_LIST = [
    { value: 'openai', name: 'OpenAI', hint: 'GPT-5.5 Pro' },
    { value: 'anthropic', name: 'Anthropic', hint: 'Claude 4.8 Opus' },
    { value: 'openrouter', name: 'OpenRouter', hint: 'Multi-modelo' },
];
function ask(rl, query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer.trim());
        });
    });
}
export async function configCommand(existingRl) {
    const ownRl = !existingRl;
    const rl = existingRl || readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        if (ownRl) {
            console.log('');
            console.log(chalk.hex('#FF1A1A').bold('  ═══ Salus · Configuração BYOK ═══'));
            console.log('');
        }
        const currentProvider = getProvider();
        const currentModel = getModel();
        // Step 1: Select provider (readline only — no clack)
        console.log(chalk.hex('#CC3333')('  Selecione o provedor de IA:'));
        PROVIDER_LIST.forEach((p, i) => {
            const marker = p.value === currentProvider
                ? chalk.hex('#FF1A1A').bold(`  [${i + 1}]`)
                : chalk.hex('#555555')(`  [${i + 1}]`);
            const name = p.value === currentProvider
                ? chalk.hex('#FF4444').bold(p.name)
                : chalk.hex('#888888')(p.name);
            console.log(`${marker} ${name} ${chalk.hex('#444444')(p.hint)}`);
        });
        let provider = '';
        while (!provider) {
            const input = await ask(rl, `\n  Provedor [1-${PROVIDER_LIST.length}]: `);
            const idx = parseInt(input, 10);
            if (idx >= 1 && idx <= PROVIDER_LIST.length) {
                provider = PROVIDER_LIST[idx - 1].value;
            }
            else {
                console.log(chalk.hex('#FF6600')(`  ▲ Digite um número entre 1 e ${PROVIDER_LIST.length}.`));
            }
        }
        const prefix = PROVIDER_PREFIX[provider];
        const providerName = PROVIDER_NAMES[provider];
        // Step 2: Ask for API Key
        console.log('');
        console.log(chalk.hex('#555555')(`  Provedor: ${providerName} — a chave deve começar com "${prefix}"`));
        let apiKey = '';
        while (!apiKey) {
            const input = await ask(rl, `\n  API Key (${providerName}): `);
            if (!input) {
                console.log(chalk.hex('#FF6600')('  ▲ A chave não pode estar vazia.'));
                continue;
            }
            if (!input.startsWith(prefix)) {
                console.log(chalk.hex('#FF6600')(`  ▲ A chave do ${providerName} deve começar com "${prefix}".`));
                continue;
            }
            apiKey = input;
        }
        // Step 3: Determine model
        let model;
        if (provider === 'openrouter') {
            console.log('');
            console.log(chalk.hex('#555555')('  Exemplos: anthropic/claude-4.8-opus, google/gemini-2.5-pro, meta-llama/llama-4-70b-instruct'));
            const input = await ask(rl, `\n  ID do modelo no OpenRouter [padrão: ${currentModel || 'anthropic/claude-4.8-opus'}]: `);
            if (!input) {
                model = currentModel || 'anthropic/claude-4.8-opus';
            }
            else if (!input.includes('/')) {
                console.log(chalk.hex('#FF6600')('  ▲ Formato inválido. Usei o padrão.'));
                model = 'anthropic/claude-4.8-opus';
            }
            else {
                model = input;
            }
        }
        else {
            model = PROVIDER_MODELS[provider];
        }
        // Step 4: Save credentials
        setCredentials(provider, apiKey, model);
        console.log('');
        console.log(chalk.hex('#FF3333')('  ■ Configuração salva.'));
        console.log(chalk.hex('#555555')(`  Provedor: ${providerName}`));
        console.log(chalk.hex('#555555')(`  Modelo:   ${model}`));
        console.log('');
    }
    finally {
        if (ownRl)
            rl.close();
    }
}
//# sourceMappingURL=config.js.map
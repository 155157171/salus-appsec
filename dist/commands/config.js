import * as readline from 'readline';
import chalk from 'chalk';
import { setApiKey, setModel, getModel } from '../utils/config-store.js';
function ask(rl, query) {
    return new Promise((resolve) => {
        rl.question(chalk.hex('#FF4444')(query), (answer) => {
            resolve(answer.trim());
        });
    });
}
const MODELS = [
    { name: 'GPT-4o (Recomendado)', value: 'gpt-4o' },
    { name: 'GPT-4o-mini (Mais rápido)', value: 'gpt-4o-mini' },
    { name: 'GPT-4-turbo', value: 'gpt-4-turbo' },
    { name: 'o3-mini', value: 'o3-mini' },
];
export async function configCommand() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    try {
        console.log('');
        console.log(chalk.hex('#FF1A1A').bold('  ═══ Salus · Configuração BYOK ═══'));
        console.log('');
        let apiKey = '';
        while (!apiKey) {
            const input = await ask(rl, '  API Key da OpenAI: ');
            if (!input) {
                console.log(chalk.hex('#FF6600')('  ▲ A chave não pode estar vazia.'));
                continue;
            }
            if (!input.startsWith('sk-')) {
                console.log(chalk.hex('#FF6600')('  ▲ A chave deve começar com "sk-".'));
                continue;
            }
            apiKey = input;
        }
        console.log('');
        console.log(chalk.hex('#CC3333')('  Selecione o modelo:'));
        MODELS.forEach((m, i) => {
            const marker = m.value === getModel() ? chalk.hex('#FF1A1A').bold(`  [${i + 1}]`) : chalk.hex('#555555')(`  [${i + 1}]`);
            const name = m.value === getModel() ? chalk.hex('#FF4444').bold(m.name) : chalk.hex('#888888')(m.name);
            console.log(`${marker} ${name}`);
        });
        let model = '';
        while (!model) {
            const input = await ask(rl, `\n  Modelo [1-${MODELS.length}, padrão: gpt-4o]: `);
            if (!input) {
                const current = getModel() || 'gpt-4o';
                model = current;
                break;
            }
            const idx = parseInt(input, 10);
            if (idx >= 1 && idx <= MODELS.length) {
                model = MODELS[idx - 1].value;
            }
            else {
                console.log(chalk.hex('#FF6600')(`  ▲ Digite um número entre 1 e ${MODELS.length}.`));
            }
        }
        setApiKey(apiKey);
        setModel(model);
        console.log('');
        console.log(chalk.hex('#FF3333')('  ■ Configuração salva.'));
        console.log(chalk.hex('#555555')(`  Modelo: ${model}`));
        console.log('');
    }
    finally {
        rl.close();
    }
}
//# sourceMappingURL=config.js.map
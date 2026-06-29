import * as readline from 'readline';
import chalk from 'chalk';
import { setCredentials, getProvider } from '../utils/config-store.js';

function ask(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(chalk.hex('#FF4444')(query), (answer) => {
      resolve(answer.trim());
    });
  });
}

type ProviderChoice = {
  name: string;
  value: 'openai' | 'anthropic' | 'openrouter';
  prefix: string;
  hint: string;
};

const PROVIDERS: ProviderChoice[] = [
  { name: 'OpenAI', value: 'openai', prefix: 'sk-', hint: 'sk-proj-... ou sk-...' },
  { name: 'Anthropic', value: 'anthropic', prefix: 'sk-ant-', hint: 'sk-ant-api03-...' },
  { name: 'OpenRouter', value: 'openrouter', prefix: 'sk-or-', hint: 'sk-or-v1-...' },
];

export async function configCommand(existingRl?: readline.Interface): Promise<void> {
  const ownRl = !existingRl;
  const rl = existingRl || readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    if (ownRl) {
      console.log('');
      console.log(chalk.hex('#FF1A1A').bold('  ═══ Salus · Configuração BYOK ═══'));
      console.log('');
    }

    const currentProvider = getProvider();

    console.log(chalk.hex('#CC3333')('  Selecione o provedor LLM:'));
    PROVIDERS.forEach((p, i) => {
      const marker = p.value === currentProvider
        ? chalk.hex('#FF1A1A').bold(`  [${i + 1}]`)
        : chalk.hex('#555555')(`  [${i + 1}]`);
      const name = p.value === currentProvider
        ? chalk.hex('#FF4444').bold(p.name)
        : chalk.hex('#888888')(p.name);
      console.log(`${marker} ${name} ${chalk.hex('#444444')(p.hint)}`);
    });

    let provider: 'openai' | 'anthropic' | 'openrouter' | '' = '';
    while (!provider) {
      const input = await ask(rl, `\n  Provedor [1-${PROVIDERS.length}]: `);
      const idx = parseInt(input, 10);
      if (idx >= 1 && idx <= PROVIDERS.length) {
        provider = PROVIDERS[idx - 1].value;
      } else {
        console.log(chalk.hex('#FF6600')(`  ▲ Digite um número entre 1 e ${PROVIDERS.length}.`));
      }
    }

    const selected = PROVIDERS.find(p => p.value === provider)!;
    console.log('');
    console.log(chalk.hex('#555555')(`  Provedor: ${selected.name} — a chave deve começar com "${selected.prefix}"`));

    let apiKey = '';
    while (!apiKey) {
      const input = await ask(rl, `\n  API Key (${selected.name}): `);
      if (!input) {
        console.log(chalk.hex('#FF6600')('  ▲ A chave não pode estar vazia.'));
        continue;
      }
      if (!input.startsWith(selected.prefix)) {
        console.log(chalk.hex('#FF6600')(`  ▲ A chave do ${selected.name} deve começar com "${selected.prefix}".`));
        continue;
      }
      apiKey = input;
    }

    setCredentials(provider!, apiKey);

    console.log('');
    console.log(chalk.hex('#FF3333')('  ■ Configuração salva.'));
    console.log(chalk.hex('#555555')(`  Provedor: ${selected.name}`));
    console.log('');
  } finally {
    if (ownRl) rl.close();
  }
}

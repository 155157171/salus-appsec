import * as readline from 'readline';
import chalk from 'chalk';
import { select, text, isCancel } from '@clack/prompts';
import { setCredentials, getProvider, getModel } from '../utils/config-store.js';

const PROVIDER_MODELS: Record<string, string> = {
  openai: 'gpt-5.5-pro',
  anthropic: 'claude-4-8-opus-latest',
  openrouter: 'anthropic/claude-4.8-opus',
};

const PROVIDER_PREFIX: Record<string, string> = {
  openai: 'sk-',
  anthropic: 'sk-ant-',
  openrouter: 'sk-or-',
};

const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
};

function ask(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(chalk.hex('#FF4444')(query), (answer) => {
      resolve(answer.trim());
    });
  });
}

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
    const currentModel = getModel();

    // Step 1: Select provider
    const providerChoice = await select({
      message: 'Qual provedor de IA você deseja utilizar?',
      options: [
        { value: 'openai', label: 'OpenAI', hint: 'GPT-5.5 Pro' },
        { value: 'anthropic', label: 'Anthropic', hint: 'Claude 4.8 Opus' },
        { value: 'openrouter', label: 'OpenRouter', hint: 'Multi-modelo' },
      ],
      initialValue: currentProvider || 'openai',
    });

    if (isCancel(providerChoice)) {
      console.log(chalk.hex('#FF6600')('\n  ▲ Configuração cancelada.'));
      return;
    }

    const provider = providerChoice as string;
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
    let model: string;

    if (provider === 'openrouter') {
      // For OpenRouter, ask the user which model they want
      const modelInput = await text({
        message: 'Qual ID do modelo no OpenRouter você quer usar?',
        placeholder: 'anthropic/claude-4.8-opus',
        initialValue: currentModel || 'anthropic/claude-4.8-opus',
        validate: (val: string | undefined) => {
          if (!val || !val.trim()) return 'O ID do modelo não pode estar vazio.';
          if (!val.includes('/')) return 'O ID deve seguir o formato provedor/modelo (ex: anthropic/claude-4.8-opus).';
          return undefined;
        },
      });

      if (isCancel(modelInput)) {
        console.log(chalk.hex('#FF6600')('\n  ▲ Configuração cancelada.'));
        return;
      }

      model = (modelInput as string).trim();
    } else {
      // For OpenAI and Anthropic, set the model automatically
      model = PROVIDER_MODELS[provider];
    }

    // Step 4: Save credentials
    setCredentials(provider as 'openai' | 'anthropic' | 'openrouter', apiKey, model);

    console.log('');
    console.log(chalk.hex('#FF3333')('  ■ Configuração salva.'));
    console.log(chalk.hex('#555555')(`  Provedor: ${providerName}`));
    console.log(chalk.hex('#555555')(`  Modelo:   ${model}`));
    console.log('');
  } finally {
    if (ownRl) rl.close();
  }
}

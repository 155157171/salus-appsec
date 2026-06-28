import { input, select } from '@inquirer/prompts';
import { setApiKey, setModel, getModel } from '../utils/config-store.js';
import { success, info } from '../utils/logger.js';
export async function configCommand() {
    info('Bem-vindo à configuração do Salus (BYOK)');
    const apiKey = await input({
        message: 'Qual sua API Key da OpenAI?',
        validate: (value) => {
            if (!value.trim())
                return 'A API Key não pode estar vazia.';
            if (!value.startsWith('sk-'))
                return 'API Key da OpenAI deve começar com "sk-".';
            return true;
        },
    });
    const model = await select({
        message: 'Selecione o modelo LLM:',
        choices: [
            { name: 'GPT-4o (Recomendado)', value: 'gpt-4o' },
            { name: 'GPT-4o-mini (Mais rápido)', value: 'gpt-4o-mini' },
            { name: 'GPT-4-turbo', value: 'gpt-4-turbo' },
            { name: 'o3-mini', value: 'o3-mini' },
        ],
        default: getModel() || 'gpt-4o',
    });
    setApiKey(apiKey.trim());
    setModel(model);
    success('Configuração salva com sucesso!');
}
//# sourceMappingURL=config.js.map
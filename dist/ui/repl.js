import * as readline from 'readline';
import { resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { getCredentials } from '../utils/config-store.js';
import { configCommand } from '../commands/config.js';
import { runAnalysisCLI, runRedTeamAnalysis, runBlueTeamHardening, runAISecurityAudit, runWebSecurityAudit } from '../commands/analyze.js';
import { applyFix } from '../core/patcher.js';
// ── Red Hacker Theme ──────────────────────────────────────────────
const RED = '#FF1A1A';
const BLOOD = '#CC0000';
const DIM_RED = '#991111';
const DARK = '#660000';
const ASH = '#555555';
const WARN = '#FF4400';
const PROMPT_SYMBOL = chalk.hex(RED).bold('salus') + chalk.hex(ASH)(' › ');
const terminalTheme = {
    code: chalk.hex('#CC3333'),
    blockquote: chalk.hex('#661111'),
    heading: chalk.hex(RED).bold,
    firstHeading: chalk.hex(BLOOD).bold.underline,
    hr: chalk.hex(DIM_RED),
    listitem: chalk.hex('#CC6666'),
    table: chalk.hex('#CC6666'),
    paragraph: chalk.hex('#BB8888'),
    strong: chalk.hex('#FF4444').bold,
    em: chalk.italic.hex('#FF6666'),
    codespan: chalk.hex('#FF3333').bgHex('#1A0000'),
    del: chalk.strikethrough.hex(DIM_RED),
    link: chalk.hex('#FF6666').underline,
    href: chalk.hex('#FF4444').underline,
    text: chalk.hex('#CC8888'),
    emoji: true,
    unescape: true,
    showSectionPrefix: true,
    reflowText: true,
    width: 100,
    tab: 2,
};
marked.use(markedTerminal(terminalTheme));
// ── Banner ────────────────────────────────────────────────────────
function showWelcome() {
    const logo = [
        '',
        '▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▄      ▄▄▄▄▄        ▄▄▄▄▄   ▄▄▄▄▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄',
        '█           █ █       ▀▀▄   █   ▄        █   ▄   █   █ █           █',
        '    █▀▀▀▀▀▀▀▀     ▄▄▄    ▀▄     ▄            ▄             █▀▀▀▀▀▀▀▀',
        '▀   ▀▀▀▀▀▀▀▀▄ ▀   █  ▀▄   ▀ ▀   █        ▀   █   ▀   ▀ ▀   ▀▀▀▀▀▀▀▀▄',
        '▀▄▄▄▄▄▄▄▄ ░ █ █ ░ █▄▄▄▀   █ █ ░ █        █ ░ █   █   █ ▀▄▄▄▄▄▄▄▄ ░ █',
        '▄▄▄▄▄   █ ▒ █ █ ▒         █ █ ▒▄▀▄       █ ▒▒ ▀▄▄█   █ ▄▄▄▄▄   █ ▒ █',
        '█   █▄▄▄█ ▓ █ █ ▓ █▀▀▀█   █  █ ▓▓▄▀▀▄▄▄▄  █ ▀▓▄      █ █   █▄▄▄█ ▓ █',
        '█ ▀       ▀ █ █ ▀ █   █   █   ▀▄▄▀▀▀   █   ▀▄▄ ▀▀    █ █ ▀       ▀ █',
        '▀▀▀▀▀▀▀▀▀▀▀▀▀ ▀▀▀▀▀   ▀▀▀▀▀      ▀▀▀▀▀▀▀      ▀▀▀▀▀▀▀▀ ▀▀▀▀▀▀▀▀▀▀▀▀▀',
        '',
        '           ──── AppSec · BYOK · Auto-Fix ────',
        '',
    ];
    for (const line of logo) {
        console.log(chalk.hex(RED)(line));
    }
    console.log(chalk.hex('#FF4444').bold('    [ AppSec · BYOK · Code Review · Auto-Fix ]'));
    console.log(chalk.hex(ASH)('    Bring Your Own Key — OpenAI · Anthropic · OpenRouter'));
    console.log('');
    const { provider, apiKey, model } = getCredentials();
    if (!provider) {
        console.log(chalk.hex(WARN)(`    ▲  Nenhum provedor configurado — /config`));
    }
    else {
        console.log(chalk.hex(DIM_RED)(`    ◆  ${provider.toUpperCase()} · ${model}`));
        console.log(chalk.hex('#444444')(`    ${apiKey.slice(0, 14)}...`));
    }
    console.log('');
    console.log(chalk.hex(ASH)('    /analyze    /redteam    /harden    /aisec    /websec'));
    console.log(chalk.hex(ASH)('    /config     /help       /exit'));
    console.log('');
}
// ── Help ──────────────────────────────────────────────────────────
function showHelp() {
    console.log('');
    console.log(chalk.hex(RED).bold('  ── comandos ──────────────────────────────'));
    console.log('');
    console.log(chalk.hex('#FF4444')('  /analyze') + chalk.hex(ASH)('   › varredura de vulnerabilidades (CVSS/EPSS/KEV)'));
    console.log(chalk.hex('#FF4444')('  /redteam') + chalk.hex(ASH)('   › mindset ofensivo (kill chain, MITRE ATT&CK)'));
    console.log(chalk.hex('#FF4444')('  /harden ') + chalk.hex(ASH)('   › hardening defensivo (defense-in-depth, CIS)'));
    console.log(chalk.hex('#FF4444')('  /aisec  ') + chalk.hex(ASH)('   › auditoria AI/LLM (OWASP LLM Top 10 2025)'));
    console.log(chalk.hex('#FF4444')('  /websec ') + chalk.hex(ASH)('   › análise web/API (OWASP, SQLi, XSS, SSRF, auth)'));
    console.log(chalk.hex('#FF4444')('  /config ') + chalk.hex(ASH)('   › configurar provedor + API Key'));
    console.log(chalk.hex('#FF4444')('  /help   ') + chalk.hex(ASH)('   › mostrar esta ajuda'));
    console.log(chalk.hex('#FF4444')('  /exit   ') + chalk.hex(ASH)('   › sair'));
    console.log('');
}
// ── Markdown ──────────────────────────────────────────────────────
function renderMarkdown(md) {
    try {
        return marked.parse(md);
    }
    catch {
        return md;
    }
}
// ── Prompt helper ─────────────────────────────────────────────────
async function ask(rl, query) {
    return new Promise((resolve) => {
        rl.pause();
        rl.question(query, (answer) => {
            rl.resume();
            resolve(answer.trim());
        });
    });
}
// ── Severity color ────────────────────────────────────────────────
function sevColor(sev) {
    if (sev === 'CRITICAL')
        return chalk.hex('#FF0000').bold;
    if (sev === 'HIGH')
        return chalk.hex('#FF3333').bold;
    if (sev === 'MEDIUM')
        return chalk.hex('#FF6600');
    return chalk.hex(ASH);
}
function sevBadge(sev) {
    const map = {
        CRITICAL: '◉',
        HIGH: '◉',
        MEDIUM: '◐',
        LOW: '○',
    };
    return map[sev] || '○';
}
// ── Shared analysis handler ───────────────────────────────────────
async function analysisHandlers(rl, mode) {
    const { provider, apiKey, model } = getCredentials();
    if (!provider || !apiKey || !model) {
        console.log(chalk.hex('#FF0000')('\n  ╳  Configuração incompleta — use /config\n'));
        return;
    }
    const configs = {
        vuln: { label: 'Escaneando vulnerabilidades...', color: 'red', fn: runAnalysisCLI, ok: 'Análise de vulnerabilidades concluída', empty: 'Nenhuma vulnerabilidade encontrada', modeLabel: 'vulnerabilidade' },
        redteam: { label: 'Mapeando kill chain Red Team...', color: 'red', fn: runRedTeamAnalysis, ok: 'Análise Red Team concluída', empty: 'Nenhum vetor de ataque encontrado', modeLabel: 'mitigação' },
        blueteam: { label: 'Aplicando hardening defensivo...', color: 'red', fn: runBlueTeamHardening, ok: 'Hardening defensivo concluído', empty: 'Sistema adequadamente blindado', modeLabel: 'ação de hardening' },
        aisec: { label: 'Auditando AI/LLM Security...', color: 'red', fn: runAISecurityAudit, ok: 'Auditoria AI/LLM concluída', empty: 'Nenhum risco AI/LLM encontrado', modeLabel: 'correção AI/LLM' },
        websec: { label: 'Analisando web/API security...', color: 'red', fn: runWebSecurityAudit, ok: 'Análise web/API concluída', empty: 'Nenhuma vulnerabilidade web encontrada', modeLabel: 'correção web' },
    };
    const cfg = configs[mode];
    console.log('');
    const sp = ora({ text: chalk.hex(ASH)(cfg.label), spinner: 'dots', color: cfg.color }).start();
    let result;
    try {
        result = await cfg.fn(process.cwd());
    }
    catch (err) {
        sp.fail('Falha na análise.');
        console.log(chalk.hex('#FF0000')(`  ${err.message}\n`));
        return;
    }
    sp.succeed(chalk.hex(RED).bold(cfg.ok));
    const rendered = renderMarkdown(result.markdownReport);
    console.log('');
    console.log(rendered);
    console.log('');
    if (result.vulnerabilities.length === 0) {
        console.log(chalk.hex('#FF3333')(`  ◆  ${cfg.empty}.\n`));
        return;
    }
    const fixable = result.vulnerabilities.filter(v => v.codigo_antigo && v.codigo_novo_sugerido);
    if (fixable.length === 0) {
        console.log(chalk.hex(ASH)('  Nenhuma correção automática disponível.\n'));
        return;
    }
    console.log(chalk.hex('#FF6600')(`  ${fixable.length} ${cfg.modeLabel}(s) disponíveis em ${new Set(fixable.map(v => v.arquivo)).size} arquivo(s).`));
    console.log('');
    console.log(chalk.hex('#FF1A1A').bold('  ═══════════════════════════════════════'));
    console.log(chalk.hex('#FF1A1A').bold('    ⚠  ATENÇÃO — FAÇA BACKUP ANTES  ⚠'));
    console.log(chalk.hex('#FF1A1A').bold('  ═══════════════════════════════════════'));
    console.log(chalk.hex('#FF4444')('  O auto-fix modificará arquivos do projeto.'));
    console.log(chalk.hex('#555555')('  Backup automático: ~/.salus/backups/'));
    console.log(chalk.hex('#555555')('  Reverter: git checkout -- <arquivo>'));
    console.log('');
    const filesToFix = [...new Set(fixable.map(v => v.arquivo))];
    for (const file of filesToFix) {
        const vulnsInFile = fixable.filter(v => v.arquivo === file);
        console.log('');
        console.log(chalk.hex('#FF3333').bold(`  ▸ ${file}`));
        for (const v of vulnsInFile) {
            const sc = sevColor(v.severidade);
            console.log(sc(`    ${sevBadge(v.severidade)} [${v.severidade}] ${v.id_vulnerabilidade}`));
            console.log(chalk.hex(ASH)(`      ${v.descricao.slice(0, 100)}...`));
        }
        const answer = await ask(rl, `\n  Aplicar em "${file}"? [s/N] `);
        if (['s', 'sim', 'y', 'yes'].includes(answer.toLowerCase())) {
            for (const v of vulnsInFile) {
                try {
                    await applyFix(resolve(file), v.codigo_antigo, v.codigo_novo_sugerido);
                    console.log(chalk.hex('#FF4444')(`    ■ ${v.id_vulnerabilidade} aplicada`));
                }
                catch (err) {
                    console.log(chalk.hex('#FF0000')(`    ╳ ${v.id_vulnerabilidade}: ${err.message}`));
                }
            }
        }
    }
    console.log('');
    console.log(chalk.hex('#FF3333')(`  ◆  Processo finalizado.\n`));
}
// ── Config Handler ────────────────────────────────────────────────
async function handleConfig() {
    try {
        await configCommand();
    }
    catch (err) {
        console.log(chalk.hex('#FF0000')(`  ╳  ${err.message}`));
    }
}
// ── REPL Engine ───────────────────────────────────────────────────
export async function startREPL() {
    console.clear();
    showWelcome();
    let running = true;
    while (running) {
        const result = await new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: PROMPT_SYMBOL + ' ',
                terminal: true,
                historySize: 200,
                removeHistoryDuplicates: true,
            });
            rl.prompt();
            rl.on('line', async (rawLine) => {
                const line = rawLine.trim();
                if (!line) {
                    rl.prompt();
                    return;
                }
                if (['/exit', '/quit', '/q'].includes(line)) {
                    rl.close();
                    resolve('exit');
                    return;
                }
                if (['/help', '/h'].includes(line)) {
                    showHelp();
                    rl.prompt();
                    return;
                }
                if (['/analyze', '/a'].includes(line)) {
                    await analysisHandlers(rl, 'vuln');
                    rl.prompt();
                    return;
                }
                if (['/redteam', '/rt'].includes(line)) {
                    await analysisHandlers(rl, 'redteam');
                    rl.prompt();
                    return;
                }
                if (['/harden', '/hd'].includes(line)) {
                    await analysisHandlers(rl, 'blueteam');
                    rl.prompt();
                    return;
                }
                if (['/aisec', '/ai'].includes(line)) {
                    await analysisHandlers(rl, 'aisec');
                    rl.prompt();
                    return;
                }
                if (['/websec', '/ws'].includes(line)) {
                    await analysisHandlers(rl, 'websec');
                    rl.prompt();
                    return;
                }
                if (['/config', '/c'].includes(line)) {
                    rl.close();
                    await new Promise(r => rl.on('close', r));
                    await new Promise(r => setTimeout(r, 150));
                    await handleConfig();
                    resolve('restart');
                    return;
                }
                if (line.startsWith('/')) {
                    console.log(chalk.hex(ASH)(`  comando desconhecido: ${line}`));
                    rl.prompt();
                    return;
                }
                console.log(chalk.hex(ASH)('  /help para comandos'));
                rl.prompt();
            });
            rl.on('SIGINT', () => {
                rl.close();
                resolve('exit');
            });
        });
        if (result === 'exit')
            running = false;
        if (result === 'restart') {
            console.clear();
            showWelcome();
        }
    }
    console.log('');
    console.log(chalk.hex(RED)('  ╳  session terminated'));
    console.log('');
    process.exit(0);
}
//# sourceMappingURL=repl.js.map
import * as readline from 'readline';
import { resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import type { TerminalRendererOptions } from 'marked-terminal';
import { getApiKey, getModel } from '../utils/config-store.js';
import { configCommand } from '../commands/config.js';
import { runAnalysisCLI, runRedTeamAnalysis, runBlueTeamHardening, runAISecurityAudit, type AnalysisResult } from '../commands/analyze.js';
import { applyFix } from '../core/patcher.js';

// ── Red Hacker Theme ──────────────────────────────────────────────

const RED = '#FF1A1A';
const BLOOD = '#CC0000';
const DIM_RED = '#991111';
const DARK = '#660000';
const ASH = '#555555';
const WARN = '#FF4400';

const PROMPT_SYMBOL = chalk.hex(RED).bold('salus') + chalk.hex(ASH)(' › ');

const terminalTheme: TerminalRendererOptions = {
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

marked.use(markedTerminal(terminalTheme) as any);

// ── Banner ────────────────────────────────────────────────────────

function showWelcome(): void {
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
  console.log(chalk.hex(ASH)('    Bring Your Own Key — OpenAI'));
  console.log('');

  const apiKey = getApiKey();
  if (!apiKey) {
    console.log(chalk.hex(WARN)(`    ▲  API Key não configurada — /config`));
  } else {
    console.log(chalk.hex(DIM_RED)(`    ◆  Key: ${apiKey.slice(0, 10)}...  ·  ${getModel()}`));
  }
  console.log('');
  console.log(chalk.hex(ASH)('    /analyze    /redteam    /harden    /aisec'));
  console.log(chalk.hex(ASH)('    /config     /help       /exit'));
  console.log('');
}

// ── Help ──────────────────────────────────────────────────────────

function showHelp(): void {
  console.log('');
  console.log(chalk.hex(RED).bold('  ── comandos ──────────────────────────────'));
  console.log('');
  console.log(chalk.hex('#FF4444')('  /analyze') + chalk.hex(ASH)('   › varredura de vulnerabilidades (CVSS/EPSS/KEV)'));
  console.log(chalk.hex('#FF4444')('  /redteam') + chalk.hex(ASH)('   › mindset ofensivo (kill chain, MITRE ATT&CK)'));
  console.log(chalk.hex('#FF4444')('  /harden ') + chalk.hex(ASH)('   › hardening defensivo (defense-in-depth, CIS)'));
  console.log(chalk.hex('#FF4444')('  /aisec  ') + chalk.hex(ASH)('   › auditoria AI/LLM (OWASP LLM Top 10 2025)'));
  console.log(chalk.hex('#FF4444')('  /config ') + chalk.hex(ASH)('   › configurar API Key + modelo'));
  console.log(chalk.hex('#FF4444')('  /help   ') + chalk.hex(ASH)('   › mostrar esta ajuda'));
  console.log(chalk.hex('#FF4444')('  /exit   ') + chalk.hex(ASH)('   › sair'));
  console.log('');
}

// ── Markdown ──────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  try {
    return marked.parse(md) as string;
  } catch {
    return md;
  }
}

// ── Prompt helper ─────────────────────────────────────────────────

async function ask(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(chalk.hex('#FF4444')(query), (answer) => {
      resolve(answer.trim());
    });
  });
}

// ── Severity color ────────────────────────────────────────────────

function sevColor(sev: string): chalk.Chalk {
  if (sev === 'CRITICAL') return chalk.hex('#FF0000').bold;
  if (sev === 'HIGH') return chalk.hex('#FF3333').bold;
  if (sev === 'MEDIUM') return chalk.hex('#FF6600');
  return chalk.hex(ASH);
}

function sevBadge(sev: string): string {
  const map: Record<string, string> = {
    CRITICAL: '◉',
    HIGH: '◉',
    MEDIUM: '◐',
    LOW: '○',
  };
  return map[sev] || '○';
}

// ── Shared analysis handler ───────────────────────────────────────

async function analysisHandlers(
  rl: readline.Interface,
  mode: 'vuln' | 'redteam' | 'blueteam' | 'aisec',
): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log(chalk.hex('#FF0000')('\n  ╳  API Key não configurada — use /config\n'));
    return;
  }

  const configs = {
    vuln: { label: 'Escaneando vulnerabilidades...', color: 'red' as const, fn: runAnalysisCLI, ok: 'Análise de vulnerabilidades concluída', empty: 'Nenhuma vulnerabilidade encontrada', modeLabel: 'vulnerabilidade' },
    redteam: { label: 'Mapeando kill chain Red Team...', color: 'red' as const, fn: runRedTeamAnalysis, ok: 'Análise Red Team concluída', empty: 'Nenhum vetor de ataque encontrado', modeLabel: 'mitigação' },
    blueteam: { label: 'Aplicando hardening defensivo...', color: 'red' as const, fn: runBlueTeamHardening, ok: 'Hardening defensivo concluído', empty: 'Sistema adequadamente blindado', modeLabel: 'ação de hardening' },
    aisec: { label: 'Auditando AI/LLM Security...', color: 'red' as const, fn: runAISecurityAudit, ok: 'Auditoria AI/LLM concluída', empty: 'Nenhum risco AI/LLM encontrado', modeLabel: 'correção AI/LLM' },
  };

  const cfg = configs[mode];

  console.log('');
  const sp = ora({ text: chalk.hex(ASH)(cfg.label), spinner: 'dots', color: cfg.color }).start();

  let result: AnalysisResult;
  try {
    result = await cfg.fn(process.cwd());
  } catch (err) {
    sp.fail('Falha na análise.');
    console.log(chalk.hex('#FF0000')(`  ${(err as Error).message}\n`));
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

  console.log(
    chalk.hex('#FF6600')(
      `  ${fixable.length} ${cfg.modeLabel}(s) disponíveis em ${new Set(fixable.map(v => v.arquivo)).size} arquivo(s).`,
    ),
  );

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
        } catch (err) {
          console.log(chalk.hex('#FF0000')(`    ╳ ${v.id_vulnerabilidade}: ${(err as Error).message}`));
        }
      }
    }
  }

  console.log('');
  console.log(chalk.hex('#FF3333')(`  ◆  Processo finalizado.\n`));
}

// ── Config Handler ────────────────────────────────────────────────

async function handleConfig(): Promise<void> {
  console.log('');
  try {
    await configCommand();
  } catch (err) {
    console.log(chalk.hex('#FF0000')(`  ╳  ${(err as Error).message}`));
  }
  console.log('');
}

// ── REPL Engine ───────────────────────────────────────────────────

export async function startREPL(): Promise<void> {
  console.clear();
  showWelcome();

  let running = true;

  while (running) {
    const result = await new Promise<'continue' | 'restart' | 'exit'>((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: PROMPT_SYMBOL + ' ',
        terminal: true,
        historySize: 200,
        removeHistoryDuplicates: true,
      });

      rl.prompt();

      rl.on('line', async (rawLine: string) => {
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

        if (['/config', '/c'].includes(line)) {
          rl.close();
          await new Promise<void>(r => rl.on('close', r));
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

    if (result === 'exit') running = false;
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

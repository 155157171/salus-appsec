#!/usr/bin/env node
import { Command } from 'commander';
import { configCommand } from './commands/config.js';
import { analyzeCommand, redTeamCommand, hardenCommand, aiSecurityCommand } from './commands/analyze.js';
import { startREPL } from './ui/repl.js';
const program = new Command();
program
    .name('salus')
    .description('Salus — CLI de AppSec com IA (BYOK)\n' +
    'Ferramenta de revisão de código, análise de arquitetura e segurança.\n' +
    'Modo BYOK (Bring Your Own Key): use sua própria API Key OpenAI.')
    .version('1.0.9')
    .addHelpText('after', '\nEXEMPLOS:\n' +
    '  $ salus                  Inicia o terminal interativo (REPL)\n' +
    '  $ salus config           Configura sua API Key OpenAI\n' +
    '  $ salus analyze          Varredura de vulnerabilidades (CVSS/EPSS/KEV)\n' +
    '  $ salus redteam          Análise ofensiva (kill chain, MITRE ATT&CK)\n' +
    '  $ salus harden           Hardening defensivo (defense-in-depth, CIS)\n' +
    '  $ salus aisec            Auditoria de segurança AI/LLM (OWASP Top 10)\n' +
    '\nSAÍDA: Cada comando gera um relatório Markdown na raiz do projeto.\n' +
    '  analyze → security-report.md\n' +
    '  redteam → red-team-report.md\n' +
    '  harden  → defense-hardening-report.md\n' +
    '  aisec   → ai-security-report.md\n');
program
    .command('config')
    .description('Configura o provedor LLM e a API Key.\n' +
    'Provedores suportados: OpenAI, Anthropic, OpenRouter.\n' +
    'A chave é armazenada localmente em ~/.salus/config.json.')
    .action(async () => {
    try {
        await configCommand();
        await startREPL();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
program
    .command('analyze')
    .description('Varredura completa de vulnerabilidades de segurança.\n' +
    'Motor: VULNERABILITY_SCAN_PROMPT.\n' +
    'Foco: OWASP Top 10, CVEs, dependências desatualizadas, configurações\n' +
    'inseguras (Nginx, SSH, Docker, Kubernetes), CVSS 4.0/3.1, EPSS,\n' +
    'CISA KEV, SBOM + VEX, Reachability Analysis, secrets hardcoded.\n' +
    'Gera security-report.md e oferece auto-fix interativo.')
    .action(async () => {
    try {
        await analyzeCommand();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
program
    .command('redteam')
    .description('Análise ofensiva com mindset Red Team.\n' +
    'Motor: RED_TEAM_PROMPT.\n' +
    'Foco: Kill chain completa (11 fases), MITRE ATT&CK mapping, vetores de\n' +
    'ataque (SQLi, XSS, SSRF, RCE, IDOR, race conditions, auth bypass),\n' +
    'lateral movement, privilege escalation, defesa evasion, OPSEC failures,\n' +
    'AD attack paths, cloud/metadata exploitation.\n' +
    'Gera red-team-report.md e oferece mitigação interativa.')
    .action(async () => {
    try {
        await redTeamCommand();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
program
    .command('harden')
    .description('Hardening defensivo com mindset Blue Team.\n' +
    'Motor: BLUE_TEAM_PROMPT.\n' +
    'Foco: Defense-in-depth (6 camadas), CIS Benchmarks, OWASP ASVS,\n' +
    'input validation, output encoding, CSP/CORS/security headers,\n' +
    'rate limiting, MFA, password hashing (bcrypt/argon2), TLS 1.3,\n' +
    'container hardening, logging & audit trail, secrets management.\n' +
    'Gera defense-hardening-report.md e aplica correções automaticamente.')
    .action(async () => {
    try {
        await hardenCommand();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
program
    .command('aisec')
    .description('Auditoria de segurança para aplicações AI/LLM.\n' +
    'Motor: AI_SECURITY_PROMPT.\n' +
    'Foco: OWASP Top 10 for LLM Applications (2025), MITRE ATLAS,\n' +
    'prompt injection (direto/indireto/encoding/multi-turn), jailbreak,\n' +
    'RAG/vector store security, agent & tool-use security (MCP),\n' +
    'model supply chain (pickle/safetensors), guardrails & output handling.\n' +
    'Gera ai-security-report.md e sugere correções para cada LLM risk.')
    .action(async () => {
    try {
        await aiSecurityCommand();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
program
    .command('repl', { isDefault: true })
    .description('Terminal interativo contínuo (REPL) do Salus.\n' +
    'Comandos internos:\n' +
    '  /analyze  ou /a   — varredura de vulnerabilidades\n' +
    '  /redteam  ou /rt  — análise ofensiva Red Team\n' +
    '  /harden   ou /hd  — hardening defensivo Blue Team\n' +
    '  /aisec    ou /ai  — auditoria AI/LLM Security\n' +
    '  /config   ou /c   — configurar API Key\n' +
    '  /help     ou /h   — mostrar ajuda\n' +
    '  /exit     ou /q   — sair\n' +
    '  Ctrl+C            — sair')
    .action(async () => {
    try {
        await startREPL();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
program.parseAsync().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
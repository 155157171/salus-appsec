import { resolve } from 'path';
import { writeFileSync } from 'fs';
import chalk from 'chalk';
import { spinner, confirm, isCancel, log } from '@clack/prompts';
import { getCredentials } from '../utils/config-store.js';
import { audit } from '../utils/logger.js';
import { scanProject } from '../core/scanner.js';
import { analyzeWithAI, analyzeWithRedTeam, analyzeWithBlueTeam, analyzeWithAISecurity, analyzeWithWebSecurity } from '../core/ai-adapter.js';
import { applyFix } from '../core/patcher.js';
async function runAnalysis(rootDir, mode) {
    const { provider, apiKey, model } = getCredentials();
    if (!provider || !apiKey || !model) {
        throw new Error('Configuração incompleta. Execute "salus config" primeiro.');
    }
    const codeXml = await scanProject(rootDir);
    let vulnerabilities;
    if (mode === 'redteam') {
        vulnerabilities = await analyzeWithRedTeam(provider, apiKey, model, codeXml);
    }
    else if (mode === 'blueteam') {
        vulnerabilities = await analyzeWithBlueTeam(provider, apiKey, model, codeXml);
    }
    else if (mode === 'aisec') {
        vulnerabilities = await analyzeWithAISecurity(provider, apiKey, model, codeXml);
    }
    else if (mode === 'websec') {
        vulnerabilities = await analyzeWithWebSecurity(provider, apiKey, model, codeXml);
    }
    else {
        vulnerabilities = await analyzeWithAI(provider, apiKey, model, codeXml);
    }
    const rawJson = JSON.stringify(vulnerabilities, null, 2);
    const markdownReport = buildReport(vulnerabilities, mode);
    let filename;
    if (mode === 'redteam') {
        filename = 'red-team-report.md';
    }
    else if (mode === 'blueteam') {
        filename = 'defense-hardening-report.md';
    }
    else if (mode === 'aisec') {
        filename = 'ai-security-report.md';
    }
    else if (mode === 'websec') {
        filename = 'web-security-report.md';
    }
    else {
        filename = 'security-report.md';
    }
    const reportPath = resolve(rootDir, filename);
    writeFileSync(reportPath, markdownReport, 'utf-8');
    return { markdownReport, vulnerabilities, rawResponse: rawJson };
}
export async function runAnalysisCLI(rootDir) {
    return runAnalysis(rootDir, 'vuln');
}
export async function runRedTeamAnalysis(rootDir) {
    return runAnalysis(rootDir, 'redteam');
}
export async function runBlueTeamHardening(rootDir) {
    return runAnalysis(rootDir, 'blueteam');
}
export async function runAISecurityAudit(rootDir) {
    return runAnalysis(rootDir, 'aisec');
}
export async function runWebSecurityAudit(rootDir) {
    return runAnalysis(rootDir, 'websec');
}
function showAutoFixDisclaimer() {
    console.log('');
    console.log(chalk.hex('#FF1A1A').bold('  ═══════════════════════════════════════════'));
    console.log(chalk.hex('#FF1A1A').bold('    ⚠  ATENÇÃO — AUTO-FIX EM ANDAMENTO  ⚠'));
    console.log(chalk.hex('#FF1A1A').bold('  ═══════════════════════════════════════════'));
    console.log('');
    console.log(chalk.hex('#FF4444')('  Este processo modificará arquivos do seu projeto.'));
    console.log(chalk.hex('#FF4444')('  ANTES de continuar, certifique-se de:'));
    console.log('');
    console.log(chalk.hex('#FF6600')('    1. Fazer um BACKUP COMPLETO (git commit ou cópia)'));
    console.log(chalk.hex('#FF6600')('    2. Revisar todas as alterações antes de aplicá-las'));
    console.log(chalk.hex('#FF6600')('    3. Testar a aplicação após as correções'));
    console.log(chalk.hex('#FF6600')('    4. Executar sua suíte de testes'));
    console.log('');
    console.log(chalk.hex('#555555')('  O Salus faz backup automático em ~/.salus/backups/.'));
    console.log(chalk.hex('#555555')('  Você pode reverter com: git checkout -- <arquivo>'));
    console.log('');
    return confirm({
        message: 'Deseja continuar com o auto-fix?',
        active: 'Sim, aplicar correções',
        inactive: 'Não, apenas gerar relatório',
        initialValue: false,
    });
}
async function applyFixesInteractively(rootDir, vulnerabilities) {
    if (vulnerabilities.length === 0) {
        log.success('Nenhum vetor de ataque encontrado.');
        return;
    }
    const shouldProceed = await showAutoFixDisclaimer();
    if (isCancel(shouldProceed) || !shouldProceed) {
        log.warn('Auto-fix cancelado. Apenas o relatório foi gerado.');
        return;
    }
    console.log('');
    log.warn(`Encontrados ${vulnerabilities.length} vetores de ataque.`);
    console.log('');
    for (const v of vulnerabilities) {
        const sevColor = v.severidade === 'CRITICAL' ? chalk.hex('#FF0000').bold :
            v.severidade === 'HIGH' ? chalk.hex('#FF3333').bold :
                v.severidade === 'MEDIUM' ? chalk.hex('#FF6600') :
                    chalk.hex('#555555');
        console.log(sevColor.bold(`  [${v.severidade}] ${v.id_vulnerabilidade}`));
        console.log(chalk.gray(`  Arquivo: ${v.arquivo}`));
        console.log(chalk.white(`  ${v.descricao}`));
        console.log('');
        if (v.codigo_novo_sugerido) {
            const shouldFix = await confirm({
                message: `Deseja aplicar a mitigação no arquivo ${v.arquivo}?`,
            });
            if (isCancel(shouldFix)) {
                log.warn('Correção cancelada pelo usuário.');
                break;
            }
            if (shouldFix) {
                try {
                    const fullPath = resolve(rootDir, v.arquivo);
                    await applyFix(fullPath, v.codigo_antigo, v.codigo_novo_sugerido);
                    log.success(`${v.id_vulnerabilidade} aplicada em ${v.arquivo}`);
                }
                catch (err) {
                    log.error(`Falha ao aplicar ${v.id_vulnerabilidade}: ${err.message}`);
                }
            }
        }
    }
}
async function commandRunner(mode, label) {
    const { provider, apiKey, model } = getCredentials();
    if (!provider || !apiKey || !model) {
        log.error('Configuração incompleta (provider, apiKey ou model ausente). Execute: salus config');
        process.exit(1);
    }
    const rootDir = process.cwd();
    audit(`analysis:start mode=${mode} dir=${rootDir} provider=${provider} model=${model}`);
    const s = spinner();
    s.start('Mapeando arquitetura e arquivos...');
    let codeXml;
    try {
        codeXml = await scanProject(rootDir);
    }
    catch (err) {
        s.stop(`Falha ao escanear: ${err.message}`);
        process.exit(1);
    }
    s.message(`Analisando vulnerabilidades usando o modelo ${model}...`);
    let vulnerabilities;
    try {
        vulnerabilities =
            mode === 'redteam'
                ? await analyzeWithRedTeam(provider, apiKey, model, codeXml)
                : mode === 'blueteam'
                    ? await analyzeWithBlueTeam(provider, apiKey, model, codeXml)
                    : mode === 'aisec'
                        ? await analyzeWithAISecurity(provider, apiKey, model, codeXml)
                        : mode === 'websec'
                            ? await analyzeWithWebSecurity(provider, apiKey, model, codeXml)
                            : await analyzeWithAI(provider, apiKey, model, codeXml);
    }
    catch (err) {
        s.stop(`Falha na análise: ${err.message}`);
        process.exit(1);
    }
    s.stop('Análise concluída');
    audit(`analysis:complete mode=${mode} findings=${vulnerabilities.length} model=${model}`);
    const markdownReport = buildReport(vulnerabilities, mode);
    let filename;
    if (mode === 'redteam') {
        filename = 'red-team-report.md';
    }
    else if (mode === 'blueteam') {
        filename = 'defense-hardening-report.md';
    }
    else if (mode === 'aisec') {
        filename = 'ai-security-report.md';
    }
    else if (mode === 'websec') {
        filename = 'web-security-report.md';
    }
    else {
        filename = 'security-report.md';
    }
    const reportPath = resolve(rootDir, filename);
    writeFileSync(reportPath, markdownReport, 'utf-8');
    log.success(`Relatório salvo em: ${reportPath}`);
    await applyFixesInteractively(rootDir, vulnerabilities);
    console.log('');
    log.success('Processo de análise e correção finalizado.');
}
export async function analyzeCommand() {
    await commandRunner('vuln', 'Analisando vulnerabilidades (CVSS/EPSS) com IA...');
}
export async function redTeamCommand() {
    await commandRunner('redteam', 'Analisando vetores de ataque com mindset Red Team...');
}
export async function hardenCommand() {
    await commandRunner('blueteam', 'Aplicando hardening defensivo (Blue Team)...');
}
export async function aiSecurityCommand() {
    await commandRunner('aisec', 'Analisando segurança AI/LLM (OWASP LLM Top 10)...');
}
export async function webSecurityCommand() {
    await commandRunner('websec', 'Analisando vulnerabilidades web (OWASP, injections, API)...');
}
function buildReport(vulnerabilities, mode) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let title;
    let subtitle;
    let emptyMessage;
    if (mode === 'redteam') {
        title = 'Relatório Red Team — Salus';
        subtitle = '**Motor:** RED_TEAM_PROMPT (MITRE ATT&CK, Kill Chain, Lateral Movement)';
        emptyMessage = 'A IA não identificou vetores de ataque exploráveis.\n\n';
    }
    else if (mode === 'blueteam') {
        title = 'Relatório de Hardening Defensivo — Salus';
        subtitle = '**Motor:** BLUE_TEAM_PROMPT (Defense-in-Depth, CIS Benchmarks, OWASP ASVS)';
        emptyMessage = 'A IA não identificou ações de hardening necessárias.\n\n';
    }
    else if (mode === 'aisec') {
        title = 'Relatório de AI/LLM Security — Salus';
        subtitle = '**Motor:** AI_SECURITY_PROMPT (OWASP LLM Top 10 2025, MITRE ATLAS)';
        emptyMessage = 'A IA não identificou riscos de AI/LLM security.\n\n';
    }
    else if (mode === 'websec') {
        title = 'Relatório de Web Security — Salus';
        subtitle = '**Motor:** WEB_SECURITY_PROMPT (OWASP Top 10, API Security, Injection Testing)';
        emptyMessage = 'A IA não identificou vulnerabilidades web no código analisado.\n\n';
    }
    else {
        title = 'Relatório de Segurança — Salus';
        subtitle = '**Motor:** VULNERABILITY_SCAN_PROMPT (CVSS 4.0, EPSS, KEV)';
        emptyMessage = 'A IA não identificou problemas de segurança no código analisado.\n\n';
    }
    let md = `# ${title}\n\n`;
    md += `**Data:** ${now}\n`;
    md += `${subtitle}\n`;
    md += `**Total de findings:** ${vulnerabilities.length}\n\n`;
    md += `---\n\n`;
    if (vulnerabilities.length === 0) {
        md += `## ✅ ${emptyMessage}\n`;
    }
    else {
        const severityCount = {};
        for (const v of vulnerabilities) {
            severityCount[v.severidade] = (severityCount[v.severidade] || 0) + 1;
        }
        md += `## Resumo por Severidade\n\n`;
        md += `| Severidade | Quantidade |\n`;
        md += `|------------|------------|\n`;
        md += `| 🔴 CRITICAL  | ${severityCount['CRITICAL'] || 0} |\n`;
        md += `| 🔴 HIGH      | ${severityCount['HIGH'] || 0} |\n`;
        md += `| 🟡 MEDIUM    | ${severityCount['MEDIUM'] || 0} |\n`;
        md += `| 🟢 LOW       | ${severityCount['LOW'] || 0} |\n\n`;
        md += `---\n\n`;
        md += `## Findings\n\n`;
        for (const v of vulnerabilities) {
            const sevEmoji = {
                CRITICAL: '🔴',
                HIGH: '🔴',
                MEDIUM: '🟡',
                LOW: '🟢',
            };
            md += `### ${sevEmoji[v.severidade] || ''} ${v.id_vulnerabilidade} — ${v.severidade}\n\n`;
            md += `- **Arquivo:** \`${v.arquivo}\`\n`;
            md += `- **Descrição:** ${v.descricao}\n`;
            if (v.codigo_antigo) {
                const lang = v.arquivo.split('.').pop() || '';
                md += `\n**Código vulnerável:**\n`;
                md += `\`\`\`${lang}\n${v.codigo_antigo}\n\`\`\`\n`;
            }
            if (v.codigo_novo_sugerido) {
                const lang = v.arquivo.split('.').pop() || '';
                md += `\n**Sugestão de mitigação:**\n`;
                md += `\`\`\`${lang}\n${v.codigo_novo_sugerido}\n\`\`\`\n`;
            }
            md += `\n---\n\n`;
        }
    }
    return md;
}
//# sourceMappingURL=analyze.js.map
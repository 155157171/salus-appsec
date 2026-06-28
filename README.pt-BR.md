<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/EN-🇺🇸-FF1A1A?style=flat-square" alt="English"></a>
  <a href="README.pt-BR.md"><img src="https://img.shields.io/badge/PT--BR-🇧🇷-FF1A1A?style=flat-square" alt="Português"></a>
  <a href="README.es.md"><img src="https://img.shields.io/badge/ES-🇪🇸-FF1A1A?style=flat-square" alt="Español"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/salus-appsec?color=%23FF1A1A&style=for-the-badge" alt="npm version">
  <img src="https://img.shields.io/npm/l/salus-appsec?color=%23FF1A1A&style=for-the-badge" alt="license">
  <img src="https://img.shields.io/node/v/salus-appsec?color=%23FF1A1A&style=for-the-badge" alt="node version">
</p>

<p align="center">
  <img src="logo.png" alt="Salus" width="180">
</p>

<h1 align="center">Salus</h1>
<p align="center"><strong>Seu especialista em AppSec rodando no terminal.</strong></p>
<p align="center">Code Review · Vulnerability Scanner · Red Team · Blue Team · AI/LLM Security</p>
<p align="center"><sub>Projeto open-source desenvolvido pela <strong><a href="https://github.com/155157171">Oryn Labs</a></strong></sub></p>

---

## Sobre

**Salus** é um CLI de segurança de aplicações com inteligência artificial.  
Ele escaneia seu projeto, envia o contexto estruturado para uma LLM (BYOK — _Bring Your Own Key_),
gera um relatório completo de vulnerabilidades e aplica correções automaticamente
**sem alterar suas regras de negócio**.

Quatro motores de análise em uma ferramenta:

| Modo | Comando | Foco |
|------|---------|------|
| **Vulnerability Scanner** | `salus analyze` | OWASP Top 10, CVEs, CVSS 4.0, EPSS, CISA KEV, SBOM + VEX, Reachability |
| **Red Team** | `salus redteam` | Kill chain, MITRE ATT&CK, pontos de injeção, lateral movement, privilege escalation |
| **Blue Team** | `salus harden` | Defense-in-depth, CIS Benchmarks, security headers, rate limiting, hardening cripto |
| **AI/LLM Security** | `salus aisec` | OWASP LLM Top 10 2025, prompt injection, RAG, segurança de agentes/MCP |

---

## Instalação

```bash
npm install -g salus-appsec
```

**Pré-requisitos:** Node.js ≥ 20.

---

## Configuração (BYOK)

O Salus usa o modelo **Bring Your Own Key** — você fornece sua própria API Key da OpenAI.
A chave é armazenada localmente em `~/.salus/config.json` com permissões restritas.

```bash
salus config
```

Suporte a variáveis de ambiente para CI/CD:

```bash
export SALUS_OPENAI_API_KEY="sk-..."
export SALUS_OPENAI_MODEL="gpt-4o"
```

---

## Como usar

### Terminal interativo (REPL)

```bash
salus
```

Isso abre um prompt contínuo onde você pode digitar comandos:

```
salus › /analyze    # varredura de vulnerabilidades
salus › /redteam    # análise ofensiva
salus › /harden     # hardening defensivo
salus › /aisec      # auditoria AI/LLM
salus › /config     # configurar API Key
salus › /help       # ajuda
salus › /exit       # sair
```

### Comandos diretos

```bash
salus analyze              # Varredura OWASP + CVSS + EPSS + KEV
salus redteam              # Análise Red Team (kill chain, ATT&CK)
salus harden               # Hardening Blue Team (defense-in-depth)
salus aisec                # Auditoria AI/LLM (OWASP LLM Top 10)
```

### Saída

Cada comando gera um relatório Markdown na raiz do projeto:

```
analyze  →  security-report.md
redteam  →  red-team-report.md
harden   →  defense-hardening-report.md
aisec    →  ai-security-report.md
```

Após a geração, o Salus pergunta interativamente se você deseja aplicar as correções sugeridas — com backup automático antes de cada patch.

---

## Features

### Vulnerability Scanner
- **OWASP Top 10** completo com CVSS 4.0/3.1 e vector strings
- **EPSS** (Exploit Prediction Scoring System) + catálogo **CISA KEV**
- **SBOM + VEX** — software bill of materials com statements `affected / not_affected / fixed`
- **Reachability Analysis** — a função vulnerável é realmente chamada?
- Auditoria de dependências (`package.json`, `requirements.txt`, `go.mod`, `pom.xml`, `Cargo.toml`)
- Revisão de config: Nginx, SSH, Docker, Kubernetes com CIS Benchmarks

### Red Team
- **Kill chain** completa (11 fases) com MITRE ATT&CK mapping
- Pontos de injeção, auth bypass, SSRF, RCE, IDOR, race conditions
- Lateral movement, privilege escalation, defense evasion, falhas de OPSEC
- AD attack paths, exploração de cloud/metadata

### Blue Team
- **Defense-in-depth** (6 camadas): perímetro → aplicação → auth → dados → infra → observabilidade
- CIS Benchmarks para Node.js, Nginx, Docker, Kubernetes, PostgreSQL
- Security headers (CSP, HSTS, X-Frame-Options), rate limiting, MFA
- Password hashing (bcrypt/argon2), TLS 1.3, container hardening
- Logging estruturado, audit trail, gerenciamento de secrets

### AI/LLM Security
- **OWASP Top 10 for LLM Applications (2025)** + MITRE ATLAS
- Prompt injection (direto, indireto, encoding, multi-turn, crescendo)
- Segurança de RAG/vector store, agentes e tools (MCP)
- Model supply chain (pickle/safetensors), guardrails & output handling

### Auto-Fix Inteligente
- Backup automático antes de cada patch (`~/.salus/backups/`)
- Substituição de múltiplas ocorrências
- Validação de schema do output da IA
- Detecção de padrões perigosos no código sugerido
- Preservação estrita da lógica de negócio

---

## Segurança do próprio Salus

O Salus foi auditado com... o próprio Salus. Todos os 4 motores de análise foram aplicados
ao código-fonte da ferramenta e as correções foram implementadas:

- Anti prompt-injection em todos os system prompts
- Validação de schema no output da IA
- Redação de secrets em logs e auditoria
- Boundary demarcation (`<CODE_ANALYSIS_BOUNDARY>`) no input da LLM
- Permissões restritas no config (`0700`/`0600`)
- Limites de contexto no scanner
- Tracking de tokens e estimativa de custo

---

## Contribuindo

```bash
git clone https://github.com/155157171/salus-appsec
cd salus-appsec
npm install
npm run build
node dist/index.js
```

---

## Licença

MIT © Salus AppSec

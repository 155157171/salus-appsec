<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/EN-🇺🇸-FF1A1A?style=flat-square" alt="English"></a>
  <a href="README.pt-BR.md"><img src="https://img.shields.io/badge/PT--BR-🇧🇷-FF1A1A?style=flat-square" alt="Português"></a>
  <a href="README.es.md"><img src="https://img.shields.io/badge/ES-🇪🇸-FF1A1A?style=flat-square" alt="Español"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/salus-appsec?color=%23FF1A1A&style=for-the-badge" alt="npm version">
  <img src="https://img.shields.io/npm/l/salus-appsec?color=%23FF1A1A&style=for-the-badge" alt="license">
  <img src="https://img.shields.io/node/v/salus-appsec?color=%23FF1A1A&style=for-the-badge" alt="node version">
  <img src="https://img.shields.io/badge/LLMs-OpenAI_|_Anthropic_|_OpenRouter-FF1A1A?style=for-the-badge" alt="providers">
</p>

<p align="center">
  <img src="logo.png" alt="Salus" width="180">
</p>

<h1 align="center">Salus</h1>
<p align="center"><strong>Your AppSec specialist running in the terminal.</strong></p>
<p align="center">Code Review · Vulnerability Scanner · Red Team · Blue Team · AI/LLM · Web Security</p>
<p align="center"><sub>Open-source project developed by <strong><a href="https://github.com/155157171">Oryn Labs</a></strong></sub></p>

---

## About

**Salus** is an AI-powered Application Security CLI.  
It scans your project, sends structured context to an LLM (BYOK — _Bring Your Own Key_),
generates a comprehensive vulnerability report, and applies fixes automatically
**without altering your business logic**.

Six analysis engines in one tool:

| Mode | Command | Focus |
|------|---------|-------|
| **Vulnerability Scanner** | `salus analyze` | OWASP Top 10, CVEs, CVSS 4.0, EPSS, CISA KEV, SBOM + VEX, Reachability |
| **Red Team** | `salus redteam` | Kill chain, MITRE ATT&CK, injection points, lateral movement, privilege escalation |
| **Blue Team** | `salus harden` | Defense-in-depth, CIS Benchmarks, security headers, rate limiting, crypto hardening |
| **AI/LLM Security** | `salus aisec` | OWASP LLM Top 10 2025, prompt injection, RAG, agent/MCP security |
| **Web Security** | `salus websec` | OWASP Top 10 2021, SQLi, XSS, SSRF, SSTI, auth bypass, payment bypass |

---

## Installation

```bash
npm install -g salus-appsec
```

**Requirements:** Node.js ≥ 20.

---

## Configuration (BYOK)

Salus supports **3 LLM providers** — choose the one you prefer:

| Provider | Prefix | Default Model |
|----------|--------|---------------|
| **OpenAI** | `sk-proj-...` | `gpt-5.5-pro` |
| **Anthropic** | `sk-ant-...` | `claude-4-8-opus-latest` |
| **OpenRouter** | `sk-or-...` | User-selectable (e.g. `anthropic/claude-4.8-opus`, `google/gemini-2.5-pro`, `meta-llama/llama-4-70b-instruct`) |

The key is stored locally in `~/.salus/config.json` with restrictive permissions (`0700`/`0600`).

```bash
salus config
```

Environment variable support for CI/CD:

```bash
export SALUS_OPENAI_API_KEY="sk-..."
export SALUS_OPENAI_MODEL="gpt-4o"
```

---

## Usage

### Interactive Terminal (REPL)

```bash
salus
```

This opens a continuous prompt where you can type commands:

```
salus › /analyze    # vulnerability scan
salus › /redteam    # offensive analysis
salus › /harden     # defensive hardening
salus › /aisec      # AI/LLM audit
salus › /websec     # web/API security
salus › /config     # configure provider + API key
salus › /help       # help
salus › /exit       # quit
```

### Direct Commands

```bash
salus analyze              # OWASP + CVSS + EPSS + KEV scan
salus redteam              # Red Team analysis (kill chain, ATT&CK)
salus harden               # Blue Team hardening (defense-in-depth)
salus aisec                # AI/LLM audit (OWASP LLM Top 10)
salus websec               # Web/API security (OWASP, SQLi, XSS, SSRF)
```

### Output

Each command generates a Markdown report in the project root:

```
analyze  →  security-report.md
redteam  →  red-team-report.md
harden   →  defense-hardening-report.md
aisec    →  ai-security-report.md
websec   →  web-security-report.md
```

---

## Features

### Vulnerability Scanner
- Full **OWASP Top 10** with CVSS 4.0/3.1 and vector strings
- **EPSS** (Exploit Prediction Scoring System) + **CISA KEV** catalog
- **SBOM + VEX** — software bill of materials with `affected / not_affected / fixed` statements
- **Reachability Analysis** — is the vulnerable function actually called?
- Dependency auditing (`package.json`, `requirements.txt`, `go.mod`, `pom.xml`, `Cargo.toml`)
- Config review: Nginx, SSH, Docker, Kubernetes with CIS Benchmarks

### Red Team
- Complete **kill chain** (11 phases) with MITRE ATT&CK mapping
- Injection points, auth bypass, SSRF, RCE, IDOR, race conditions
- Lateral movement, privilege escalation, defense evasion, OPSEC failures
- AD attack paths, cloud/metadata exploitation

### Blue Team
- **Defense-in-depth** (6 layers): perimeter → application → auth → data → infra → observability
- CIS Benchmarks for Node.js, Nginx, Docker, Kubernetes, PostgreSQL
- Security headers (CSP, HSTS, X-Frame-Options), rate limiting, MFA
- Password hashing (bcrypt/argon2), TLS 1.3, container hardening
- Structured logging, audit trail, secrets management

### AI/LLM Security
- **OWASP Top 10 for LLM Applications (2025)** + MITRE ATLAS
- Prompt injection (direct, indirect, encoding, multi-turn, crescendo)
- RAG/vector store security, agent & tool-use security (MCP)
- Model supply chain (pickle/safetensors), guardrails & output handling

### Web Security
- **OWASP Top 10 (2021)** — A01 to A10 with CWE mapping
- SQL Injection, XSS (per context), Command Injection, SSRF, SSTI per engine
- API Security: BOLA/IDOR, mass assignment, GraphQL, JWT attacks
- Authentication bypass, session flaws, OAuth/OIDC review
- Payment bypass: race conditions, price manipulation, coupon abuse
- CORS/CSP/Security Headers misconfiguration

### Anti-Hallucination Auto-Fix
Salus is the **only CLI with a dedicated anti-hallucination engine**. Before applying any fix:
1. Re-reads the entire codebase for context
2. Validates that the vulnerable code actually exists textually
3. Classifies each finding as `FIXED`, `FALSE_POSITIVE`, or `NEEDS_MANUAL_REVIEW`
4. Generates the **smallest possible change** that eliminates the vulnerability
5. Preserves 100% of business logic, comments, and code style
- Automatic backup before each patch (`~/.salus/backups/`)
- Multi-occurrence replacement (`replaceAll`)
- AI output schema validation + dangerous pattern detection
- Pre-fix disclaimer: ⚠ _FAÇA BACKUP ANTES DO AUTO-FIX_

---

## Salus Security

Salus was audited with... Salus itself. All analysis engines were applied to
the tool's source code and fixes were implemented:

- Anti prompt-injection in all system prompts
- Schema validation on AI output
- Secrets redaction in logs and audit trail
- Boundary demarcation (`<CODE_ANALYSIS_BOUNDARY>`) on LLM input
- Restrictive file permissions on config (`0700`/`0600`)
- Context size limits in the scanner
- Token usage tracking and cost estimation

---

## Contributing

```bash
git clone https://github.com/155157171/salus-appsec
cd salus-appsec
npm install
npm run build
node dist/index.js
```

---

## License

MIT © Salus AppSec

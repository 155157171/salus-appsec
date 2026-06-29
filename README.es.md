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
<p align="center"><strong>Tu especialista en AppSec ejecutándose en la terminal.</strong></p>
<p align="center">Code Review · Vulnerability Scanner · Red Team · Blue Team · AI/LLM · Web Security</p>
<p align="center"><sub>Proyecto open-source desarrollado por <strong><a href="https://github.com/155157171">Oryn Labs</a></strong></sub></p>

---

## Acerca de

**Salus** es un CLI de seguridad de aplicaciones con inteligencia artificial.  
Escanea tu proyecto, envía el contexto estructurado a un LLM (BYOK — _Bring Your Own Key_),
genera un informe completo de vulnerabilidades y aplica correcciones automáticamente
**sin alterar tu lógica de negocio**.

Seis motores de análisis en una herramienta:

| Modo | Comando | Enfoque |
|------|---------|---------|
| **Vulnerability Scanner** | `salus analyze` | OWASP Top 10, CVEs, CVSS 4.0, EPSS, CISA KEV, SBOM + VEX, Reachability |
| **Red Team** | `salus redteam` | Kill chain, MITRE ATT&CK, puntos de inyección, lateral movement, privilege escalation |
| **Blue Team** | `salus harden` | Defense-in-depth, CIS Benchmarks, security headers, rate limiting, hardening cripto |
| **AI/LLM Security** | `salus aisec` | OWASP LLM Top 10 2025, prompt injection, RAG, seguridad de agentes/MCP |
| **Web Security** | `salus websec` | OWASP Top 10 2021, SQLi, XSS, SSRF, SSTI, auth bypass, payment bypass |

---

## Instalación

```bash
npm install -g salus-appsec
```

**Requisitos:** Node.js ≥ 20.

---

## Configuración (BYOK)

Salus soporta **3 proveedores de LLM** — elige el tuyo:

| Proveedor | Prefijo | Modelos |
|-----------|---------|---------|
| **OpenAI** | `sk-proj-...` | gpt-4.1, gpt-4.1-mini |
| **Anthropic** | `sk-ant-...` | claude-sonnet-4-20250514 |
| **OpenRouter** | `sk-or-...` | anthropic/claude-sonnet-4 |

La clave se almacena en `~/.salus/config.json` con permisos restrictivos (`0700`/`0600`).

```bash
salus config
```

Soporte de variables de entorno para CI/CD:

```bash
export SALUS_OPENAI_API_KEY="sk-..."
export SALUS_OPENAI_MODEL="gpt-4o"
```

---

## Uso

### Terminal interactivo (REPL)

```bash
salus
```

Esto abre un prompt continuo donde puedes escribir comandos:

```
salus › /analyze    # escaneo de vulnerabilidades
salus › /redteam    # análisis ofensivo
salus › /harden     # hardening defensivo
salus › /aisec      # auditoría AI/LLM
salus › /websec     # seguridad web/API
salus › /config     # configurar proveedor + API Key
salus › /help       # ayuda
salus › /exit       # salir
```

### Comandos directos

```bash
salus analyze              # Escaneo OWASP + CVSS + EPSS + KEV
salus redteam              # Análisis Red Team (kill chain, ATT&CK)
salus harden               # Hardening Blue Team (defense-in-depth)
salus aisec                # Auditoría AI/LLM (OWASP LLM Top 10)
salus websec               # Seguridad web/API (OWASP, SQLi, XSS, SSRF)
```

### Salida

Cada comando genera un informe Markdown en la raíz del proyecto:

```
analyze  →  security-report.md
redteam  →  red-team-report.md
harden   →  defense-hardening-report.md
aisec    →  ai-security-report.md
websec   →  web-security-report.md
```

---

## Funcionalidades

### Vulnerability Scanner
- **OWASP Top 10** completo con CVSS 4.0/3.1 y vector strings
- **EPSS** (Exploit Prediction Scoring System) + catálogo **CISA KEV**
- **SBOM + VEX** — software bill of materials con declaraciones `affected / not_affected / fixed`
- **Reachability Analysis** — ¿se llama realmente a la función vulnerable?
- Auditoría de dependencias (`package.json`, `requirements.txt`, `go.mod`, `pom.xml`, `Cargo.toml`)
- Revisión de config: Nginx, SSH, Docker, Kubernetes con CIS Benchmarks

### Red Team
- **Kill chain** completa (11 fases) con mapeo MITRE ATT&CK
- Puntos de inyección, auth bypass, SSRF, RCE, IDOR, race conditions
- Lateral movement, privilege escalation, defense evasion, fallos de OPSEC
- Rutas de ataque AD, explotación de cloud/metadata

### Blue Team
- **Defense-in-depth** (6 capas): perímetro → aplicación → auth → datos → infra → observabilidad
- CIS Benchmarks para Node.js, Nginx, Docker, Kubernetes, PostgreSQL
- Security headers (CSP, HSTS, X-Frame-Options), rate limiting, MFA
- Password hashing (bcrypt/argon2), TLS 1.3, container hardening
- Logging estructurado, audit trail, gestión de secrets

### AI/LLM Security
- **OWASP Top 10 for LLM Applications (2025)** + MITRE ATLAS
- Prompt injection (directo, indirecto, encoding, multi-turn, crescendo)
- Seguridad de RAG/vector store, agentes y tools (MCP)
- Model supply chain (pickle/safetensors), guardrails & output handling

### Web Security
- **OWASP Top 10 (2021)** — A01 a A10 con mapeo CWE
- SQL Injection, XSS (por contexto), Command Injection, SSRF, SSTI por engine
- Seguridad de API: BOLA/IDOR, mass assignment, GraphQL, ataques JWT
- Bypass de autenticación, fallos de sesión, revisión OAuth/OIDC
- Bypass de pago: race conditions, manipulación de precios, abuso de cupones
- CORS/CSP/Security Headers: configuraciones incorrectas

### Auto-Fix Anti-Alucinación
Salus es la **única CLI con motor anti-alucinación dedicado**. Antes de aplicar cualquier corrección:
1. Re-lee todo el código fuente para contexto completo
2. Valida que el código vulnerable existe textualmente en el archivo
3. Clasifica cada finding como `FIXED`, `FALSE_POSITIVE` o `NEEDS_MANUAL_REVIEW`
4. Genera el **cambio más pequeño posible** que elimina la vulnerabilidad
5. Preserva 100% de la lógica de negocio, comentarios y estilo del código
- Backup automático antes de cada patch (`~/.salus/backups/`)
- Reemplazo de múltiples ocurrencias (`replaceAll`)
- Validación de schema del output de la IA + detección de patrones peligrosos
- Disclaimer pre-fix: ⚠ _HAZ BACKUP ANTES DEL AUTO-FIX_

---

## Seguridad del propio Salus

Salus fue auditado con... el propio Salus. Todos los motores de análisis se aplicaron al
código fuente de la herramienta y las correcciones fueron implementadas:

- Anti prompt-injection en todos los system prompts
- Validación de schema en el output de la IA
- Redacción de secrets en logs y auditoría
- Boundary demarcation (`<CODE_ANALYSIS_BOUNDARY>`) en el input del LLM
- Permisos restrictivos en config (`0700`/`0600`)
- Límites de contexto en el scanner
- Seguimiento de tokens y estimación de coste

---

## Contribuir

```bash
git clone https://github.com/155157171/salus-appsec
cd salus-appsec
npm install
npm run build
node dist/index.js
```

---

## Licencia

MIT © Salus AppSec

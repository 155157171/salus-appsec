import chalk from 'chalk';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LOG_DIR = join(homedir(), '.salus');
const LOG_PATH = join(LOG_DIR, 'audit.log');

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function writeAuditLog(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  try {
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true, mode: 0o700 });
    }
    const redacted = msg.replace(/sk-[a-zA-Z0-9]{20,}/g, 'sk-***REDACTED***');
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: redacted,
      ...meta,
    });
    appendFileSync(LOG_PATH, entry + '\n', 'utf-8');
  } catch {
    // silently fail if log cannot be written
  }
}

export function success(msg: string): void {
  console.log(chalk.hex('#FF3333')(`■ ${msg}`));
}

export function error(msg: string): void {
  writeAuditLog('ERROR', msg);
  console.log(chalk.hex('#FF0000').bold(`╳ ${msg}`));
}

export function warning(msg: string): void {
  writeAuditLog('WARN', msg);
  console.log(chalk.hex('#FF6600')(`▲ ${msg}`));
}

export function info(msg: string): void {
  console.log(chalk.hex('#CC3333').dim(`▸ ${msg}`));
}

export function dim(msg: string): void {
  console.log(chalk.hex('#555555')(msg));
}

export function debug(msg: string, meta?: Record<string, unknown>): void {
  if (process.env.SALUS_DEBUG) {
    console.log(chalk.hex('#660000')(`[DEBUG] ${msg}`));
  }
  writeAuditLog('DEBUG', msg, meta);
}

export function audit(action: string, meta?: Record<string, unknown>): void {
  writeAuditLog('INFO', action, meta);
}

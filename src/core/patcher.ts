import { readFile, writeFile, copyFile, mkdir } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

const BACKUP_DIR = join(homedir(), '.salus', 'backups');

export async function applyFix(
  filePath: string,
  oldCode: string,
  newCode: string,
): Promise<void> {
  const content = await readFile(filePath, 'utf-8');

  if (!content.includes(oldCode)) {
    throw new Error(
      `Trecho de código antigo não encontrado em "${filePath}". ` +
      `A correção não pôde ser aplicada automaticamente. ` +
      `Verifique o arquivo manualmente.`,
    );
  }

  const dir = dirname(filePath);
  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true, mode: 0o700 });
  }
  const backupId = randomUUID();
  const backupName = `${backupId}_${basename(filePath)}`;
  const backupPath = join(BACKUP_DIR, backupName);
  await copyFile(filePath, backupPath);

  const occurrences = content.split(oldCode).length - 1;
  const patched = content.split(oldCode).join(newCode);

  if (content === patched) {
    throw new Error(
      `Substituição não alterou o arquivo "${filePath}". ` +
      `Verifique se o trecho de código antigo corresponde exatamente ao conteúdo do arquivo.`,
    );
  }

  await writeFile(filePath, patched, 'utf-8');

  console.log(
    `[Salus] Backup salvo em: ${backupPath} ` +
    `(${occurrences} ocorrência(s) substituída(s))`,
  );
}

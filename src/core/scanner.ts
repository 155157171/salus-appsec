import fg from 'fast-glob';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';

const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.env',
  '**/.env.*',
  '**/*.env',
  '**/.env-*',
  '**/.env_*',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.nuxt/**',
  '**/coverage/**',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/security-report.md',
  '**/*.log',
  '**/*.bin',
  '**/*.exe',
  '**/*.dll',
  '**/*.so',
  '**/*.dylib',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.ico',
  '**/*.svg',
  '**/*.webp',
  '**/*.mp3',
  '**/*.mp4',
  '**/*.avi',
  '**/*.mov',
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.pdf',
  '**/*.zip',
  '**/*.tar',
  '**/*.gz',
  '**/*.rar',
  '**/*.7z',
];

const MAX_FILE_SIZE_BYTES = 200_000;
const MAX_FILES = 500;
const MAX_TOTAL_SIZE = 50_000_000; // 50 MB XML output limit

const BINARY_EXTENSIONS = new Set([
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'class',
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'webp', 'bmp', 'tiff',
  'mp3', 'mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'wav', 'ogg',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'pdf', 'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
]);

export async function scanProject(dir: string): Promise<string> {
  const files = await fg('**/*', {
    cwd: dir,
    ignore: IGNORE_PATTERNS,
    dot: false,
    absolute: false,
    onlyFiles: true,
  });

  const textFiles: string[] = [];
  let totalSize = 0;
  let skippedCount = 0;

  for (const file of files) {
    if (textFiles.length >= MAX_FILES) {
      skippedCount++;
      continue;
    }

    const ext = file.split('.').pop()?.toLowerCase() || '';
    if (BINARY_EXTENSIONS.has(ext)) {
      continue;
    }
    try {
      const fullPath = resolve(dir, file);
      const stats = statSync(fullPath);
      if (stats.size > MAX_FILE_SIZE_BYTES) {
        continue;
      }
      const content = readFileSync(fullPath, 'utf-8');
      const entry = `  <arquivo caminho="${escapeXml(file)}">${escapeXml(content)}</arquivo>`;
      totalSize += Buffer.byteLength(entry, 'utf-8');
      if (totalSize > MAX_TOTAL_SIZE) {
        skippedCount += files.length - files.indexOf(file);
        break;
      }
      textFiles.push(entry);
    } catch {
      // skip unreadable files
    }
  }

  const result = `<projeto>\n${textFiles.join('\n')}\n</projeto>`;

  if (skippedCount > 0) {
    console.warn(
      `[Salus] ${skippedCount} arquivo(s) ignorado(s) por limite de tamanho do projeto ` +
      `(max ${MAX_FILES} arquivos / ${(MAX_TOTAL_SIZE / 1_000_000).toFixed(0)} MB).`,
    );
  }

  if (textFiles.length === 0) {
    throw new Error('Nenhum arquivo válido encontrado para análise no diretório.');
  }

  console.log(
    `[Salus] ${textFiles.length} arquivo(s) escaneado(s) ` +
    `(${(totalSize / 1_000_000).toFixed(1)} MB).`,
  );

  return result;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

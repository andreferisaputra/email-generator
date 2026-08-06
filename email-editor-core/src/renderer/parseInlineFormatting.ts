/**
 * Converts the editor's compact inline tokens into email-safe HTML.
 * Raw text is escaped and only validated formatting and URLs are rendered.
 */

const TOKEN_PATTERN = /\{\{(bold|style|link):([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

interface FormatOptions {
  weight: 'normal' | 'semibold' | 'bold' | null;
  italic: boolean;
  underline: boolean;
  color: string | null;
  isValid: boolean;
}

interface LinkOptions extends FormatOptions {
  url: string;
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidUrl(value: string): boolean {
  const url = value.trim().toLowerCase();
  return (
    url.startsWith('https://') ||
    url.startsWith('http://') ||
    url.startsWith('mailto:')
  );
}

function parseFormatModifiers(parts: string[]): FormatOptions {
  let weight: FormatOptions['weight'] = null;
  let italic = false;
  let underline = false;
  let color: string | null = null;
  let isValid = false;

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (part === 'normal' || part === 'semibold' || part === 'bold') {
      weight = part;
      isValid = true;
    } else if (part === 'italic') {
      italic = true;
      isValid = true;
    } else if (part === 'underline') {
      underline = true;
      isValid = true;
    } else if (part.startsWith('color:')) {
      const candidate = part.slice(6);
      if (HEX_COLOR.test(candidate)) {
        color = candidate;
        isValid = true;
      }
    }
  }

  return { weight, italic, underline, color, isValid };
}

function parseLinkModifiers(spec: string): LinkOptions {
  const [url, ...parts] = spec.split('|');
  return { url: url.trim(), ...parseFormatModifiers(parts) };
}

function renderStyleToken(spec: string, content: string): string {
  const format = parseFormatModifiers(spec.split('|'));
  if (!format.isValid) return content;

  const styles: string[] = [];
  if (format.color) styles.push(`color:${format.color}`);
  if (format.weight === 'bold') styles.push('font-weight:700');
  else if (format.weight === 'semibold') styles.push('font-weight:600');
  else if (format.weight === 'normal') styles.push('font-weight:400');
  if (format.italic) styles.push('font-style:italic');
  if (format.underline) styles.push('text-decoration:underline');

  return `<span style="${styles.join(';')};">${content}</span>`;
}

function renderLinkToken(spec: string, content: string): string {
  const format = parseLinkModifiers(spec);
  if (!isValidUrl(format.url)) return content;

  const styles: string[] = [
    `color:${format.color || '#008867'}`,
    'text-decoration:underline',
  ];
  if (format.weight === 'bold') styles.push('font-weight:700');
  else if (format.weight === 'normal') styles.push('font-weight:400');
  else styles.push('font-weight:600');
  if (format.italic) styles.push('font-style:italic');

  return `<a href="${escapeText(format.url)}" style="${styles.join(';')};" target="_blank" rel="noopener noreferrer">${content}</a>`;
}

function renderSegment(input: string): string {
  const tokenPattern = new RegExp(TOKEN_PATTERN.source, 'g');
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(input)) !== null) {
    result += escapeText(input.slice(lastIndex, match.index));
    const [fullToken, type, spec, innerText] = match;
    const content = renderSegment(innerText);

    if (type === 'bold') {
      result += HEX_COLOR.test(spec)
        ? `<span style="color:${spec};font-weight:700;">${content}</span>`
        : escapeText(fullToken);
    } else if (type === 'style') {
      result += renderStyleToken(spec, content);
    } else {
      result += renderLinkToken(spec, content);
    }

    lastIndex = match.index + fullToken.length;
  }

  result += escapeText(input.slice(lastIndex));
  return result;
}

export function parseInlineFormatting(text: string): string {
  return renderSegment(text);
}

export interface InlineRun {
  text: string;
  weight?: "normal" | "semibold" | "bold";
  italic?: boolean;
  underline?: boolean;
  color?: string;
  href?: string;
}

const FORMAT_TOKEN = /\{\{(bold|style|link):([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function isSafeUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("https://") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("mailto:")
  );
}

export function normalizeLinkUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return isSafeUrl(withProtocol) ? withProtocol : null;
}

function sameFormat(left: InlineRun, right: InlineRun): boolean {
  return (
    left.weight === right.weight &&
    left.italic === right.italic &&
    left.underline === right.underline &&
    left.color === right.color &&
    left.href === right.href
  );
}

function appendRun(runs: InlineRun[], run: InlineRun) {
  if (!run.text) return;
  const previous = runs.at(-1);
  if (previous && sameFormat(previous, run)) {
    previous.text += run.text;
  } else {
    runs.push(run);
  }
}

function parseModifiers(spec: string): Omit<InlineRun, "text"> {
  const format: Omit<InlineRun, "text"> = {};

  for (const rawPart of spec.split("|")) {
    const part = rawPart.trim();
    if (part === "normal" || part === "semibold" || part === "bold") {
      format.weight = part;
    } else if (part === "italic") {
      format.italic = true;
    } else if (part === "underline") {
      format.underline = true;
    } else if (part.startsWith("color:")) {
      const color = part.slice(6);
      if (HEX_COLOR.test(color)) format.color = color;
    }
  }

  return format;
}

function parseSegment(
  input: string,
  inherited: Omit<InlineRun, "text">,
  runs: InlineRun[]
) {
  const tokenPattern = new RegExp(FORMAT_TOKEN.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(input)) !== null) {
    appendRun(runs, { ...inherited, text: input.slice(lastIndex, match.index) });

    const [fullToken, type, spec, innerText] = match;
    let format: Omit<InlineRun, "text"> = {};
    let valid = true;

    if (type === "bold") {
      valid = HEX_COLOR.test(spec);
      format = valid ? { weight: "bold", color: spec } : {};
    } else if (type === "style") {
      format = parseModifiers(spec);
      valid = Object.keys(format).length > 0;
    } else {
      const [url, ...modifierParts] = spec.split("|");
      valid = isSafeUrl(url);
      format = {
        ...parseModifiers(modifierParts.join("|")),
        ...(valid ? { href: url } : {}),
      };
    }

    if (!valid && type === "bold") {
      appendRun(runs, { ...inherited, text: fullToken });
    } else {
      parseSegment(innerText, { ...inherited, ...format }, runs);
    }

    lastIndex = match.index + fullToken.length;
  }

  appendRun(runs, { ...inherited, text: input.slice(lastIndex) });
}

export function parseInlineContent(content: string): InlineRun[] {
  const runs: InlineRun[] = [];
  parseSegment(content, {}, runs);
  return runs;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderText(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function runStyles(run: InlineRun): string {
  const styles: string[] = [];
  const color = run.color ?? (run.href ? "#008867" : undefined);

  if (color) styles.push(`color:${color}`);
  if (run.weight === "bold") styles.push("font-weight:700");
  else if (run.weight === "semibold" || (run.href && !run.weight)) {
    styles.push("font-weight:600");
  } else if (run.weight === "normal") styles.push("font-weight:400");
  if (run.italic) styles.push("font-style:italic");
  if (run.underline || run.href) styles.push("text-decoration:underline");

  return styles.join(";");
}

export function inlineContentToEditorHtml(content: string): string {
  return parseInlineContent(content)
    .map((run) => {
      const text = renderText(run.text);
      const style = runStyles(run);
      const data = [
        run.weight ? `data-inline-weight="${run.weight}"` : "",
        run.italic ? 'data-inline-italic="true"' : "",
        run.underline ? 'data-inline-underline="true"' : "",
        run.color ? `data-inline-color="${escapeHtml(run.color)}"` : "",
        run.href ? `data-inline-href="${escapeHtml(run.href)}"` : "",
      ]
        .filter(Boolean)
        .join(" ");

      if (run.href && isSafeUrl(run.href)) {
        return `<a href="${escapeHtml(run.href)}" ${data} style="${style}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      if (style || data) {
        return `<span ${data} style="${style}">${text}</span>`;
      }
      return text;
    })
    .join("");
}

function normalizeColor(value: string): string | undefined {
  const trimmed = value.trim();
  if (HEX_COLOR.test(trimmed)) return trimmed;

  const rgb = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!rgb) return undefined;
  return `#${rgb
    .slice(1, 4)
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

function collectRuns(
  node: Node,
  inherited: Omit<InlineRun, "text">,
  runs: InlineRun[]
) {
  if (node.nodeType === Node.TEXT_NODE) {
    appendRun(runs, { ...inherited, text: node.textContent ?? "" });
    return;
  }
  if (!(node instanceof HTMLElement)) return;

  const tag = node.tagName.toLowerCase();
  if (tag === "br") {
    appendRun(runs, { ...inherited, text: "\n" });
    return;
  }

  const format: Omit<InlineRun, "text"> = { ...inherited };
  const inlineWeight = node.dataset.inlineWeight;
  if (
    inlineWeight === "normal" ||
    inlineWeight === "semibold" ||
    inlineWeight === "bold"
  ) {
    format.weight = inlineWeight;
  }
  if (node.dataset.inlineItalic === "true") format.italic = true;
  else if (node.dataset.inlineItalic === "false") format.italic = false;
  if (node.dataset.inlineUnderline === "true") format.underline = true;
  else if (node.dataset.inlineUnderline === "false") format.underline = false;

  const dataColor = node.dataset.inlineColor;
  const cssColor = normalizeColor(node.style.color);
  const fontColor = tag === "font" ? normalizeColor(node.getAttribute("color") ?? "") : undefined;
  if (dataColor && HEX_COLOR.test(dataColor)) format.color = dataColor;
  else if (fontColor || cssColor) format.color = fontColor ?? cssColor;

  const fontWeight = node.style.fontWeight;
  if (tag === "b" || tag === "strong" || fontWeight === "bold" || Number(fontWeight) >= 700) {
    format.weight = "bold";
  } else if (Number(fontWeight) >= 600) {
    format.weight = "semibold";
  }
  if (tag === "i" || tag === "em" || node.style.fontStyle === "italic") {
    format.italic = true;
  }
  if (
    tag === "u" ||
    node.style.textDecoration.includes("underline") ||
    node.style.textDecorationLine.includes("underline")
  ) {
    format.underline = true;
  }
  if (tag === "a") {
    const href = node.getAttribute("href") ?? "";
    if (isSafeUrl(href)) format.href = href;
  }
  const inlineHref = node.dataset.inlineHref;
  if (inlineHref && isSafeUrl(inlineHref)) format.href = inlineHref;
  if (node.dataset.inlineUnlink === "true") {
    delete format.href;
    delete format.color;
    delete format.weight;
    format.underline = false;
  }

  node.childNodes.forEach((child) => collectRuns(child, format, runs));
}

export function editorElementToContent(root: HTMLElement): string {
  const runs: InlineRun[] = [];
  const children = Array.from(root.childNodes);

  children.forEach((child, index) => {
    collectRuns(child, {}, runs);
    if (
      child instanceof HTMLElement &&
      ["div", "p"].includes(child.tagName.toLowerCase()) &&
      index < children.length - 1 &&
      !runs.at(-1)?.text.endsWith("\n")
    ) {
      appendRun(runs, { text: "\n" });
    }
  });

  return serializeInlineRuns(runs);
}

export function serializeInlineRuns(runs: InlineRun[]): string {
  return runs
    .map((run) => {
      const modifiers: string[] = [];
      if (run.weight) modifiers.push(run.weight);
      if (run.italic) modifiers.push("italic");
      if (run.underline) modifiers.push("underline");
      if (run.color && HEX_COLOR.test(run.color)) modifiers.push(`color:${run.color}`);

      if (run.href && isSafeUrl(run.href)) {
        const spec = [run.href, ...modifiers].join("|");
        return `{{link:${spec}}}${run.text}{{/link}}`;
      }
      if (modifiers.length > 0) {
        return `{{style:${modifiers.join("|")}}}${run.text}{{/style}}`;
      }
      return run.text;
    })
    .join("");
}

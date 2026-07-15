// Robust JSON extraction/repair for LLM output.
//
// Models routinely emit JSON wrapped in prose, fenced in ```json, with trailing
// commas, smart quotes, or truncated mid-structure when they hit the token limit.
// A bare JSON.parse() throws on all of these ("Unexpected non-whitespace character
// after JSON", "Expected ',' or '}'…"). These helpers recover the payload.

import { stripThinkTags } from './openrouter';

/**
 * Scan `text` from the first `{`/`[` and return exactly one complete, balanced
 * JSON value — respecting string literals and escapes so braces inside strings
 * don't confuse the depth counter. If the value is never closed (truncation),
 * returns everything from the opening bracket so the repair step can finish it.
 */
function firstBalanced(text: string): string | null {
  let startIdx = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{' || text[i] === '[') { startIdx = i; break; }
  }
  if (startIdx === -1) return null;

  const open = text[startIdx];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;

  for (let i = startIdx; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return text.slice(startIdx, i + 1);
    }
  }
  // Unbalanced → truncated. Hand the tail to repair().
  return text.slice(startIdx);
}

/**
 * Best-effort repair of a nearly-valid JSON string:
 *  - strips trailing commas before } or ]
 *  - closes an unterminated string
 *  - appends any missing closing brackets/braces (in the right order) for
 *    responses truncated at the token limit
 */
function repair(input: string): string {
  let t = input.trim();
  t = t.replace(/,\s*([}\]])/g, '$1'); // trailing commas

  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else if (c === '}' || c === ']') stack.pop();
  }

  if (inStr) t += '"';           // close a dangling string
  t = t.replace(/,\s*$/, '');    // trailing comma at very end
  while (stack.length) t += stack.pop(); // close open containers, innermost first
  return t;
}

/**
 * Escape raw control characters (newlines, tabs, …) that appear *inside* JSON
 * string literals — a very common LLM mistake ("body": "line1<newline>line2")
 * that makes JSON.parse throw "Bad control character in string literal".
 */
function escapeCtrlInStrings(s: string): string {
  let out = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) { out += c; esc = false; continue; }
      if (c === '\\') { out += c; esc = true; continue; }
      if (c === '"') { out += c; inStr = false; continue; }
      if (c === '\n') { out += '\\n'; continue; }
      if (c === '\r') { out += '\\r'; continue; }
      if (c === '\t') { out += '\\t'; continue; }
      out += c;
      continue;
    }
    if (c === '"') inStr = true;
    out += c;
  }
  return out;
}

/**
 * Parse JSON out of raw LLM text. Tries, in order: the balanced slice as-is,
 * a repaired version, control-char-escaped variants, and finally the whole
 * cleaned string. Throws only if every attempt fails.
 */
export function parseAIJson<T = unknown>(raw: string): T {
  const cleaned = stripThinkTags(raw)
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const balanced = firstBalanced(cleaned) ?? cleaned;

  const candidates = [
    balanced,
    repair(balanced),
    escapeCtrlInStrings(balanced),
    repair(escapeCtrlInStrings(balanced)),
    cleaned,
    repair(cleaned),
  ];
  let lastErr: unknown;
  for (const c of candidates) {
    try {
      return JSON.parse(c) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `Could not parse AI JSON: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`,
  );
}

/** Like parseAIJson but returns `fallback` instead of throwing. */
export function tryParseAIJson<T = unknown>(raw: string, fallback: T): T {
  try {
    return parseAIJson<T>(raw);
  } catch {
    return fallback;
  }
}

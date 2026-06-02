// ============================================================
// Structural Repair — Fix malformed/truncated JSON
// ============================================================

/**
 * Attempt to repair malformed JSON.
 * Purely deterministic: close unclosed brackets, extract valid portions.
 */
export function repairStructural(rawOutput: unknown): {
  repaired: Record<string, unknown> | null;
  details: string;
} {
  // If it's already a valid object, nothing to repair
  if (typeof rawOutput === 'object' && rawOutput !== null && !Array.isArray(rawOutput)) {
    return { repaired: rawOutput as Record<string, unknown>, details: 'Already valid object' };
  }

  // If it's a string, try to parse/fix it
  if (typeof rawOutput === 'string') {
    let text = rawOutput.trim();

    // Strip markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      text = jsonMatch[1].trim();
    }

    // Try direct parse first
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        return { repaired: parsed, details: 'Parsed after stripping markdown' };
      }
    } catch {
      // Continue with repair attempts
    }

    // Attempt to close unclosed brackets/braces
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of text) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    // Close unclosed strings
    if (inString) {
      text += '"';
    }

    // Remove trailing comma before closing
    text = text.replace(/,\s*$/, '');

    // Close unclosed brackets and braces
    while (openBrackets > 0) {
      text += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      text += '}';
      openBraces--;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        return { repaired: parsed, details: `Closed ${openBraces} braces, ${openBrackets} brackets` };
      }
    } catch {
      // Final fallback: try to find the first complete JSON object
      const firstBrace = text.indexOf('{');
      if (firstBrace >= 0) {
        let depth = 0;
        let end = -1;
        for (let i = firstBrace; i < text.length; i++) {
          if (text[i] === '{') depth++;
          if (text[i] === '}') depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
        if (end > firstBrace) {
          try {
            const extracted = JSON.parse(text.substring(firstBrace, end + 1));
            return { repaired: extracted, details: 'Extracted first complete JSON object' };
          } catch {
            // Give up
          }
        }
      }
    }
  }

  return { repaired: null, details: 'Structural repair failed — could not extract valid JSON' };
}

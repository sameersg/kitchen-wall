import { ShoppingCategory } from '../types';

// Units that may follow a leading quantity ("200 g Mehl", "2 EL Öl", "1 Bund Basilikum")
const UNITS = [
  'kg', 'g', 'gr', 'mg', 'l', 'ml', 'cl', 'dl', 'el', 'tl', 'msp', 'prise', 'prisen', 'stk', 'stück', 'stueck',
  'bund', 'dose', 'dosen', 'glas', 'gläser', 'packung', 'packungen', 'pck', 'päckchen', 'becher', 'tasse', 'tassen',
  'scheibe', 'scheiben', 'zehe', 'zehen', 'knolle', 'knollen', 'handvoll', 'beutel', 'flasche', 'flaschen', 'kopf',
  'köpfe', 'stange', 'stangen', 'zweig', 'zweige', 'blatt', 'blätter', 'würfel'
];

const QUANTITY = String.raw`(?:\d+(?:[.,]\d+)?(?:\s*[-–/]\s*\d+(?:[.,]\d+)?)?|[½¼¾⅓⅔]|ein(?:e|en)?|zwei|drei|vier|fünf|etwas|n\.\s?b\.)`;
const UNIT = `(?:${UNITS.join('|')})\\.?`;
const LEADING_AMOUNT = new RegExp(`^(${QUANTITY}(?:\\s*${UNIT})?)\\s+(.+)$`, 'i');
const TRAILING_AMOUNT = new RegExp(`^(.+?)\\s*\\((${QUANTITY}(?:\\s*${UNIT})?)\\)$`, 'i');

export interface ParsedIngredient {
  name: string;
  amount: string;
}

/** Splits "200 g Mehl" / "Mehl (200 g)" into name and amount. */
export function parseIngredient(raw: string): ParsedIngredient {
  const text = raw.replace(/^[-•*]\s*/, '').replace(/\s+/g, ' ').trim();
  const leading = text.match(LEADING_AMOUNT);
  if (leading) return { name: leading[2].trim(), amount: leading[1].trim() };
  const trailing = text.match(TRAILING_AMOUNT);
  if (trailing) return { name: trailing[1].trim(), amount: trailing[2].trim() };
  return { name: text, amount: '' };
}

/** Splits a free-text ingredient field (one per line, or separated by ";" or ","), keeping "1,5 kg" intact. */
export function splitIngredientText(text: string): string[] {
  return text
    .split(/\n|;|,(?!\d)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Store section for an ingredient; mirrors the categories the server uses for Bring! items. */
export function categorizeIngredient(name: string): ShoppingCategory {
  const n = name.toLowerCase().trim();

  if (/apfel|äpfel|banan|birn|erdbeer|beere|salat|tomat|gurk|kartoffel|zwiebel|knoblauch|karott|möhre|paprika|avocado|zitrone|limette|orange|spinat|kohl|pilz|champignon|ingwer|zucchini|kürbis|brokkoli|lauch|sellerie|obst|gemüse|kräuter|koriander|basilikum|petersilie|minze|rucola|chili/.test(n)) {
    return 'gemuese';
  }
  if (/milch|butter|käse|feta|mozzarella|burrata|parmesan|gouda|cheddar|joghurt|quark|sahne|schmand|\beier?\b|frischkäse|tofu|fleisch|hähnchen|huhn|rind|schwein|hack|wurst|schinken|speck|lachs|fisch|garnele/.test(n)) {
    if (/erdnussbutter|mandelbutter|nussbutter|kokosmilch/.test(n)) return 'vorrat';
    return 'kuehlregal';
  }
  if (/\bbrot\b|brötchen|toast|croissant|baguette|semmel|brezel|wraps?\b|tortilla|bun\b/.test(n)) {
    return 'baeckerei';
  }
  if (/wasser|saft|cola|bier|wein|kaffee|\btee\b|limo|sprudel|hafermilch|sojamilch/.test(n)) {
    return 'getraenke';
  }
  if (/papier|spül|reiniger|müll|seife|shampoo|zahnpasta|waschmittel|küchenrolle|serviette|folie/.test(n)) {
    return 'haushalt';
  }
  return 'vorrat';
}

/** Normalized key to recognise the same product regardless of case/spacing. */
export function ingredientKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}
